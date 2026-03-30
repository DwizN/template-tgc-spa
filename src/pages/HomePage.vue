<script setup lang="ts">
import { NButton, NCard, NDivider, NFlex, NSpin, NText } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CardItem from '@/components/CardItem.vue'
import { useApi } from '@/composables/useApi'
import type { Card, Deck } from '@/types'

const router = useRouter()
const api = useApi()

const decks = ref<Deck[]>([])
const cards = ref<Card[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const [decksData, cardsData] = await Promise.all([
      api.getMyDecks(),
      api.getCards(),
    ])
    decks.value = decksData
    cards.value = cardsData
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Erreur lors du chargement'
  } finally {
    isLoading.value = false
  }
})

const availableDecks = computed(() => decks.value || [])

const getDeckCards = (deck: Deck) => {
  return deck.cards
    .map((dc) => cards.value.find((c) => c.id === dc.cardId))
    .filter(Boolean) as Card[]
}

const handleNewDeck = () => {
  router.push({ name: 'CreateDeck' })
}

const handleEditDeck = (deckId: number) => {
  router.push({ name: 'EditDeck', params: { id: deckId } })
}

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
  <div style="padding: 24px; max-width: 1000px; margin: 0 auto">
    <!-- En-tête section Mes decks -->
    <NFlex justify="space-between" align="center" style="margin-bottom: 16px">
      <NText style="font-size: 20px; font-weight: 600">Mes decks</NText>
      <NButton type="primary" @click="handleNewDeck"> + Nouveau deck </NButton>
    </NFlex>

    <NSpin :show="isLoading">
      <!-- État vide -->
      <div
        v-if="!isLoading && availableDecks.length === 0"
        style="padding: 32px 0; color: #888; text-align: center"
      >
        Aucun deck
      </div>

      <!-- Liste des decks -->
      <div v-else>
        <NCard
          v-for="deck in availableDecks"
          :key="deck.id"
          style="margin-bottom: 12px"
          :content-style="{ padding: '16px 20px' }"
        >
          <!-- Nom + actions -->
          <NFlex justify="space-between" align="center">
            <NText style="font-size: 16px; font-weight: 500">{{
              deck.name
            }}</NText>
            <NFlex gap="8">
              <NButton size="small" @click="handleEditDeck(deck.id)">
                Modifier
              </NButton>
              <NButton
                size="small"
                type="error"
                @click="handleDeleteDeck(deck.id)"
              >
                Supprimer
              </NButton>
            </NFlex>
          </NFlex>

          <!-- Cartes du deck -->
          <NDivider style="margin: 12px 0" />
          <div
            style="
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 4px;
            "
          >
            <CardItem
              v-for="card in getDeckCards(deck)"
              :key="card.id"
              :card="card"
              size="md"
            />
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>
