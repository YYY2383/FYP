"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {useEffect, useState} from "react"
import Navbar from "../components/navbar"
import {db} from './firebaseConfig'
import {collection, getDocs, addDoc} from 'firebase/firestore'
import { useRouter } from "next/navigation";
import {fetchRecipe} from '@/utils/fetch'


export default function Home() {
  const router = useRouter(); 

   // State to store recipes
   const [recipes, setRecipes] = useState<any[]>([]);

   const [recipeUrl, setRecipeUrl] = useState("");
   const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   // Fetch recipes when the component mounts
   useEffect(() => {
     const fetchRecipes = async () => {
       try {
         const querySnapshot = await getDocs(collection(db, "recipes")); // Adjust "recipes" to your Firestore collection name
         const recipesList: any[] = [];
         querySnapshot.forEach((doc) => {
           recipesList.push({ id: doc.id, ...doc.data() });
         });
         setRecipes(recipesList);
       } catch (error) {
         console.error("Error fetching recipes:", error);
       }
     };
 
     fetchRecipes();
   }, []);



   const handleAddRecipe = async () => {
    if (!recipeUrl) return;
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
          : []
      };
  
      await addDoc(collection(db, "recipes"), newRecipe);
      setRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
      setRecipeUrl("");
    } catch (error) {
      console.error("Error adding recipe:", error);
      setError("Failed to fetch recipe. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <main className='main'>
      <div className='container'>
        <h1 className="appName">Food Compiler</h1>
        
        <div className = 'body'>
          <div>
            <Navbar />
          </div>

          <div className = 'head'>
            <h2>This is the HOME PAGE!!!!!</h2>
          </div>

          {/* place to insert links */}
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

          {/* places to display recipes */}
          <h3 className="recipe">Recipes</h3>

          <div className="recipeList">
          {recipes.length > 0 ? (
                <div className="recList">
                  <ul className="rList">
                    {recipes.map((recipe, index) => (
                      <li key={recipe.id || index} className="recipeBox" onClick={() => router.push(`/recipe_view/${recipe.id}`)}>
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