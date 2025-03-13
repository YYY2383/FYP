"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { db } from "../firebaseConfig"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, Lock, ChevronLeft, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Account() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  })
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showReauthDialog, setShowReauthDialog] = useState(false)
  const [reauthPassword, setReauthPassword] = useState("")
  const [reauthError, setReauthError] = useState("")
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState("")

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid)
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData({
          name: data.name || "",
          email: data.email || "",
        })
        if (Array.isArray(data.dietaryRestrictions)) {
          setDietaryRestrictions(data.dietaryRestrictions)
        } else {
          setDietaryRestrictions([])
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data")
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const updateProfile = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Update Firestore document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        name: userData.name,
      })

      // Check if email has changed
      if (userData.email !== user.email) {
        setPendingEmailUpdate(userData.email)
        setShowReauthDialog(true)
        setLoading(false)
        return
      }

      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const updateUserPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user || !user.email) {
        throw new Error("User not authenticated")
      }

      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, passwordData.newPassword)

      setSuccess("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect")
      } else {
        setError(error.message || "Failed to update password")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReauthenticate = async () => {
    setReauthError("")

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user || !user.email) {
        throw new Error("User not authenticated")
      }

      const credential = EmailAuthProvider.credential(user.email, reauthPassword)
      await reauthenticateWithCredential(user, credential)

      // Update email
      await updateEmail(user, pendingEmailUpdate)

      // Update Firestore document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        email: pendingEmailUpdate,
      })

      setShowReauthDialog(false)
      setReauthPassword("")
      setPendingEmailUpdate("")
      setSuccess("Email updated successfully!")
    } catch (error: any) {
      console.error("Error during reauthentication:", error)
      if (error.code === "auth/wrong-password") {
        setReauthError("Password is incorrect")
      } else {
        setReauthError(error.message || "Authentication failed")
      }
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
            <h2 className="text-2xl font-semibold text-strawberry-600">Account Settings</h2>
            <p className="text-crust-500 mt-2">Manage your account details and preferences</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-cream-100">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 data-[state=active]:bg-strawberry-500 data-[state=active]:text-white"
              >
                <User size={16} />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 data-[state=active]:bg-strawberry-500 data-[state=active]:text-white"
              >
                <Lock size={16} />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="recipe-card">
                <CardHeader>
                  <CardTitle className="recipe-card-title">Profile Information</CardTitle>
                  <CardDescription className="text-crust-500">Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-crust-600">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleProfileChange}
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
                      value={userData.email}
                      onChange={handleProfileChange}
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                    <p className="text-xs text-crust-400">Changing your email will require re-authentication</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-strawberry-100 pt-6">
                  <Button
                    onClick={updateProfile}
                    disabled={loading}
                    className="ml-auto flex items-center gap-2 bg-strawberry-500 hover:bg-strawberry-600 text-white"
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="recipe-card mt-6">
                <CardHeader>
                  <CardTitle className="recipe-card-title">Dietary Preferences</CardTitle>
                  <CardDescription className="text-crust-500">Manage your dietary restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-crust-600 mb-2">Current preferences:</h3>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictions.length > 0 ? (
                        dietaryRestrictions.map((restriction) => (
                          <div key={restriction} className="bg-cream-100 text-crust-600 px-3 py-1 rounded-full text-sm">
                            {restriction}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-crust-400">No dietary preferences set</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/dietary_restrictions")}
                    className="w-full bg-strawberry-500 hover:bg-strawberry-600 text-white"
                  >
                    Update Dietary Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="recipe-card">
                <CardHeader>
                  <CardTitle className="recipe-card-title">Change Password</CardTitle>
                  <CardDescription className="text-crust-500">Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-crust-600">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-crust-600">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-crust-600">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="border-crust-200 focus:border-strawberry-400"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-strawberry-100 pt-6">
                  <Button
                    onClick={updateUserPassword}
                    disabled={loading}
                    className="ml-auto flex items-center gap-2 bg-strawberry-500 hover:bg-strawberry-600 text-white"
                  >
                    <Save size={16} />
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <DialogContent className="sm:max-w-md bg-white border-strawberry-200">
          <DialogHeader>
            <DialogTitle className="text-strawberry-600">Confirm Your Password</DialogTitle>
            <DialogDescription className="text-crust-500">
              For security reasons, please enter your current password to change your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reauthError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{reauthError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="reauthPassword" className="text-crust-600">
                Current Password
              </Label>
              <Input
                id="reauthPassword"
                type="password"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                className="border-crust-200 focus:border-strawberry-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReauthDialog(false)}
              className="border-crust-200 text-crust-600"
            >
              Cancel
            </Button>
            <Button onClick={handleReauthenticate} className="bg-strawberry-500 hover:bg-strawberry-600 text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

