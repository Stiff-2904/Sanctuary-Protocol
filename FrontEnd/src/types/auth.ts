// src/types/auth.ts

export type User = {
  user_id: number
  username: string
  role: string        
  camp_id: number | null
}

export type AuthContextType = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}