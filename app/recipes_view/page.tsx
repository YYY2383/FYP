"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchRecipe } from "@/utils/fetch";

export default function RecipesView() {
  const router = useRouter(); 
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeUrl, setRecipeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      fetchRecipes(currentUser.uid);
    });
  
    return () => unsubscribe();
  }, [auth, router]);

  // Fetch recipes when user state updates
  const fetchRecipes = async (userId: string) => {
    try {
      const q = query(collection(db, "recipes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const recipesList: any[] = [];
      querySnapshot.forEach((doc) => {
        recipesList.push({ id: doc.id, ...doc.data() });
      });
      setRecipes(recipesList);
    } catch (error: any) {
      console.error("Error adding recipe:", error.message || error);
      setError("Failed to fetch recipe. Please check the URL.");
    }
  };

  // Handle recipe URL input change
  const handleAddRecipe = async () => {
    if (!recipeUrl || !user) return;
    setLoading(true);
    setError(null);
    console.log("Fetching recipe for URL:", recipeUrl);
    try {
      const recipeData = await fetchRecipe(recipeUrl);
      console.log("Recipe Data:", recipeData);

      const newRecipe = {
        name: recipeData.title,
        prepTime: recipeData.readyInMinutes,
        cookTime: recipeData.cookingMinutes || 0,
        servings: recipeData.servings,
        image: recipeData.image,
        ingredients: recipeData.extendedIngredients?.map((ing: any) => ({
          ingredient: ing.name || ing.original, 
          quantity: ing.amount || 0,
          unit: ing.unit || ""
        })) || [],
        steps: recipeData.instructions
          ? recipeData.instructions
              .split('\n')
              .filter((step: string) => step.trim() !== "") 
              .map((step: string, index: number) => ({
                stepNo: index + 1,
                stepDesc: step
              }))
          : [],
        userId: user.uid
      };

      const docRef = await addDoc(collection(db, "recipes"), newRecipe);
      const newRecipeWithId = { id: docRef.id, ...newRecipe };
      setRecipes((prevRecipes) => [...prevRecipes, newRecipeWithId]);
      setRecipeUrl("");
    } catch (error) {
      console.error("Error adding recipe:", error);
      setError("Failed to fetch recipe. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter recipes based on the search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className='main'>
      <div className='main_container'>
        <h1 className="appName">ReciPal</h1>
        
        <div className='body'>
          <div>
            <Navbar />
          </div>

          <div className="links">
            <label className="linkName">Links: </label>
            <input
              type="text"
              placeholder="Insert the recipe's link here"
              className="linkBox"
              value={recipeUrl || ""}
              onChange={(e) => setRecipeUrl(e.target.value)}
            />
            <button className="linkButton" onClick={handleAddRecipe} disabled={loading}>
              <span className="button__text">{loading ? "Adding..." : "Add Link"}</span>
              {!loading && (
                <span className="button__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    className="svg"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
              )}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>  

          <div className="search_container">
            <h3 className="recipe">Recipes</h3>
            <input
              type="text"
              placeholder="Search recipes"
              className="search_input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          
          <div className="recipeList">
            {filteredRecipes.length > 0 ? (
              <div className="recList">
                <ul className="rList">
                  {filteredRecipes.map((recipe) => (
                    <li 
                      key={recipe.id} 
                      className="recipeBox" 
                      onClick={() => user ? router.push(`/recipe_details/${recipe.id}`) : router.push("/login")}>
                      <h4 className="rName">{recipe.name}</h4>
                      <p><strong>Prep time: </strong> {recipe.prepTime} <strong> minute</strong></p>
                      <p><strong>Cook time: </strong>{recipe.cookTime} <strong> minute</strong></p>
                      <p><strong>Servings: </strong>{recipe.servings} <strong> servings</strong></p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No recipes found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
