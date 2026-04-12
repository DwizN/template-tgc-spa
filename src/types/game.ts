import type { Card } from './card'

export interface GameCard extends Card {
  currentHp: number
}

export interface Board {
  activeCard: Card | null
  hand: Card[]
  deck: Card[]
  score: number
}

export interface PlayerState {
  socketId: string
  board: Board
}

export interface GameState {
  roomId: number
  status: 'waiting' | 'playing' | 'finished'
  currentPlayerSocketId: string
  host: PlayerState
  guest: PlayerState
  winner?: string
}

export interface GameServerResponse {
  message?: string
  gameState?: GameState
}

export interface Room {
  id: string
  players: Record<string, unknown>[]
  status: 'waiting' | 'playing'
}
