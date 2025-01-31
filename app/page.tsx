"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {useEffect, useState} from "react"
import Navbar from "../components/navbar"
import {db} from './firebaseConfig'
import {collection, getDocs} from 'firebase/firestore'
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter(); 

   // State to store recipes
   const [recipes, setRecipes] = useState<any[]>([]);

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

          {/* places to display recipes */}
          <h3 className="recipe">Recipes</h3>

          <div className="recipeList">
          {recipes.length > 0 ? (
                <div className="recList">
                  <ul className="rList">
                    {recipes.map((recipe) => (
                      <li key={recipe.id} className="recipeBox" onClick={() => router.push(`/recipe_view/${recipe.id}`)}>
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