"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../../firebaseConfig"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RecipeEdit() {
  const { id } = useParams()
  const router = useRouter()
  const auth = getAuth()
  const currentUserId = auth.currentUser?.uid
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recipe, setRecipe] = useState({
    id: "",
    name: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [{ quantity: "", unit: "millilitre", ingredient: "" }],
    steps: [{ stepNo: "1", stepDesc: "" }],
  })

  useEffect(() => {
    if (!id) return

    const fetchRecipe = async () => {
      try {
        const recipeRef = doc(db, "recipes", id as string)
        const docSnap = await getDoc(recipeRef)

        if (docSnap.exists()) {
          const recipeData = docSnap.data() as any
          if (recipeData.userId === currentUserId) {
            setRecipe({ ...recipeData, id: id as string })
          } else {
            setError("You do not have permission to edit this recipe")
            setTimeout(() => router.push("/recipes_view"), 2000)
          }
        } else {
          setError("Recipe not found")
          setTimeout(() => router.push("/recipes_view"), 2000)
        }
      } catch (error) {
        console.error("Error fetching recipe:", error)
        setError("Error loading recipe")
      }
    }

    fetchRecipe()
  }, [id, currentUserId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value })
  }

  const handleArrayChange = (index: number, value: string, field: "ingredients" | "steps", key: string) => {
    setRecipe((prev) => {
      const updatedArray = prev[field].map((item, i) => (i === index ? { ...item, [key]: value } : item))
      return { ...prev, [field]: updatedArray }
    })
  }

  const addArrayItem = (field: "ingredients" | "steps") => {
    const newItem =
      field === "ingredients"
        ? { quantity: "", unit: "millilitre", ingredient: "" }
        : { stepNo: (recipe.steps.length + 1).toString(), stepDesc: "" }
    setRecipe({ ...recipe, [field]: [...recipe[field], newItem] })
  }

  const deleteStep = (index: number) => {
    setRecipe((prev) => {
      const updatedSteps = prev.steps.filter((_, i) => i !== index)
      const reindexedSteps = updatedSteps.map((step, i) => ({
        ...step,
        stepNo: (i + 1).toString(),
      }))
      return { ...prev, steps: reindexedSteps }
    })
  }

  const deleteIngredient = (index: number) => {
    setRecipe((prev) => {
      const updatedIngredients = prev.ingredients.filter((_, i) => i !== index)
      return { ...prev, ingredients: updatedIngredients }
    })
  }

  const handleDelete = async () => {
    if (!id) return

    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?")
    if (!confirmDelete) return

    try {
      const docRef = doc(db, "recipes", id as string)
      await deleteDoc(docRef)

      alert("Recipe deleted successfully!")
      router.push("/recipes_view")
    } catch (error) {
      console.error("Error deleting recipe:", error)
      alert("Failed to delete the recipe. Please try again.")
    }
  }

  const isRecipeValid = () => {
    if (!recipe.name || !recipe.prepTime || !recipe.cookTime || !recipe.servings) return false
    if (recipe.ingredients.some((ing) => !ing.quantity || !ing.ingredient)) return false
    if (recipe.steps.some((step) => !step.stepDesc)) return false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isRecipeValid()) {
      alert("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const recipeRef = doc(db, "recipes", recipe.id)
      await updateDoc(recipeRef, { ...recipe, userId: currentUserId })

      alert("Recipe updated successfully!")
      router.push(`/recipe_details/${id}`)
    } catch (error) {
      console.error("Error updating recipe:", error)
      setError("Failed to update recipe")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-strawberry-500 mb-6 drop-shadow-md">ReciPal</h1>

        <Navbar />

        <div className="mt-8">
          <Button
            variant="ghost"
            className="mb-4 flex items-center gap-2 text-crust-600 hover:text-strawberry-500"
            onClick={() => router.push(`/recipe_details/${id}`)}
          >
            <ChevronLeft size={16} />
            Back to Recipe
          </Button>

          <div className="recipe-header mb-6">
            <h2 className="text-2xl font-semibold text-strawberry-600">Edit Recipe</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-8 border-strawberry-200 bg-white shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-crust-600">
                    Recipe Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={recipe.name}
                    onChange={handleChange}
                    required
                    className="border-crust-200 focus:border-strawberry-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime" className="text-crust-600">
                      Prep Time (minutes)
                    </Label>
                    <Input
                      id="prepTime"
                      name="prepTime"
                      type="number"
                      value={recipe.prepTime}
                      onChange={handleChange}
                      required
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookTime" className="text-crust-600">
                      Cook Time (minutes)
                    </Label>
                    <Input
                      id="cookTime"
                      name="cookTime"
                      type="number"
                      value={recipe.cookTime}
                      onChange={handleChange}
                      required
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings" className="text-crust-600">
                      Servings
                    </Label>
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      value={recipe.servings}
                      onChange={handleChange}
                      required
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-strawberry-600">Ingredients</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("ingredients")}
                  className="flex items-center gap-2 border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"
                >
                  <Plus size={16} />
                  Add Ingredient
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-strawberry-200 shadow-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-cream-100">
                    <TableRow>
                      <TableHead className="w-[120px] text-crust-600">Quantity</TableHead>
                      <TableHead className="w-[180px] text-crust-600">Unit</TableHead>
                      <TableHead className="text-crust-600">Ingredient</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients.map((ingredient, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-cream-50"}>
                        <TableCell>
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => handleArrayChange(index, e.target.value, "ingredients", "quantity")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.unit}
                            onValueChange={(value) => handleArrayChange(index, value, "ingredients", "unit")}
                          >
                            <SelectTrigger className="border-crust-200 focus:border-strawberry-400">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="millilitre">Millilitre</SelectItem>
                              <SelectItem value="litre">Litre</SelectItem>
                              <SelectItem value="teaspoon">Teaspoon</SelectItem>
                              <SelectItem value="tablespoon">Tablespoon</SelectItem>
                              <SelectItem value="cup">Cup</SelectItem>
                              <SelectItem value="kilogram">Kilogram</SelectItem>
                              <SelectItem value="gram">Gram</SelectItem>
                              <SelectItem value="ounce">Ounce</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={ingredient.ingredient}
                            onChange={(e) => handleArrayChange(index, e.target.value, "ingredients", "ingredient")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteIngredient(index)}
                            disabled={recipe.ingredients.length <= 1}
                            className="text-crust-400 hover:text-strawberry-500"
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-strawberry-600">Steps</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("steps")}
                  className="flex items-center gap-2 border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"
                >
                  <Plus size={16} />
                  Add Step
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-strawberry-200 shadow-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-cream-100">
                    <TableRow>
                      <TableHead className="w-[80px] text-crust-600">Step</TableHead>
                      <TableHead className="text-crust-600">Description</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.steps.map((step, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-cream-50"}>
                        <TableCell className="font-medium text-strawberry-500">{index + 1}</TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={step.stepDesc}
                            onChange={(e) => handleArrayChange(index, e.target.value, "steps", "stepDesc")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStep(index)}
                            disabled={recipe.steps.length <= 1}
                            className="text-crust-400 hover:text-strawberry-500"
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-strawberry-500 hover:bg-strawberry-600">
                {loading ? "Saving..." : "Save Recipe"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/recipe_details/${id}`)}
                className="flex-1 border-crust-200 text-crust-600"
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} className="flex-1">
                Delete Recipe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

