/* eslint-disable no-console */
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useApi } from '@/composables/useApi'
import router from '@/router'
import type { Card } from '@/types/card'
import type { Deck } from '@/types/deck'
import type { Board, GameServerResponse, GameState, Room } from '@/types/game'

import { useAuthStore } from './auth'

interface SocketError {
  message: string
}

interface ServerResponse {
  id?: string
  error?: string
}

export const useGameStore = defineStore('game', {
  state: () => ({
    socket: null as Socket | null,
    rooms: [] as Room[],
    gameState: null as GameState | null,
    error: null as string | null,
    decks: [] as Deck[],
    allCards: [] as Card[],
    loadingDecks: false,
  }),

  getters: {
    isMyTurn(): boolean {
      if (!this.gameState || !this.socket) return false
      if (!this.gameState.currentPlayerSocketId) return false
      return this.gameState.currentPlayerSocketId === this.socket.id
    },

    myRole(): 'host' | 'guest' | null {
      if (!this.gameState || !this.socket) return null
      if (this.gameState.host?.socketId === this.socket.id) return 'host'
      if (this.gameState.guest?.socketId === this.socket.id) return 'guest'
      return null
    },

    myBoard(): Board | null {
      const role = this.myRole
      if (!role || !this.gameState) return null
      return this.gameState[role].board
    },

    opponentBoard(): Board | null {
      const role = this.myRole
      if (!role || !this.gameState) return null
      const opponentRole = role === 'host' ? 'guest' : 'host'
      return this.gameState[opponentRole].board
    },

    myHand(): Card[] {
      return this.myBoard?.hand || []
    },
  },

  actions: {
    async fetchLobbyData() {
      const api = useApi()
      this.loadingDecks = true
      try {
        const [decksData, cardsData] = await Promise.all([
          api.getMyDecks(),
          api.getAllCards(),
        ])
        this.decks = decksData
        this.allCards = cardsData
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingDecks = false
      }
    },

    connect() {
      const auth = useAuthStore()
      if (!auth.token || this.socket?.connected) return

      const socketUrl = 'https://tcg-api-ztlk.onrender.com'

      this.socket = io(socketUrl, {
        auth: { token: auth.token },
        transports: ['polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      })

      this.setupListeners()
    },

    setupListeners() {
      if (!this.socket) return

      this.socket.on('connect', () => {
        console.log('✅ Connecté au serveur de jeu')
        this.socket?.emit('getRooms')
      })

      this.socket.on('reconnect', () => {
        console.log('🔁 Reconnecté')
        this.socket?.emit('getRooms')
      })

      this.socket.on('roomsList', (rooms: Room[]) => {
        console.log('🏠 Liste reçue :', rooms)
        this.rooms = rooms
      })

      this.socket.on('roomsListUpdated', () => {
        this.socket?.emit('getRooms')
      })

      this.socket.on('roomCreated', (roomId: string) => {
        console.log('🏠 Room créée:', roomId)
      })

      this.socket.on('gameStarted', (data: GameServerResponse) => {
        console.log('🚀 Game Started RAW:', JSON.stringify(data, null, 2))
        this.gameState = data.gameState ?? null
        router.push('/game')
      })

      this.socket.on('gameStateUpdated', (data: GameServerResponse) => {
        console.log('🔄 gameStateUpdated:', JSON.stringify(data, null, 2))
        this.gameState = data.gameState ?? null
      })

      this.socket.on('gameEnded', (data: GameServerResponse) => {
        console.log('🏁 Partie terminée:', JSON.stringify(data, null, 2))
        this.gameState = data.gameState ?? null
      })

      this.socket.on('opponentDisconnected', () => {
        this.error = "Votre adversaire s'est déconnecté."
        console.warn('⚠️ Adversaire déconnecté')
      })

      this.socket.on('error', (err: string | SocketError) => {
        this.error = typeof err === 'string' ? err : err.message
        console.error('❌ Erreur Socket:', this.error)
      })

      this.socket.on('connect_error', (err) => {
        console.error('❌ Erreur connexion:', err.message)
      })

      this.socket.onAny((eventName, ...args) => {
        console.log(
          '📨 Événement reçu:',
          eventName,
          JSON.stringify(args, null, 2),
        )
      })
    },

    createRoom(deckId: number) {
      if (!this.socket) return
      const payload = { deckId: Number(deckId) }

      this.socket.emit('createRoom', payload, (response: ServerResponse) => {
        if (response.error) {
          console.error('Erreur serveur:', response.error)
        } else {
          console.log('Room créée avec succès')
          this.socket?.emit('getRooms')
        }
      })
    },

    joinRoom(roomId: string, deckId: number) {
      if (!this.socket?.connected) return
      console.log('📤 Rejoindre room:', roomId, 'avec deck:', deckId)
      this.socket.emit('joinRoom', { roomId, deckId: Number(deckId) })
    },

    drawCard() {
      if (!this.socket?.connected) return
      console.log('📤 Envoi: drawCards')
      this.socket.emit('drawCards')
    },

    playCard(cardId: number) {
      if (!this.socket?.connected) return
      console.log('📤 Envoi: playCard ID', cardId)
      this.socket.emit('playCard', { cardId })
    },

    attack() {
      if (!this.socket?.connected) return
      console.log('📤 Envoi: attack')
      this.socket.emit('attack')
    },

    endTurn() {
      if (!this.socket?.connected) return
      console.log('📤 Envoi: endTurn')
      this.socket.emit('endTurn')
    },

    resetGame() {
      this.gameState = null
      this.error = null
      this.socket?.emit('getRooms')
    },

    async deleteDeck(id: number) {
      const api = useApi()
      await api.deleteDeck(id)
      this.decks = this.decks.filter((d) => d.id !== id)
    },
  },
})
