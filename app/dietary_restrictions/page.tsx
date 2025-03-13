"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db } from "../firebaseConfig"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Options for dietary restrictions
const dietaryRestrictions = [
  { id: "vegetarian", label: "Vegetarian", description: "No meat, fish, or poultry" },
  { id: "vegan", label: "Vegan", description: "No animal products" },
  { id: "gluten-free", label: "Gluten-Free", description: "No wheat, barley, or rye" },
  { id: "dairy-free", label: "Dairy-Free", description: "No milk, cheese, or dairy products" },
  { id: "nut-free", label: "Nut-Free", description: "No nuts or nut derivatives" },
  { id: "keto", label: "Keto", description: "Low carb, high fat" },
  { id: "low-sugar", label: "Low Sugar", description: "Reduced sugar consumption" },
  { id: "low-carb", label: "Low Carb", description: "Reduced carbohydrate consumption" },
  { id: "low-sodium", label: "Low Sodium", description: "Reduced salt consumption" },
  { id: "pescatarian", label: "Pescatarian", description: "Vegetarian plus seafood" },
  { id: "halal", label: "Halal", description: "Follows Islamic dietary laws" },
  { id: "kosher", label: "Kosher", description: "Follows Jewish dietary laws" },
]

export default function DietaryRestrictions() {
  const router = useRouter()
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([])
  const [customInput, setCustomInput] = useState("")
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        // Check if user already has dietary restrictions set
        checkExistingPreferences(user.uid)
      } else {
        // Redirect to login if user isnt correct
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const checkExistingPreferences = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists() && userDoc.data().dietaryRestrictions) {
        const { dietaryRestrictions, customRestrictions } = userDoc.data()
        setSelectedRestrictions(dietaryRestrictions || [])
        setCustomRestrictions(customRestrictions || [])
      }
    } catch (error) {
      console.error("Error checking existing preferences:", error)
    }
  }

  const toggleRestriction = (restrictionId: string) => {
    setSelectedRestrictions((prev) => {
      if (prev.includes(restrictionId)) {
        return prev.filter((id) => id !== restrictionId)
      } else {
        return [...prev, restrictionId]
      }
    })
  }

  const addCustomRestriction = () => {
    if (customInput.trim() && !customRestrictions.includes(customInput.trim())) {
      setCustomRestrictions([...customRestrictions, customInput.trim()])
      setCustomInput("")
    }
  }

  const removeCustomRestriction = (restriction: string) => {
    setCustomRestrictions(customRestrictions.filter((r) => r !== restriction))
  }

  const handleSubmit = async () => {
    if (!userId) return

    setLoading(true)
    setError("")

    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        // Update database for dietary restrictions
        await setDoc(
          userRef,
          {
            ...userDoc.data(),
            dietaryRestrictions: selectedRestrictions,
            customRestrictions: customRestrictions,
          },
          { merge: true },
        )
      } else {
        await setDoc(userRef, {
          dietaryRestrictions: selectedRestrictions,
          customRestrictions: customRestrictions,
          createdAt: new Date(),
        })
      }

      router.push("/recipes_view")
    } catch (error: any) {
      console.error("Error saving preferences:", error)
      setError(error.message || "Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 text-strawberry-500 drop-shadow-md">ReciPal</h1>

        <Card className="border-strawberry-200 shadow-lg overflow-hidden">
          <div className="h-4 tart-gradient"></div>
          <CardHeader className="space-y-1 pt-6">
            <CardTitle className="text-2xl text-center text-strawberry-600">Dietary Preferences</CardTitle>
            <CardDescription className="text-center text-crust-500">
              Select any dietary restrictions or preferences you have
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {dietaryRestrictions.map((restriction) => (
                <Button
                  key={restriction.id}
                  type="button"
                  variant={selectedRestrictions.includes(restriction.id) ? "default" : "outline"}
                  className={`h-auto py-3 px-4 justify-start text-left ${
                    selectedRestrictions.includes(restriction.id)
                      ? "bg-strawberry-500 hover:bg-strawberry-600 text-white"
                      : "border-strawberry-200 text-crust-600 hover:bg-cream-50"
                  }`}
                  onClick={() => toggleRestriction(restriction.id)}
                >
                  <div>
                    <div className="font-medium">{restriction.label}</div>
                    <div className="text-xs mt-1 opacity-80">{restriction.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" className="flex-1 h-auto py-3 px-4 justify-start text-left border-crust-200 focus:border-strawberry-400 bg-cream-50" placeholder="Enter your dietary restriction here" value={customInput} onChange={(e) => setCustomInput(e.target.value)} />
              <Button onClick={addCustomRestriction} className="bg-strawberry-500 border-strawberry-200">Add Custom</Button>
            </div>
            <div className="mt-4">
              {customRestrictions.map((restriction, index) => (
                <div key={index} className="flex items-center h-auto py-3 px-4 justify-between mb-2 bg-cream-200 border-strawberry-200 p-2 rounded-md">
                  <span>{restriction}</span>
                  <Button variant="outline" onClick={() => removeCustomRestriction(restriction)}>Remove</Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col bg-cream-100 p-4 gap-4">
            <p className="text-center text-sm text-crust-500">
              You can always change these preferences later in your account settings.
            </p>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 border-crust-200 text-crust-600 bg-white hover:bg-cream-50"
                onClick={() => router.push("/recipes_view")}
              >
                Skip
              </Button>
              <Button
                className="flex-1 bg-strawberry-500 hover:bg-strawberry-600 text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

