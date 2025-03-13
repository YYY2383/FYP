"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { db } from "../firebaseConfig"
import { fetchRecipe } from "@/utils/fetch"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Search, LinkIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RecipesView() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [recipeUrl, setRecipeUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (!currentUser) {
        router.push("/")
        return
      }
      setUser(currentUser)
      fetchRecipes(currentUser.uid)
    })

    return () => unsubscribe()
  }, [router])

  // Fetch recipes when user state updates
  const fetchRecipes = async (userId: string) => {
    try {
      const q = query(collection(db, "recipes"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const recipesList: any[] = []
      querySnapshot.forEach((doc) => {
        recipesList.push({ id: doc.id, ...doc.data() })
      })
      setRecipes(recipesList)
    } catch (error: any) {
      console.error("Error fetching recipes:", error.message || error)
      setError("Failed to fetch recipes. Please try again.")
    }
  }

  // Handle recipe URL input change
  const handleAddRecipe = async () => {
    if (!recipeUrl || !user) return
    setLoading(true)
    setError(null)

    try {
      const recipeData = await fetchRecipe(recipeUrl)

      const newRecipe = {
        name: recipeData.title,
        prepTime: recipeData.readyInMinutes,
        cookTime: recipeData.cookingMinutes || 0,
        servings: recipeData.servings,
        image: recipeData.image,
        ingredients:
          recipeData.extendedIngredients?.map((ing: any) => ({
            ingredient: ing.name || ing.original,
            quantity: ing.amount || 0,
            unit: ing.unit || "",
          })) || [],
        steps: recipeData.instructions
          ? recipeData.instructions
              .split("\n")
              .filter((step: string) => step.trim() !== "")
              .map((step: string, index: number) => ({
                stepNo: index + 1,
                stepDesc: step,
              }))
          : [],
        userId: user.uid,
      }

      const docRef = await addDoc(collection(db, "recipes"), newRecipe)
      const newRecipeWithId = { id: docRef.id, ...newRecipe }
      setRecipes((prevRecipes) => [...prevRecipes, newRecipeWithId])
      setRecipeUrl("")
    } catch (error) {
      console.error("Error adding recipe:", error)
      setError("Failed to fetch recipe. Please check the URL.")
    } finally {
      setLoading(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Filter recipes based on the search query
  const filteredRecipes = recipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <main className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-strawberry-500 mb-6 drop-shadow-md">ReciPal</h1>

        <Navbar />

        <div className="mt-8">
          <div className="recipe-header mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Paste recipe URL here"
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                  className="border-crust-200 focus:border-strawberry-400 bg-white"
                />
              </div>
              <Button
                onClick={handleAddRecipe}
                disabled={loading}
                className="flex items-center gap-2 bg-strawberry-500 hover:bg-strawberry-600"
              >
                <LinkIcon size={16} />
                {loading ? "Adding..." : "Import Recipe"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold mb-4 md:mb-0 text-strawberry-600">My Recipes</h2>
            <div className="relative flex-1 md:w-64 md:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crust-400 h-4 w-4" />
              <Input
                placeholder="Search recipes"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 border-crust-200 focus:border-strawberry-400 bg-white"
              />
            </div>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="recipe-card cursor-pointer shadow-md"
                  onClick={() => router.push(`/recipe_details/${recipe.id}`)}
                >
                  <div className="h-2 bg-gradient-to-r from-strawberry-300 to-strawberry-400"></div>
                  <CardHeader className="pb-0">
                    <CardTitle className="recipe-card-title text-xl">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-crust-400" />
                        <span className="text-crust-600">Prep Time: {recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-crust-400" />
                        <span className="text-crust-600">Cook Time: {recipe.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-crust-400" />
                        <span className="text-crust-600">Total Time: {parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-crust-400" />
                        <span className="text-crust-600">Serves: {recipe.servings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-crust-100">
              <p className="text-crust-500 mb-4">No recipes found.</p>
              <Button
                onClick={() => router.push("/recipes/create")}
                className="bg-strawberry-500 hover:bg-strawberry-600"
              >
                Create Your First Recipe
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

