<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import type { Card } from '@/types'

import CardGrid from '../components/layout/CardGrid.vue'

const api = useApi()
const router = useRouter()

const allCards = ref<Card[]>([])
const deckName = ref('')
const selectedIds = ref<number[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    allCards.value = await api.getCards()
  } catch {
    alert('Erreur lors du chargement des cartes')
  } finally {
    isLoading.value = false
  }
})

const toggleCard = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else if (selectedIds.value.length < 10) {
    selectedIds.value.push(id)
  }
}

const isInvalid = computed(() => {
  return deckName.value.trim() === '' || selectedIds.value.length !== 10
})

const handleSubmit = async () => {
  if (isInvalid.value) return
  try {
    await api.createDeck({
      name: deckName.value,
      cards: selectedIds.value,
    })
    router.push('/')
  } catch {
    alert('Erreur lors de la création du deck')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">
          Créer un nouveau Deck
        </h1>
        <button
          class="text-sm bg-white border px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition"
          @click="router.push('/')"
        >
          ← Retour au menu
        </button>
      </div>

      <div
        class="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-10 sticky top-4 z-30"
      >
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="flex-1 w-full">
            <label
              class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1"
              >Nom du deck</label
            >
            <input
              v-model="deckName"
              type="text"
              placeholder="Ex: Mon Deck Épique"
              class="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2 text-lg transition-colors"
            />
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-xs text-gray-400 uppercase font-bold">
                Progression
              </p>
              <p
                class="text-xl font-black"
                :class="
                  selectedIds.length === 10
                    ? 'text-emerald-500'
                    : 'text-orange-500'
                "
              >
                {{ selectedIds.length }} / 10
              </p>
            </div>

            <button
              class="px-10 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-30 disabled:grayscale"
              :class="
                isInvalid
                  ? 'bg-gray-400'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'
              "
              :disabled="isInvalid"
              @click="handleSubmit"
            >
              CRÉER LE DECK
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"
        ></div>
        <p class="mt-4 text-gray-500 font-medium">
          Récupération des Pokémon...
        </p>
      </div>

      <CardGrid
        v-else
        :cards="allCards"
        :selected-ids="selectedIds"
        :max-selection="10"
        @toggle-card="toggleCard"
      />
    </div>
  </div>
</template>
