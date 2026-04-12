<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import {
  NButton,
  NCard,
  NGi,
  NGrid,
  NSelect,
  NSpin,
  useDialog,
  useMessage,
} from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/stores/game'
import type { Deck } from '@/types'

const api = useApi()
const gameStore = useGameStore()
const message = useMessage()
const dialog = useDialog()
const router = useRouter()

const decks = ref<Deck[]>([])
const loading = ref(true)
const selectedDeckId = ref<number | null>(null)

const loadDecks = async () => {
  try {
    loading.value = true
    const data = await api.getMyDecks()
    decks.value = data
    if (decks.value.length > 0 && !selectedDeckId.value) {
      selectedDeckId.value = decks.value[0].id
    }
  } catch (e: unknown) {
    message.error('Impossible de charger les decks')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadDecks()
  gameStore.connect()
})

const handleCreate = async () => {
  if (!selectedDeckId.value) {
    message.warning("Veuillez sélectionner un deck d'abord")
    return
  }
  gameStore.createRoom(selectedDeckId.value)
}

const handleJoin = (roomId: string) => {
  if (selectedDeckId.value) {
    gameStore.joinRoom(roomId, selectedDeckId.value)
  } else {
    message.warning("Veuillez sélectionner un deck d'abord")
  }
}

const handleDeleteDeck = (id: number) => {
  dialog.warning({
    title: 'Supprimer le deck',
    content: 'Êtes-vous sûr de vouloir supprimer ce deck ?',
    positiveText: 'Supprimer',
    negativeText: 'Annuler',
    onPositiveClick: async () => {
      try {
        await api.deleteDeck(id)
        decks.value = decks.value.filter((deck) => deck.id !== id)
        message.success('Deck supprimé')
      } catch (e) {
        message.error('Erreur lors de la suppression')
      }
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
    <div
      class="max-w-6xl mx-auto flex justify-between items-center mb-10 pb-4 border-b border-slate-200"
    >
      <div class="flex items-center gap-4">
        <h1
          class="text-blue-700 font-bold text-xl uppercase tracking-tighter border-r pr-4 border-slate-300"
        >
          TCG SPA
        </h1>
        <span class="text-slate-400 text-sm font-medium">Lobby</span>
      </div>
      <NButton secondary size="small" round>Déconnexion</NButton>
    </div>

    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-8">Jouer</h2>

      <NSpin :show="loading">
        <NGrid
          responsive="screen"
          cols="1 m:2"
          :x-gap="20"
          :y-gap="20"
          class="mb-12"
        >
          <NGi>
            <NCard
              title="Créer une partie"
              class="shadow-sm rounded-xl border-none h-full"
            >
              <div class="space-y-4">
                <NSelect
                  v-model:value="selectedDeckId"
                  :options="decks.map((d) => ({ label: d.name, value: d.id }))"
                  placeholder="Sélectionner un deck"
                />
                <NButton
                  type="success"
                  ghost
                  block
                  :disabled="!selectedDeckId"
                  @click="handleCreate"
                >
                  Créer la partie
                </NButton>
              </div>
            </NCard>
          </NGi>

          <NGi>
            <NCard
              title="Parties disponibles"
              class="shadow-sm rounded-xl border-none h-full"
            >
              <div
                v-if="gameStore.rooms.length === 0"
                class="py-10 text-center border-2 border-dashed border-slate-100 rounded-xl"
              >
                <p class="text-slate-400 text-sm">Aucune partie disponible.</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="room in gameStore.rooms"
                  :key="room.id"
                  class="p-4 border border-slate-100 rounded-lg bg-white flex flex-col gap-2"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm"
                      >Partie #{{ String(room.id).slice(0, 5) }}</span
                    >
                  </div>
                  <NButton
                    type="success"
                    size="small"
                    ghost
                    :disabled="!selectedDeckId"
                    @click="handleJoin(String(room.id))"
                  >
                    Rejoindre
                  </NButton>
                </div>
              </div>
            </NCard>
          </NGi>
        </NGrid>

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Mes decks</h2>
          <NButton
            type="success"
            size="small"
            @click="router.push('/decks/create')"
            >+ Nouveau</NButton
          >
        </div>

        <NGrid responsive="screen" cols="1 s:2 l:3" :x-gap="16" :y-gap="16">
          <NGi v-for="deck in decks" :key="deck.id">
            <div
              class="bg-white border border-slate-200 rounded-xl p-6 flex justify-between items-center h-full"
            >
              <span class="text-lg font-semibold text-slate-700">{{
                deck.name
              }}</span>
              <div class="flex gap-2">
                <NButton
                  secondary
                  size="small"
                  @click="router.push(`/decks/edit/${deck.id}`)"
                  >Modifier</NButton
                >
                <NButton
                  type="error"
                  size="small"
                  @click="handleDeleteDeck(deck.id)"
                  >Supprimer</NButton
                >
              </div>
            </div>
          </NGi>
        </NGrid>
      </NSpin>
    </div>
  </div>
</template>
