export async function fetchRecipe(recipeUrl) {
    const response = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeUrl }),
        
    });
    

    if (!response.ok) throw new Error("Failed to fetch recipe!!!");

    console.log("Using API Key:", process.env.SPOONACULAR_API_KEY);

    return response.json();
}
