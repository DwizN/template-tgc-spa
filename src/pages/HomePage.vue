<script setup lang="ts">
import {
  NButton,
  NCard,
  NEmpty,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  useMessage,
} from 'naive-ui'
import { onMounted, ref } from 'vue'

import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/stores/game'
import type { Deck } from '@/types'

const api = useApi()
const gameStore = useGameStore()
const message = useMessage()

const decks = ref<Deck[]>([])
const loading = ref(true)
const selectedDeckId = ref<number | null>(null)

onMounted(async () => {
  try {
    // RG2 : Chargement initial
    const data = await api.getMyDecks()
    decks.value = data

    if (decks.value.length > 0) {
      selectedDeckId.value = decks.value[0].id
    }

    // RG1 : Connexion Socket.io authentifiée
    gameStore.connect()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    message.error('Impossible de charger les decks')
  } finally {
    loading.value = false
  }
})

// RG3 : Créer une room
const handleCreate = () => {
  if (selectedDeckId.value) {
    gameStore.createRoom(selectedDeckId.value)
  } else {
    message.warning("Veuillez sélectionner un deck d'abord")
  }
}

// RG4 : Rejoindre une room existante
const handleJoin = (roomId: string) => {
  if (selectedDeckId.value) {
    gameStore.joinRoom(roomId, selectedDeckId.value)
  } else {
    message.warning("Veuillez sélectionner un deck d'abord")
  }
}
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-800 tracking-tighter italic">
          TCG LOBBY
        </h1>
        <p class="text-slate-500 uppercase text-xs font-bold tracking-widest">
          Arène de combat Pokémon
        </p>
      </div>
      <NButton secondary type="primary" @click="$router.push('/decks/create')">
        + CRÉER UN DECK
      </NButton>
    </div>

    <NSpin :show="loading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <NCard
          title="1. Ton Deck"
          hoverable
          class="shadow-md border-t-4 border-blue-500"
        >
          <NSpace vertical size="large">
            <p class="text-gray-500 text-sm italic">
              Sélectionne ton deck de 10 cartes avant de lancer un défi.
            </p>

            <NSelect
              v-model:value="selectedDeckId"
              :options="decks.map((d) => ({ label: d.name, value: d.id }))"
              placeholder="Choisir un deck..."
            />

            <div
              v-if="decks.length === 0 && !loading"
              class="text-center p-4 bg-orange-50 rounded-lg"
            >
              <p class="text-orange-600 text-xs font-bold">
                Attention : Tu dois avoir au moins un deck pour jouer.
              </p>
            </div>

            <NButton
              type="primary"
              block
              size="large"
              :disabled="!selectedDeckId"
              class="font-black"
              @click="handleCreate"
            >
              CRÉER UN SALON
            </NButton>
          </NSpace>
        </NCard>

        <NCard
          title="2. Défis en cours"
          class="md:col-span-2 shadow-md border-t-4 border-green-500"
        >
          <div v-if="gameStore.rooms.length === 0" class="py-12 text-center">
            <NEmpty description="Aucun salon disponible pour le moment..." />
            <p class="text-slate-400 text-xs mt-2">
              Crée le premier salon pour attendre un adversaire !
            </p>
          </div>

          <div
            v-for="room in gameStore.rooms"
            :key="room.id"
            class="flex justify-between items-center p-5 border-2 rounded-xl bg-white hover:border-blue-400 transition-all shadow-sm"
          >
            <div>
              <p class="font-bold text-lg text-slate-700 font-mono">
                #{{ String(room.id).slice(0, 8).toUpperCase() }}
              </p>
              <NTag
                :type="(room.players?.length || 0) < 2 ? 'success' : 'warning'"
                round
                size="small"
                class="font-bold"
              >
                {{ room.players?.length || 0 }} / 2 JOUEURS
              </NTag>
            </div>

            <NButton
              secondary
              type="info"
              size="large"
              :disabled="!selectedDeckId || (room.players?.length || 0) >= 2"
              class="font-bold"
              @click="handleJoin(room.id)"
            >
              REJOINDRE
            </NButton>
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.hover\:border-blue-400:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
</style>
