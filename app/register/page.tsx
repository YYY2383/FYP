"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../firebaseConfig"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        uid: user.uid,
        createdAt: new Date(),
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error signing up:", error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-cream-50">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-center mb-8 text-strawberry-500 drop-shadow-md">ReciPal</h1>

        <Card className="border-strawberry-200 shadow-lg overflow-hidden">
          <div className="h-4 bg-gradient-to-r from-strawberry-400 to-strawberry-500"></div>
          <CardHeader className="space-y-1 pt-6">
            <CardTitle className="text-2xl text-center text-strawberry-600">Create an Account</CardTitle>
            <CardDescription className="text-center text-crust-500">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-crust-600">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-crust-200 focus:border-strawberry-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-crust-600">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-crust-200 focus:border-strawberry-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-crust-600">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="border-crust-200 focus:border-strawberry-400"
                  />
                </div>

                <Button type="submit" className="w-full bg-strawberry-500 hover:bg-strawberry-600" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col bg-cream-50">
            <Separator className="my-4 bg-crust-100" />
            <p className="text-center text-sm text-crust-500">
              Already have an account?{" "}
              <Link href="/" className="text-strawberry-500 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

