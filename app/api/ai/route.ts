// app/api/ai/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { ingredient } = await request.json();

  if (!ingredient) {
    return NextResponse.json({ error: "Ingredient is required" }, { status: 400 });
  }

  try {
    // Call DeepSeek-V3 API with the API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log("API Key:", process.env.DEEPSEEK_API_KEY);
    if (!apiKey) {
      throw new Error("API key is missing");
    }

    const prompt = `Provide a short explanation for the selected ingredient, and suitable replacements for vegan, or any other dietary restriction for the ingredient: ${ingredient}.`;
    const explanation = await generateAIResponse(prompt, apiKey);

    return NextResponse.json({ name: ingredient, explanation, vegan: "Yes", vegetarian: "Yes" });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json({ error: "Failed to fetch ingredient details" }, { status: 500 });
  }
}
async function generateAIResponse(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides ingredient replacements and explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "deepseek-v3",
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("API Error Details:", errorDetails);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response Data:", data); // Log the response data
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    throw error;
  }
}