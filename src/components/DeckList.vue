<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import type { Deck } from '@/types'

const router = useRouter()
const api = useApi()

const decks = ref<Deck[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// RG1 — Chargement au montage
onMounted(async () => {
  try {
    isLoading.value = true
    decks.value = await api.getMyDecks()
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Erreur lors du chargement'
  } finally {
    isLoading.value = false
  }
})

// RG4 — Bouton création
const handleCreateDeck = () => {
  router.push({ name: 'CreateDeck' })
}

const handleViewDeck = (deckId: number) => {
  router.push({ name: 'DeckDetail', params: { id: deckId } })
}

const handleEditDeck = (deckId: number) => {
  router.push({ name: 'EditDeck', params: { id: deckId } })
}

// RG3 — Suppression + rafraîchissement automatique
const handleDeleteDeck = async (deckId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce deck ?')) return
  try {
    await api.deleteDeck(deckId)
    decks.value = decks.value.filter((d) => d.id !== deckId)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Erreur lors de la suppression'
  }
}
</script>

<template>
  <div>
    <!-- En-tête + RG4 bouton création -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes decks</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ decks.length }} deck{{ decks.length > 1 ? 's' : '' }}
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
        @click="handleCreateDeck"
      >
        + Créer un deck
      </button>
    </div>

    <!-- Erreur -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ error }}
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="text-center py-12 text-gray-400">
      Chargement...
    </div>

    <!-- État vide -->
    <div
      v-else-if="decks.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <p class="text-4xl mb-3">📭</p>
      <p class="text-gray-500 mb-4">Aucun deck créé pour le moment</p>
      <button
        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
        @click="handleCreateDeck"
      >
        Créer mon premier deck
      </button>
    </div>

    <!-- RG1 — Liste des decks -->
    <div v-else class="space-y-4">
      <div
        v-for="deck in decks"
        :key="deck.id"
        class="border border-gray-200 rounded-xl p-5 bg-white hover:border-green-300 hover:shadow-sm transition-all"
      >
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-gray-900 text-lg">{{ deck.name }}</h3>
            <p class="text-sm text-gray-400">
              {{ deck.cards.length }}/10 cartes
            </p>
          </div>

          <!-- RG2 — Actions : voir, modifier, supprimer -->
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 text-blue-600 border border-blue-200 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors"
              @click="handleViewDeck(deck.id)"
            >
              Voir
            </button>
            <button
              class="px-3 py-1.5 text-gray-700 border border-gray-200 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
              @click="handleEditDeck(deck.id)"
            >
              Modifier
            </button>
            <button
              class="px-3 py-1.5 text-red-600 border border-red-200 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
              @click="handleDeleteDeck(deck.id)"
            >
              Supprimer
            </button>
          </div>
        </div>

        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full transition-all"
            :style="{ width: `${(deck.cards.length / 10) * 100}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
