"use client"
    
import React, {useEffect, useState} from "react"
import Navbar from "../../components/navbar"
import {db} from '../firebaseConfig'
import {collection, addDoc} from 'firebase/firestore'
import { useRouter } from "next/navigation"
import {getAuth, onAuthStateChanged, User} from 'firebase/auth'

    export default function Create() {
        const router = useRouter();
        const [user, setUser] = useState<User | null>(null);

        useEffect(() => {
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUser(user);
                } else {
                    setUser(null);
                }
            });
    
            return () => unsubscribe();
        }, []);

        const [recipe, setRecipe] = useState({
            name: '',
            prepTime: '',
            cookTime: '',
            servings: '',
            ingredients: [{ quantity: "", unit: "millilitre", ingredient: "" }],
            steps: [{ stepNo: "1", stepDesc: "" }],
          });
          
          const [loading, setLoading] = useState(false);

  // Generic Input Handler
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setRecipe((prev) => ({ ...prev, [name]: value }));
        };

  // Handler for Ingredients & Steps
        const handleArrayChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
            index: number,
            type: "ingredients" | "steps"
        ) => {
            const { name, value } = e.target;
            setRecipe((prev) => {
            const updatedArray = [...prev[type]];
            updatedArray[index] = { ...updatedArray[index], [name]: value };
            return { ...prev, [type]: updatedArray };
        });
    };

  // Adding a new ingredient or step
        const addArrayField = (type: "ingredients" | "steps") => {
            setRecipe((prev) => ({
                ...prev,
                [type]: [
                    ...prev[type],
                    type === "ingredients"
                        ? { quantity: "", unit: "millilitre", ingredient: "" }
                        : { stepNo: (prev.steps.length + 1).toString(), stepDesc: "" },
                ],
            }));
        };


                // Removing an ingredient or step
        const removeArrayField = (index: number, type: "ingredients" | "steps") => {
            setRecipe((prev) => {
                const updatedArray = prev[type].filter((_, i) => i !== index);
                // Re-number steps properly after deletion
                const reindexedArray =
                    type === "steps"
                        ? updatedArray.map((step, i) => ({
                            ...step,
                            stepNo: (i + 1).toString(),
                        }))
                        : updatedArray;
                return { ...prev, [type]: reindexedArray };
            });
        };  
                
// Submit Recipe to Firebase
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            try {
                if (!user) {
                    alert("You must be logged in to submit a recipe.");
                    setLoading(false);
                    return;
                }

                const recipeWithUserId = { ...recipe, userId: user.uid };
                await addDoc(collection(db, "recipes"), recipeWithUserId);
                alert("Recipe added successfully!");
                setRecipe({
                    name: "",
                    prepTime: "",
                    cookTime: "",
                    servings: "",
                    ingredients: [{ quantity: "", unit: "millilitre", ingredient: "" }],
                    steps: [{ stepNo: "1", stepDesc: "" }],
                });
                setLoading(false);
                // Delay the redirection to ensure it happens after the component renders
                setTimeout(() => {
                    router.push("/recipes_view"); // Navigate to home page after 300ms
                }, 300);
            } catch (error) {
                console.error("Error adding recipe:", error);
                setLoading(false);
            }
        };
        
        const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const { name, value } = e.target;
            setRecipe((prev) => {
                const updatedSteps = [...prev.steps];
                updatedSteps[index] = { ...updatedSteps[index], [name]: value };
                return { ...prev, steps: updatedSteps };
            });
        };
        
        const deleteStep = (index: number) => {
            setRecipe((prev) => {
                const updatedSteps = prev.steps.filter((_, i) => i !== index);
                const reindexedSteps = updatedSteps.map((step, i) => ({
                    ...step,
                    stepNo: (i + 1).toString(),
                }));
                return { ...prev, steps: reindexedSteps };
            });
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
                        <h2>Create Your Own Unique Recipe!!</h2>
                        <p>Enter the ingredients you have in your fridge and we will provide you with a list of recipes you can make with them!</p>

{/* This is where the main body starts */}
                        <div className="details">

                            {/* Location to insert recipe name */}
                            <div className="recipeName">
                                <label>Recipe Name:</label>
                                <input type="text" id="recipeName" name="name" value={recipe.name} onChange={handleChange} />
                            </div>

                            {/* Location to add prep time, cooking time, and no. of servings */}
                            <div className="prepTime">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                                    <path d="M13.7678 12.2288L15.8892 14.3501C11.293 18.9463 5.63612 20.3605 2.10059 19.6534L17.6569 4.09705L19.7783 6.21837L13.7678 12.2288Z"></path>
                                </svg>
                                <b>Prep Time: </b>
                                <div>
                                    <input type="number" placeholder="0" id="prepTime" name="prepTime" value={recipe.prepTime} onChange={handleChange}/>
                                </div>
                                <p><strong>minutes</strong></p>
                            </div>
                            <div className="cookTime">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="m4 8 16-4"></path><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"></path></svg>
                                <b>Cook Time: </b>
                                <div>
                                    <input type="number" placeholder="0" id="cookTime" name="cookTime" value={recipe.cookTime} onChange={handleChange} />
                                </div>
                                <p><strong>minutes</strong></p>    
                            </div>
                            <div className="servings">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.597 3.2A1 1 0 0 0 7.04 4.289a3.49 3.49 0 0 1 .057 1.795 3.448 3.448 0 0 1-.84 1.575.999.999 0 0 0-.077.094c-.596.817-3.96 5.6-.941 10.762l.03.049a7.73 7.73 0 0 0 2.917 2.602 7.617 7.617 0 0 0 3.772.829 8.06 8.06 0 0 0 3.986-.975 8.185 8.185 0 0 0 3.04-2.864c1.301-2.2 1.184-4.556.588-6.441-.583-1.848-1.68-3.414-2.607-4.102a1 1 0 0 0-1.594.757c-.067 1.431-.363 2.551-.794 3.431-.222-2.407-1.127-4.196-2.224-5.524-1.147-1.39-2.564-2.3-3.323-2.788a8.487 8.487 0 0 1-.432-.287Z"/>
                                </svg>
                                <b>Servings: </b>
                                <div>
                                    <input type="number" placeholder="0" id="servings" name="servings" value={recipe.servings} onChange={handleChange}/>
                                </div>
                                <p><strong>servings</strong></p>
                            </div>  


                            {/* Location to add ingredient list */}
                            <div className="ingredients">
                                <b className="ingHead">Ingredients</b>
                                <div className="ing_list">
                                    <table className="ingTable">
                                        <thead>
                                            <tr>
                                                <th className="qh">Quantity</th>
                                                <th className="uh">Unit</th>
                                                <th className="ih">Ingredient</th>
                                                <th className="dh"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recipe.ingredients.map((ingredient, index) => (
                                                <tr key={index}>
                                                    <td className="quantity">
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            value={ingredient.quantity}
                                                            onChange={(e) => handleArrayChange(e, index, "ingredients")}
                                                        />
                                                    </td>
                                                    <td className="unit">
                                                        <select
                                                            name="unit"
                                                            value={ingredient.unit}
                                                            onChange={(e) => handleArrayChange(e, index, "ingredients")}
                                                        >
                                                            <option value="millilitre">Millilitre</option>
                                                            <option value="litre">Litre</option>
                                                            <option value="teaspoon">Teaspoon</option>
                                                            <option value="tablespoon">Tablespoon</option>
                                                            <option value="cup">Cup</option>
                                                            <option value="kilogram">Kilogram</option>
                                                            <option value="gram">Gram</option>
                                                            <option value="ounce">Ounce</option>
                                                        </select>
                                                    </td>
                                                    <td className="ing">
                                                        <input
                                                        type="text"
                                                        name="ingredient"
                                                        value={ingredient.ingredient}
                                                        onChange={(e) => handleArrayChange(e, index, "ingredients")}
                                                        />
                                                    </td>
                                                    <td className="deleteIng">
                                                        <button
                                                            className="deleteButton"
                                                            onClick={() => removeArrayField(index, "ingredients")}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 50 59"
                                                                className="bin"
                                                            >
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
                                                                ></path>
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
                                                                ></path>
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
                                                                    clipRule="evenodd"
                                                                    fillRule="evenodd"
                                                                ></path>
                                                                <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* button to add rows to the table */}
                                    <button type="button" className="addRow" onClick={() => addArrayField("ingredients")}>
                                        <span className="button__text">Add Ingredient</span>
                                        <span className="button__icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height="24" fill="none" className="svg"><line y2="19" y1="5" x2="12" x1="12"></line><line y2="12" y1="12" x2="19" x1="5"></line></svg></span>
                                    </button>

                                </div>
                            </div> 
                        
                        
                        {/* Location for the steps */}
                        <div className="steps">
                            <b className="stepHead">Steps</b>
                            <div className="step_list">
                                <table className="stepTable">
                                    <thead>
                                        <tr>
                                            <th className="stepH">Step</th>
                                            <th className="stepDH">Description</th>
                                            <th className="stepD"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {recipe.steps.map((step, index) => (
                                                <tr key={index}>
                                                    <td className="stepNo">
                                                        <input
                                                            type="number"
                                                            name="stepNo"
                                                            value={index + 1}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="stepDesc">
                                                        <input
                                                            type="text"
                                                            name="stepDesc"
                                                            value={step.stepDesc}
                                                            onChange={(e) => handleStepChange(e, index)}
                                                        />
                                                    </td>
                                                    <td className="deleteStep">
                                                        <button
                                                            className="deleteButton"
                                                            onClick={() => deleteStep(index)}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 50 59"
                                                                className="bin"
                                                            >
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
                                                                ></path>
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
                                                                ></path>
                                                                <path
                                                                    fill="#B5BAC1"
                                                                    d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
                                                                    clipRule="evenodd"
                                                                    fillRule="evenodd"
                                                                ></path>
                                                                <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <button type="button" className="addStep" onClick={() => addArrayField("steps")}>
                                    <span className="button__text">Add Step</span>
                                    <span className="button__icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height="24" fill="none" className="svg">
                                            <line y2="19" y1="5" x2="12" x1="12"></line>
                                            <line y2="12" y1="12" x2="19" x1="5"></line>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit and Back to Home Button */}
                        <div>
                            <button className="submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Submitting..." : "Submit Recipe"}
                            </button>                          
                            <button className="backHome" onClick={() => router.push("recipes_view")}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </main>
        )
    }