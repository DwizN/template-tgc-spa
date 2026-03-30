<script setup lang="ts">
import { NButton, NCard, NFlex, NSpin, NText } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardItem from '@/components/CardItem.vue'
import { useApi } from '@/composables/useApi'
import type { Card, Deck } from '@/types'

const route = useRoute()
const router = useRouter()
const api = useApi()

const deckId = computed(() => Number(route.params.id))
const deck = ref<Deck | null>(null)
const cards = ref<Card[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const [deckData, cardsData] = await Promise.all([
      api.getDeck(deckId.value),
      api.getCards(),
    ])
    deck.value = deckData
    cards.value = cardsData
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Erreur lors du chargement'
  } finally {
    isLoading.value = false
  }
})

// RG1 — Les 10 cartes du deck résolues
const deckCards = computed(() => {
  if (!deck.value) return []
  return deck.value.cards
    .map((dc) => cards.value.find((c) => c.id === dc.cardId))
    .filter(Boolean) as Card[]
})

// RG2 — Accès au formulaire d'édition
const handleEdit = () => {
  router.push({ name: 'EditDeck', params: { id: deckId.value } })
}

const handleBack = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div style="padding: 24px; max-width: 1000px; margin: 0 auto">
    <NSpin :show="isLoading">
      <div
        v-if="!isLoading && error"
        style="color: #d4380d; font-size: 14px; margin-bottom: 16px"
      >
        {{ error }}
      </div>

      <!-- RG1 — Détail du deck -->
      <div v-else-if="deck">
        <NFlex
          justify="space-between"
          align="center"
          style="margin-bottom: 20px"
        >
          <NText style="font-size: 20px; font-weight: 600">{{
            deck.name
          }}</NText>
          <NFlex gap="8">
            <!-- RG2 — Bouton édition -->
            <NButton type="primary" @click="handleEdit">
              Modifier le deck
            </NButton>
            <NButton @click="handleBack"> Retour </NButton>
          </NFlex>
        </NFlex>

        <!-- RG1 — Cartes en lecture seule -->
        <NCard>
          <div
            style="
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
              max-width: 780px;
              margin: 0 auto;
            "
          >
            <CardItem
              v-for="card in deckCards"
              :key="card.id"
              :card="card"
              size="md"
            />
          </div>
        </NCard>
      </div>

      <!-- Deck introuvable -->
      <div v-else-if="!isLoading">
        <NText>Deck introuvable.</NText>
        <NButton style="margin-top: 16px" @click="handleBack">
          Retour à l'accueil
        </NButton>
      </div>
    </NSpin>
  </div>
</template>
