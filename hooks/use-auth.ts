"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/services/auth"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const authUser = await AuthService.getCurrentUser()
        if (authUser) {
          const profile = await AuthService.getUserProfile(authUser.id)
          setUser(profile)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await AuthService.getUserProfile(session.user.id)
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const data = await AuthService.signIn(email, password)
    router.push("/dashboard")
    return data
  }

  const signUp = async (email: string, password: string) => {
    const data = await AuthService.signUp(email, password)
    router.push("/dashboard")
    return data
  }

  const signInWithProvider = async (provider: "google" | "github") => {
    return AuthService.signInWithProvider(provider)
  }

  const signOut = async () => {
    await AuthService.signOut()
    router.push("/")
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error("No user logged in")
    const updatedUser = await AuthService.updateUserProfile(user.id, updates)
    setUser(updatedUser)
    return updatedUser
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateProfile,
  }
}
