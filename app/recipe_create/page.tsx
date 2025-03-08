"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { db } from "../firebaseConfig"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"

export default function Create() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const [recipe, setRecipe] = useState({
    name: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [{ quantity: "", unit: "millilitre", ingredient: "" }],
    steps: [{ stepNo: "1", stepDesc: "" }],
  })

  // Generic Input Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRecipe((prev) => ({ ...prev, [name]: value }))
  }

  // Handler for Ingredients & Steps
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    type: "ingredients" | "steps",
  ) => {
    const { name, value } = e.target
    setRecipe((prev) => {
      const updatedArray = [...prev[type]]
      updatedArray[index] = { ...updatedArray[index], [name]: value }
      return { ...prev, [type]: updatedArray }
    })
  }

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
    }))
  }

  // Removing an ingredient or step
  const removeArrayField = (index: number, type: "ingredients" | "steps") => {
    setRecipe((prev) => {
      const updatedArray = prev[type].filter((_, i) => i !== index)
      // Re-number steps properly after deletion
      const reindexedArray =
        type === "steps"
          ? updatedArray.map((step, i) => ({
              ...step,
              stepNo: (i + 1).toString(),
            }))
          : updatedArray
      return { ...prev, [type]: reindexedArray }
    })
  }

  // Submit Recipe to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!user) {
        alert("You must be logged in to submit a recipe.")
        setLoading(false)
        return
      }

      const recipeWithUserId = { ...recipe, userId: user.uid }
      await addDoc(collection(db, "recipes"), recipeWithUserId)
      alert("Recipe added successfully!")
      setRecipe({
        name: "",
        prepTime: "",
        cookTime: "",
        servings: "",
        ingredients: [{ quantity: "", unit: "millilitre", ingredient: "" }],
        steps: [{ stepNo: "1", stepDesc: "" }],
      })
      setLoading(false)
      // Delay the redirection to ensure it happens after the component renders
      setTimeout(() => {
        router.push("/recipes_view")
      }, 300)
    } catch (error) {
      console.error("Error adding recipe:", error)
      setLoading(false)
    }
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
            onClick={() => router.push("/recipes_view")}
          >
            <ChevronLeft size={16} />
            Back to Recipes
          </Button>

          <div className="recipe-header mb-6">
            <h2 className="text-2xl font-semibold text-strawberry-600">Create Your Own Unique Recipe</h2>
            <p className="text-crust-500 mt-2">Fill in the details below to create your delicious recipe</p>
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
                  onClick={() => addArrayField("ingredients")}
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
                            name="quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleArrayChange(e, index, "ingredients")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.unit}
                            onValueChange={(value) => {
                              const e = {
                                target: { name: "unit", value },
                              } as unknown as React.ChangeEvent<HTMLSelectElement>
                              handleArrayChange(e, index, "ingredients")
                            }}
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
                            name="ingredient"
                            value={ingredient.ingredient}
                            onChange={(e) => handleArrayChange(e, index, "ingredients")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayField(index, "ingredients")}
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
                  onClick={() => addArrayField("steps")}
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
                            name="stepDesc"
                            value={step.stepDesc}
                            onChange={(e) => handleArrayChange(e, index, "steps")}
                            required
                            className="border-crust-200 focus:border-strawberry-400"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayField(index, "steps")}
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
                {loading ? "Submitting..." : "Submit Recipe"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/recipes_view")}
                className="flex-1 border-crust-200 text-crust-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

