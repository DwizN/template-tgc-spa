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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/stores/game'
import type { Deck } from '@/types'
import type { DeckCard } from '@/types/card'
import type { Card } from '@/types/card'

const api = useApi()
const gameStore = useGameStore()
const message = useMessage()
const dialog = useDialog()
const router = useRouter()

const decks = computed(() => gameStore.decks)
const loading = ref(true)
const selectedDeckId = ref<number | null>(null)

const typeColors: Record<string, string> = {
  Grass: 'bg-green-500',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-400',
  Psychic: 'bg-pink-500',
  Ice: 'bg-cyan-400',
  Fighting: 'bg-orange-600',
  Poison: 'bg-purple-500',
  Ground: 'bg-yellow-600',
  Flying: 'bg-indigo-400',
  Bug: 'bg-lime-500',
  Rock: 'bg-stone-500',
  Ghost: 'bg-violet-700',
  Dragon: 'bg-indigo-700',
  Dark: 'bg-gray-700',
  Steel: 'bg-slate-400',
  Normal: 'bg-slate-400',
}

const getTypeColor = (type: string) => typeColors[type] ?? 'bg-slate-400'

const getDeckThumbnails = (deckCards: DeckCard[]): Card[] => {
  if (!gameStore.allCards || gameStore.allCards.length === 0) return []
  return deckCards
    .map((dc: DeckCard) =>
      gameStore.allCards.find((c: Card) => c.id === dc.cardId),
    )
    .filter((c): c is Card => !!c)
    .slice(0, 10)
}

const loadDecks = async () => {
  try {
    loading.value = true
    await gameStore.fetchLobbyData()
    if (decks.value.length > 0 && !selectedDeckId.value) {
      selectedDeckId.value = decks.value[0].id
    }
  } catch (e: unknown) {
    message.error('Impossible de charger les données')
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
        await gameStore.deleteDeck(id)
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

        <!-- Mes decks -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Mes decks</h2>
          <NButton
            type="success"
            size="small"
            @click="router.push('/decks/create')"
            >+ Nouveau deck</NButton
          >
        </div>

        <div class="space-y-8">
          <div
            v-for="deck in decks"
            :key="deck.id"
            class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <!-- Deck header -->
            <div class="flex justify-between items-center mb-5">
              <h3 class="text-lg font-bold text-slate-800">{{ deck.name }}</h3>
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

            <!-- Cards grid -->
            <div
              v-if="getDeckThumbnails(deck.cards).length > 0"
              class="flex flex-wrap gap-2"
            >
              <div
                v-for="card in getDeckThumbnails(deck.cards)"
                :key="card.id"
                class="bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 px-2 py-1.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  :src="card.imgUrl"
                  :alt="card.name"
                  class="h-10 w-10 object-contain flex-shrink-0"
                />
                <div class="flex flex-col gap-0.5 min-w-0">
                  <span class="text-[9px] text-slate-400 font-medium"
                    >#{{
                      String(card.pokedexNumber ?? card.id).padStart(3, '0')
                    }}</span
                  >
                  <span
                    class="text-xs font-bold text-slate-700 truncate leading-tight"
                    >{{ card.name }}</span
                  >
                  <span
                    class="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full w-fit"
                    :class="getTypeColor(card.type)"
                  >
                    {{ card.type }}
                  </span>
                  <div
                    class="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium"
                  >
                    <span
                      ><span class="text-red-400">♥</span> {{ card.hp }}</span
                    >
                    <span class="text-slate-300">·</span>
                    <span
                      ><span class="text-slate-400">⚔</span>
                      {{ card.attack }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 text-slate-400 text-sm">
              Chargement des cartes...
            </div>
          </div>
        </div>
      </NSpin>
    </div>
  </div>
</template>
