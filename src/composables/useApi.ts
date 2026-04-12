/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type {
  AuthResponse,
  Card,
  Deck,
  DeckPayload,
  SignInPayload,
  SignUpPayload,
} from '../types/index.js'
import { useStorage } from './useStorage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const storage = useStorage()

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = storage.get<string>('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      (data as { message?: string }).message || `Erreur ${res.status}`,
    )
  }

  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}

export function useApi() {
  const signIn = ({ email, password }: SignInPayload) =>
    request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

  const signUp = ({ email, password, username }: SignUpPayload) =>
    request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })

  // Renommé ici pour matcher le store
  const getAllCards = () => request<Card[]>('/cards')
  const getMyDecks = () => request<Deck[]>('/decks/mine')
  const getDeck = (id: string | number) => request<Deck>(`/decks/${id}`)

  const createDeck = ({ name, cards }: DeckPayload) =>
    request<Deck>('/decks', {
      method: 'POST',
      body: JSON.stringify({ name, cards }),
    })

  const updateDeck = (id: string | number, { name, cards }: DeckPayload) =>
    request<Deck>(`/decks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, cards }),
    })

  const deleteDeck = (id: string | number) =>
    request<void>(`/decks/${id}`, { method: 'DELETE' })

  return {
    signIn,
    signUp,
    getAllCards,
    getMyDecks,
    getDeck,
    createDeck,
    updateDeck,
    deleteDeck,
  }
}
