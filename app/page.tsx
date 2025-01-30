"use client";
import React, {useEffect, useState} from "react"
import Navbar from "../components/navbar"
import {db} from './firebaseConfig'
import {collection, getDocs} from 'firebase/firestore'


export default function Home() {
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
            <h2>This is the HOME PAGE!!!!! aksjdajsjdklajdkajlksdjalkdjakljsdlks</h2>
          </div>

          {/* places to display recipes */}
          <h3 className="recipe">Recipes</h3>

          <div className="recipeList">
          {recipes.length > 0 ? (
                <div className="recList">
                  <ul className="rList">
                    {recipes.map((recipe) => (
                      <li key={recipe.id} className="recipeBox">
                        <h4 className="rName">{recipe.name}</h4>
                        <p className="pTime">Prep time: {recipe.prepTime}</p>
                        <p className="cTime">Cook time: {recipe.cookTime}</p>
                        <p className="serve">Servings: {recipe.servings}</p>

                        
                        <h5 className="ing">Ingredients:</h5>
                        <ul>
                          {recipe.ingredients.map((ingredient: any, index: number) => (
                            <li key={index}>
                              {ingredient.quantity} {ingredient.unit} of {ingredient.ingredient}
                            </li>
                          ))}
                        </ul>

                       
                        <h5 className="step">Steps:</h5>
                        <ol className="stepShow">
                          {recipe.steps.map((step: any, index: number) => (
                            <li key={index}>
                              Step {step.stepNo}: {step.stepDesc}
                            </li>
                          ))}
                        </ol>
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