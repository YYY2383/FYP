"use client"


import type React from "react"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "./firebaseConfig"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import egg from "@/icons/egg.jpg"

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/recipes_view")
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code;
        if (errorCode === "auth/wrong-password") {
          setError("Incorrect password. Please try again.")
        } else if (errorCode === "auth/user-not-found") {
          setError("No account found with this email.")
        } else {
          setError("Failed to sign in. Please check your credentials.")
        }
      }
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
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center border-4 border-strawberry-200">
                <Image
                  src={egg}
                  width={60}
                  height={60}
                  alt="Logo"
                  className="rounded-full"
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-strawberry-600">Welcome Back</CardTitle>
            <CardDescription className="text-center text-crust-500">
              Sign in to your account to manage your recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-crust-600">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-crust-200 focus:border-strawberry-400"
                  />
                </div>

                <Button type="submit" className="w-full bg-strawberry-500 hover:bg-strawberry-600" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col bg-cream-50">
            <Separator className="my-4 bg-crust-100" />
            <Button
              variant="outline"
              className="w-full border-strawberry-200 text-strawberry-500 hover:bg-strawberry-50"
              onClick={() => router.push("/register")}
            >
              Create an account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}