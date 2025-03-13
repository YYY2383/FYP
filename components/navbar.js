"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, User, LogOut } from "lucide-react"

export default function Navbar() {
  const router = useRouter()
  const auth = getAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-white rounded-lg shadow-sm border border-strawberry-200 p-1">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2 text-crust-600 hover:text-strawberry-500 hover:bg-cream-100"
          >
            <Link href="/recipes_view">
              <Home size={16} />
              <span>Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2 text-crust-600 hover:text-strawberry-500 hover:bg-cream-100"
          >
            <Link href="/recipe_create">
              <PlusCircle size={16} />
              <span>Create Recipe</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2 text-crust-600 hover:text-strawberry-500 hover:bg-cream-100"
          >
            <Link href="/account">
              <User size={16} />
              <span>Account</span>
            </Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center gap-2 text-crust-600 hover:text-strawberry-500 hover:bg-cream-100"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  )
}

