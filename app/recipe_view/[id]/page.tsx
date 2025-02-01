"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Navbar from "../../../components/navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../firebaseConfig";
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
        <h1 className="appName">Food Compiler</h1>
        <div>
          <Navbar />
        </div>

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

<div className="buttons">
        <button className="button" onClick={() => router.push("/")}>
          <svg className="svgIcon" viewBox="0 0 384 512">
            <path
              d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
            ></path>
          </svg>
        </button>

        <button className="edit-button" onClick={() => router.push(`/recipe_edit/${recipe.id}`)}>
          <svg className="edit-svgIcon" viewBox="0 0 512 512">
              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
          </svg>
        </button>

</div>
        
      </div>
    </main>
  );
}
