"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../../firebaseConfig"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Users, ChevronLeft, Edit, Trash2, Sparkles, Eye, InfoIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RecipeDetails() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiMode, setAiMode] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [hasGeneratedRecipe, setHasGeneratedRecipe] = useState(false)
  const [adjustedServings, setAdjustedServings] = useState<number>(0)

  useEffect(() => {
    if (recipe) {
      setAdjustedServings(recipe.servings)
    }
  }, [recipe])

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipeId = params?.id as string
      if (!recipeId) return

      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        router.push("/")
        return
      }

      try {
        const docRef = doc(db, "recipes", recipeId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const fetchedRecipe = { id: docSnap.id, userId: docSnap.data().userId, ...docSnap.data() }
          if (fetchedRecipe.userId !== user.uid) {
            router.push("/recipes_view")
            return
          }

          setRecipe(fetchedRecipe)
        } else {
          console.log("Recipe not found")
          router.push("/recipes_view")
        }
      } catch (error) {
        console.error("Error fetching recipe:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params, router])

  const handleDelete = async () => {
    if (!recipe) return

    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?")
    if (!confirmDelete) return

    try {
      const docRef = doc(db, "recipes", recipe.id)
      await deleteDoc(docRef)

      alert("Recipe deleted successfully!")
      router.push("/recipes_view")
    } catch (error) {
      console.error("Error deleting recipe:", error)
      alert("Failed to delete the recipe. Please try again.")
    }
  }

  const handleFullRecipeAI = async () => {
    if (!aiMode || !recipe || !userInput.trim()) {
      return
    }

    setAiLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "recipe",
          recipe: {
            name: recipe.name,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
          },
          userInput: userInput.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const responseJson = await response.json()
      setAiGeneratedRecipe(responseJson)
      setShowPopup(true)
      setHasGeneratedRecipe(true)
    } catch (error) {
      console.error("Error fetching AI-modified recipe:", error)
      alert("Failed to fetch AI-modified recipe. Please try again.")
    } finally {
      setAiLoading(false)
    }
  }

  const handleReplaceRecipe = async () => {
    if (!recipe || !recipe.id || !aiGeneratedRecipe) {
      alert("No AI-suggested recipe available to replace.")
      return
    }

    setLoading(true)
    try {
      const recipeRef = doc(db, "recipes", recipe.id)
      await updateDoc(recipeRef, {
        name: aiGeneratedRecipe.name,
        prepTime: aiGeneratedRecipe.prepTime,
        cookTime: aiGeneratedRecipe.cookTime,
        servings: aiGeneratedRecipe.servings,
        ingredients: aiGeneratedRecipe.ingredients,
        steps: aiGeneratedRecipe.steps,
      })

      setRecipe(aiGeneratedRecipe)
      alert("Recipe replaced successfully!")
      setShowPopup(false)
      setHasGeneratedRecipe(false)
    } catch (error) {
      console.error("Error updating recipe:", error)
      alert("Failed to update recipe.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewAiRecipe = () => {
    if (aiGeneratedRecipe) {
      setShowPopup(true)
    }
  }

  const increaseServings = () => {
    setAdjustedServings((prev) => prev + 1)
  }

  const decreaseServings = () => {
    setAdjustedServings((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const calculateAdjustedQuantity = (originalQuantity: number) => {
    if (!recipe || adjustedServings === recipe.servings) return originalQuantity
    return Number.parseFloat((originalQuantity * (adjustedServings / recipe.servings)).toFixed(2))
  }

  const handleFetchDietaryRestrictions = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User data:", userData);
        const dietaryRestrictions = userData.dietaryRestrictions || [];
        const customRestrictions = userData.customRestrictions || [];

        const allRestrictions = [...dietaryRestrictions, ...customRestrictions];
        if (allRestrictions.length > 0) {
          const dietaryRestrictionsString = allRestrictions.join(", ");
          setUserInput(dietaryRestrictionsString);
          handleFullRecipeAI();
        } else {
          alert("No dietary restrictions found in your account.");
        }
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      console.error("Error fetching dietary restrictions:", error);
      alert("Failed to fetch dietary restrictions. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Recipe not found.</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-cream-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-strawberry-500 mb-6 drop-shadow-md">ReciPal</h1>

          <Navbar />

          <div className="mt-8">
            <Button
              variant="ghost"
              className="mb-4 flex items-center gap-2 text-crust-600 hover:text-strawberry-500"
              onClick={() => router.push("/recipes_view")}
            >
              <ChevronLeft size={16} />
              Back to Recipes
            </Button>

            <div className="recipe-header mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-3xl font-bold text-strawberry-600">{recipe.name}</h2>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/recipe_edit/${recipe.id}`)}
                    className="border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"
                  >
                    <Edit size={16} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    className="border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"
                  >
                    <Trash2 size={16} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>

            <Card className="mb-8 border-strawberry-200 bg-white shadow-md">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Prep Time</p>
                      <p className="font-medium text-crust-700">{recipe.prepTime} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Cook Time</p>
                      <p className="font-medium text-crust-700">{recipe.cookTime} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Total Time</p>
                      <p className="font-medium text-crust-700">{parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Servings</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full border-strawberry-200"
                          onClick={decreaseServings}
                          disabled={adjustedServings <= 1}
                        >
                          <span className="text-sm">-</span>
                        </Button>
                        <p className="font-medium text-crust-700 min-w-[2ch] text-center">{adjustedServings}</p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full border-strawberry-200"
                          onClick={increaseServings}
                        >
                          <span className="text-sm">+</span>
                        </Button>
                        {adjustedServings !== recipe.servings && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground ml-1">(original: {recipe.servings})</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-strawberry-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-cream-100 text-crust-700 border-strawberry-200">
                                Chef, please use your better judgement to accommodate for the varying cook time and prep
                                time.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-strawberry-600">Ingredients</h3>
                <Button
                  variant={aiMode ? "default" : "outline"}
                  onClick={() => setAiMode(!aiMode)}
                  className={`flex items-center gap-2 ${aiMode ? "bg-strawberry-500 hover:bg-strawberry-600" : "border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"}`}
                >
                  <Sparkles size={16} />
                  {aiMode ? "Disable AI Mode" : "Enable AI Mode"}
                </Button>
              </div>

              {aiMode && (
                <Card className="mb-4 border-strawberry-200 bg-white shadow-md">
                  <CardContent className="pt-6">
                    <p className="mb-2 text-sm text-crust-600">
                      Enter your dietary restrictions or preferences to get an AI-modified version of this recipe:
                    </p>
                    <Textarea
                      placeholder="E.g., vegan, gluten-free, low-carb, etc."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="mb-4 border-crust-200 focus:border-strawberry-400"
                    />
                    <div className="space-y-3">
                      <Button
                        onClick={handleFullRecipeAI}
                        disabled={aiLoading || !userInput.trim()}
                        className="w-full bg-strawberry-500 hover:bg-strawberry-600"
                      >
                        {aiLoading ? "Generating..." : "Get AI Suggestions"}
                      </Button>
                      <Button
                        onClick={handleFetchDietaryRestrictions}
                        disabled={aiLoading}
                        className="w-full bg-strawberry-500 hover:bg-strawberry-600"
                      >
                        Use Saved Dietary Restrictions
                      </Button>

                      {hasGeneratedRecipe && !showPopup && (
                        <Button
                          onClick={handleViewAiRecipe}
                          className="w-full border-strawberry-200 bg-cream-50 text-strawberry-500 hover:bg-cream-100 flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View AI Recipe
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-white rounded-lg border border-strawberry-200 shadow-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-cream-100">
                    <TableRow>
                      <TableHead className="w-[100px] text-crust-600">Quantity</TableHead>
                      <TableHead className="w-[150px] text-crust-600">Unit</TableHead>
                      <TableHead className="text-crust-600">Ingredient</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients?.map(
                      (item: { ingredient: string; quantity: number; unit: string }, index: number) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-cream-50"}>
                          <TableCell className="font-medium text-crust-700">
                            {calculateAdjustedQuantity(item.quantity)}
                          </TableCell>
                          <TableCell className="text-crust-600">{item.unit}</TableCell>
                          <TableCell className="text-crust-700">{item.ingredient}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-strawberry-600 mb-4">Steps</h3>
              <div className="bg-white rounded-lg border border-strawberry-200 shadow-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-cream-100">
                    <TableRow>
                      <TableHead className="w-[80px] text-crust-600">Step</TableHead>
                      <TableHead className="text-crust-600">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.steps?.map((step: { stepNo: number; stepDesc: string }, index: number) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-cream-50"}>
                        <TableCell className="font-medium text-strawberry-500">{step.stepNo}</TableCell>
                        <TableCell className="text-crust-700">{step.stepDesc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-strawberry-200">
            <DialogHeader className="bg-cream-50 -mx-6 -mt-6 p-6 border-b border-strawberry-100">
              <DialogTitle className="text-strawberry-600">AI Generated Recipe</DialogTitle>
              <DialogDescription className="text-crust-500">
                Based on your preferences, here&apos;s a modified version of your recipe
              </DialogDescription>
            </DialogHeader>

            {aiGeneratedRecipe && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-strawberry-600">{aiGeneratedRecipe.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cream-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Prep Time</p>
                      <p className="font-medium text-crust-700">{aiGeneratedRecipe.prepTime} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Cook Time</p>
                      <p className="font-medium text-crust-700">{aiGeneratedRecipe.cookTime} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Total Time</p>
                      <p className="font-medium text-crust-700">
                        {aiGeneratedRecipe.prepTime + aiGeneratedRecipe.cookTime} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-strawberry-500" />
                    <div>
                      <p className="text-sm text-crust-500">Servings</p>
                      <p className="font-medium text-crust-700">{aiGeneratedRecipe.servings}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-strawberry-100 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-strawberry-600">Ingredients:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-crust-700">
                    {aiGeneratedRecipe.ingredients?.map(
                      (item: { ingredient: string; quantity: number; unit: string }, index: number) => (
                        <li key={index}>
                          {item.quantity} {item.unit} {item.ingredient}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="border border-strawberry-100 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-strawberry-600">Steps:</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-crust-700">
                    {aiGeneratedRecipe.steps?.map((step: { stepDesc: string }, index: number) => (
                      <li key={index}>{step.stepDesc}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <DialogFooter className="bg-cream-50 -mx-6 -mb-6 p-6 border-t border-strawberry-100 mt-4">
              <Button variant="outline" onClick={() => setShowPopup(false)} className="border-crust-200 text-crust-600">
                Cancel
              </Button>
              <Button onClick={handleReplaceRecipe} className="bg-strawberry-500 hover:bg-strawberry-600">
                Replace Recipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}

