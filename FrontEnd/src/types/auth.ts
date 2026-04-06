// src/types/auth.ts

export type User = {
  id: number
  nombre: string
  email: string
  rol: string
  campamento_id: number | null
}

export type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}