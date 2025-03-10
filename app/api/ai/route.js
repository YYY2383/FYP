import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { type, ingredient, recipe, userInput } = await request.json();
    console.log("Received request with data:", { type, ingredient, recipe, userInput });
    console.log("API Key:", process.env.DEEPSEEK_API_KEY);

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing");
    }

    let prompt = "";

    if (type === "recipe") {
      prompt = `Modify the following recipe to fit the user's dietary restrictions: ${userInput}. 
      Ensure the output is JSON and includes:
      - "name": Recipe name
      -"prepTime": Preparation time
      - "cookTime": Cooking time
      - "servings": Number of servings
      - "ingredients": A list of ingredients with correct measurements
      - "steps": Step-by-step instructions.
      Original Recipe: ${JSON.stringify(recipe)}.
      Return only valid JSON.`;
    } else {
      throw new Error("Invalid type");
    }

    const explanation = await generateAIResponse(prompt, apiKey);

    if (type === "recipe") {
      try {
        return NextResponse.json(explanation); // No need to parse again
      } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
      }
    }

    return NextResponse.json({
      name: type === "ingredient" ? ingredient : recipe.name,
      explanation,
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}

async function generateAIResponse(prompt, apiKey) {
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
            Respond **only** with a valid JSON object containing the following fields:
            - **name** (string) - Name of the recipe  
            - **prepTime** (integer) - Preparation time (e.g., "15")  
            - **cookTime** (integer) - Cooking time (e.g., "30")  
            - **servings** (integer) - Number of servings  
            - **ingredients** (array of objects) - Each object contains:
              - **quantity** (string) - Amount of the ingredient  
              - **ingredient** (string) - Name of the ingredient  
              - **unit** (string) - Measurement unit (optional)  
            - **steps** (array of objects) - Each object contains:
              - **stepNo** (integer) - Step number  
              - **stepDesc** (string) - Description of the step  

            **DO NOT** include markdown, explanations, or extra text.  
            **ONLY return raw JSON.**`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("API Error Response:", errorDetails);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
    }

    const data = await response.json();
    console.log("Raw AI Response:", data);

    if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid API response: No choices returned");
    }

    const message = data.choices[0]?.message;
    if (!message || !message.content) {
      console.error("Invalid API response: Missing 'message.content'", data);
      throw new Error("AI response is missing expected content");
    }

    let aiResponse = message.content.trim();
    aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("Cleaned API Response:", aiResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      console.log("Parsed AI Response:", parsedResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Response:", aiResponse);
      throw new Error("AI response is not valid JSON");
    }

    // Ensure AI response has required fields
    const requiredFields = ["name", "prepTime", "cookTime", "servings", "ingredients", "steps"];
    const missingFields = requiredFields.filter(field => parsedResponse[field] === undefined || parsedResponse[field] === null);

    if (missingFields.length > 0) {
      console.error("Missing required fields in AI response:", missingFields, parsedResponse);
      console.log("Full AI Response:", parsedResponse); // Log the full response for debugging
      throw new Error(`Invalid AI response format: Missing fields - ${missingFields.join(", ")}`);
    }

    return parsedResponse;
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    throw error;
  }
}