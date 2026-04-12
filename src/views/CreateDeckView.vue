<script setup lang="ts">
import { NButton, NInput, NSpin, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import type { Card } from '@/types'

import CardGrid from '../components/layout/CardGrid.vue'

const api = useApi()
const router = useRouter()
const message = useMessage()

const allCards = ref<Card[]>([])
const deckName = ref('')
const selectedIds = ref<number[]>([])
const isLoading = ref(true)

// --- RG1 & RG2 : Recherche temps réel ---
const searchQuery = ref('')

const filteredCards = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return allCards.value
  return allCards.value.filter((card) =>
    card.name.toLowerCase().includes(query),
  )
})

onMounted(async () => {
  try {
    allCards.value = await api.getCards()
  } catch {
    message.error('Erreur lors du chargement des cartes')
  } finally {
    isLoading.value = false
  }
})

// --- RG3 : La sélection reste même si la carte est filtrée ---
const toggleCard = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else if (selectedIds.value.length < 10) {
    selectedIds.value.push(id)
  } else {
    message.warning('Maximum 10 cartes autorisées')
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
    message.success('Deck créé avec succès !')
    router.push('/')
  } catch {
    message.error('Erreur lors de la création du deck')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 text-left">
    <div class="max-w-6xl mx-auto">
      <div
        class="flex justify-between items-center mb-8 pb-4 border-b border-slate-200"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
            Nouveau Deck
          </h1>
          <p class="text-slate-400 text-xs">
            Sélectionnez exactement 10 cartes pour votre deck
          </p>
        </div>
        <NButton secondary @click="router.push('/')"> ← Retour </NButton>
      </div>

      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 sticky top-4 z-30"
      >
        <div class="flex flex-col lg:flex-row gap-6 items-end">
          <div class="flex-1 w-full">
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Nom du deck
            </p>
            <NInput
              v-model:value="deckName"
              placeholder="Ex: Épée et Bouclier"
              size="large"
            />
          </div>

          <div class="flex-1 w-full">
            <p
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Rechercher une carte
            </p>
            <NInput
              v-model:value="searchQuery"
              placeholder="🔍 Pikachu, Dracaufeu..."
              size="large"
              clearable
            />
          </div>

          <div class="flex items-center gap-6 min-w-fit">
            <div class="text-right">
              <p class="text-[10px] text-slate-400 uppercase font-bold">
                Progression
              </p>
              <p
                class="text-xl font-black"
                :class="
                  selectedIds.length === 10
                    ? 'text-green-500'
                    : 'text-orange-500'
                "
              >
                {{ selectedIds.length }} / 10
              </p>
            </div>

            <NButton
              type="success"
              size="large"
              :disabled="isInvalid"
              class="px-8 font-bold shadow-lg"
              @click="handleSubmit"
            >
              CRÉER
            </NButton>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center py-24">
        <NSpin size="large" />
        <p class="mt-4 text-slate-400 font-medium">
          Récupération des cartes...
        </p>
      </div>

      <div v-else>
        <div
          v-if="filteredCards.length === 0"
          class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200"
        >
          <p class="text-slate-400 italic">
            Aucune carte trouvée pour "{{ searchQuery }}"
          </p>
          <NButton
            quaternary
            size="small"
            class="mt-4"
            @click="searchQuery = ''"
          >
            Effacer la recherche
          </NButton>
        </div>

        <CardGrid
          v-else
          :cards="filteredCards"
          :selected-ids="selectedIds"
          :max-selection="10"
          @toggle-card="toggleCard"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-input) {
  border-radius: 12px;
  background-color: #f8fafc;
}

:deep(.n-input:not(.n-input--focus)) {
  border-color: #e2e8f0;
}
</style>
