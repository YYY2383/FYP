"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../firebaseConfig"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";

export default function RecipeDetails() {
  const params = useParams(); 
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeId = params?.id as string; 
      if (!recipeId) return;

      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Recipe not found");
          router.push("/"); 
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [params, router]);

  if (!recipe) return <p>Loading recipe...</p>;

  return (
    <main className="main">
      <div className="container">
        <h1 className="showName">{recipe.name}</h1>

        <div className="show_prepTime">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                <path d="M13.7678 12.2288L15.8892 14.3501C11.293 18.9463 5.63612 20.3605 2.10059 19.6534L17.6569 4.09705L19.7783 6.21837L13.7678 12.2288Z"></path>
            </svg>
            <b>Prep Time: </b>
            <div>
              <p className="pTime">{recipe.prepTime}</p>
            </div>
            <p>minutes</p>
        </div>
        <div className="show_cookTime">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="m4 8 16-4"></path><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"></path></svg>
            <b>Cook Time: </b>
            <div>
              <p className="cTime">{recipe.cookTime}</p>
            </div>
            <p>minutes</p>    
        </div>
        <div className="show_servings">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.597 3.2A1 1 0 0 0 7.04 4.289a3.49 3.49 0 0 1 .057 1.795 3.448 3.448 0 0 1-.84 1.575.999.999 0 0 0-.077.094c-.596.817-3.96 5.6-.941 10.762l.03.049a7.73 7.73 0 0 0 2.917 2.602 7.617 7.617 0 0 0 3.772.829 8.06 8.06 0 0 0 3.986-.975 8.185 8.185 0 0 0 3.04-2.864c1.301-2.2 1.184-4.556.588-6.441-.583-1.848-1.68-3.414-2.607-4.102a1 1 0 0 0-1.594.757c-.067 1.431-.363 2.551-.794 3.431-.222-2.407-1.127-4.196-2.224-5.524-1.147-1.39-2.564-2.3-3.323-2.788a8.487 8.487 0 0 1-.432-.287Z"/>
          </svg>
          <b>Servings: </b>
          <div>
            <p className="serv">{recipe.servings}</p>
          </div>
          <p>servings</p>
        </div> 
        
        <div className="details">
          <div className="ingredients">
            <b className="showIhead">Ingredients</b>
            <div className="IngList">
              <table className="ingTable">
                  <thead>
                      <tr>
                          <th className="qh">Quantity</th>
                          <th className="uh">Unit</th>
                          <th className="ih">Ingredient</th>
                      </tr>
                  </thead>
                  <tbody>
                  {recipe.ingredients?.map((item: { ingredient: string; quantity: number; unit: string }, index: number) => (
                          <tr key={index}>
                              <td className="showQuantity">
                                  {item.quantity}
                              </td>
                              <td className="showUnit">
                                  {item.unit}
                              </td>
                              <td className="showIng">
                                  {item.ingredient}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          </div>
        </div>  
        
        
        <div className="steps">
            <b className="showShead">Steps</b>
        <div className="step_list">
        <table className="stepTable">
          <thead>
            <tr>
              <th className="stepH">Step</th>
              <th className="stepDH">Description</th>

            </tr>
          </thead>
          <tbody>  
          {recipe.steps?.map((step: {stepNo: number; stepDesc: string}, index: number) => (
            <tr key={index}>
              <td className="showNo">{step.stepNo}</td>
              <td className="showDesc">{step.stepDesc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>

        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    </main>
  );
}
