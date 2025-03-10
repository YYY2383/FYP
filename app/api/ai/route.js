import { NextResponse } from "next/server";

export const config = {
  runtime: "edge", // Enables Vercel Edge Functions (30s timeout)
};

export async function POST(request) {
  try {
    const { type, ingredient, recipe, userInput } = await request.json();
    console.log("Received request with data:", { type, ingredient, recipe, userInput });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    let prompt = "";

    if (type === "recipe") {
      prompt = `Modify the following recipe to fit the user's dietary restrictions: ${userInput}. 
      Ensure the output is JSON and includes:
      - "name": Recipe name
      - "prepTime": Preparation time
      - "cookTime": Cooking time
      - "servings": Number of servings
      - "ingredients": A list of ingredients with correct measurements
      - "steps": Step-by-step instructions.
      Original Recipe: ${JSON.stringify(recipe)}.
      Return only valid JSON.`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const explanation = await generateAIResponse(prompt, apiKey);

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}

async function generateAIResponse(prompt, apiKey) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are an expert AI chef. Your task is to modify recipes based on dietary restrictions.  
              Respond **only** with a valid JSON object containing:
              - "name" (string) - Recipe name  
              - "prepTime" (integer) - Preparation time  
              - "cookTime" (integer) - Cooking time  
              - "servings" (integer) - Number of servings  
              - "ingredients" (array of objects): Each contains "quantity" (string), "ingredient" (string), "unit" (optional)  
              - "steps" (array of objects): Each contains "stepNo" (integer), "stepDesc" (string)  
              
              **DO NOT** include markdown, explanations, or extra text.  
              **ONLY return raw JSON.**`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("API Error Response:", errorDetails);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw AI Response:", data);

      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid API response: No choices returned");
      }

      const aiResponse = data.choices[0]?.message?.content?.trim();
      if (!aiResponse) {
        throw new Error("AI response is missing expected content");
      }

      const cleanedResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      console.log("Cleaned API Response:", cleanedResponse);

      let parsedResponse = JSON.parse(cleanedResponse);
      console.log("Parsed AI Response:", parsedResponse);

      const requiredFields = ["name", "prepTime", "cookTime", "servings", "ingredients", "steps"];
      const missingFields = requiredFields.filter(field => parsedResponse[field] === undefined);

      if (missingFields.length > 0) {
        throw new Error(`Invalid AI response: Missing fields - ${missingFields.join(", ")}`);
      }

      return parsedResponse;
    } catch (error) {
      console.error(`Error in generateAIResponse (attempt ${attempt + 1}):`, error);
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
    }
  }
}
