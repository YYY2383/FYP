// app/api/find/route.js

export async function POST(req) {
    const { recipeUrl } = await req.json();
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!recipeUrl) {
        return new Response(JSON.stringify({ error: "Recipe URL is required" }), { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/extract?apiKey=${apiKey}&url=${encodeURIComponent(recipeUrl)}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch recipe");
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
