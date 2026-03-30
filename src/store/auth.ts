import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // État — initialisé depuis le localStorage si disponible
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  )

  // Getter
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const login = (newToken: string, newUser: User): void => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = (): void => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, login, logout }
})
