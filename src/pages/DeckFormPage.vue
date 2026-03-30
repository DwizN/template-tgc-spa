<script setup lang="ts">
import {
  NButton,
  NFlex,
  NForm,
  NFormItem,
  NInput,
  NSpin,
  NText,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '@/components/CardGrid.vue'
import { useApi } from '@/composables/useApi'
import type { Card } from '@/types'

const route = useRoute()
const router = useRouter()
const api = useApi()

const deckName = ref('')
const selectedCardIds = ref<number[]>([])
const cards = ref<Card[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// RG1 — Champ de recherche
const searchQuery = ref('')

const mode = computed<'create' | 'edit'>(() =>
  route.path.includes('edit') ? 'edit' : 'create',
)

const deckId = computed(() =>
  mode.value === 'edit' ? Number(route.params.id) : null,
)

const formTitle = computed(() =>
  mode.value === 'create' ? 'Créer un deck' : 'Modifier le deck',
)

// RG2 + RG3 — Filtrage en temps réel, cartes sélectionnées toujours visibles
const filteredCards = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return cards.value
  const selectedSet = new Set(selectedCardIds.value)
  return cards.value.filter(
    (c) => c.name.toLowerCase().includes(query) || selectedSet.has(c.id),
  )
})

// Compteur en temps réel
const selectedCardCount = computed(() => selectedCardIds.value.length)

// Validation
const isNameValid = computed(() => deckName.value.trim().length > 0)
const isCardCountValid = computed(() => selectedCardCount.value === 10)
const canSubmit = computed(
  () => isNameValid.value && isCardCountValid.value && !isSubmitting.value,
)

const counterType = computed(() => {
  if (selectedCardCount.value === 10) return 'success'
  if (selectedCardCount.value > 0) return 'warning'
  return 'default'
})

onMounted(async () => {
  try {
    isLoading.value = true
    cards.value = await api.getCards()

    if (mode.value === 'edit' && deckId.value) {
      const deck = await api.getDeck(deckId.value)
      deckName.value = deck.name
      selectedCardIds.value = deck.cards.map((dc) => dc.cardId)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur de chargement'
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  try {
    isSubmitting.value = true
    error.value = null

    if (mode.value === 'create') {
      await api.createDeck({
        name: deckName.value.trim(),
        cards: selectedCardIds.value,
      })
      router.push({ name: 'Home' })
    } else if (deckId.value) {
      await api.updateDeck(deckId.value, {
        name: deckName.value.trim(),
        cards: selectedCardIds.value,
      })
      router.push({ name: 'DeckDetail', params: { id: deckId.value } })
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erreur lors de l'opération"
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (mode.value === 'edit' && deckId.value) {
    router.push({ name: 'DeckDetail', params: { id: deckId.value } })
  } else {
    router.push({ name: 'Home' })
  }
}
</script>

<template>
  <div style="padding: 24px; max-width: 1100px; margin: 0 auto">
    <NText
      style="
        font-size: 20px;
        font-weight: 600;
        display: block;
        margin-bottom: 24px;
      "
    >
      {{ formTitle }}
    </NText>

    <!-- Erreur -->
    <div
      v-if="error"
      style="
        margin-bottom: 16px;
        padding: 12px;
        background: #fff0f0;
        border: 1px solid #ffccc7;
        border-radius: 6px;
        color: #d4380d;
        font-size: 14px;
      "
    >
      {{ error }}
    </div>

    <NSpin :show="isLoading">
      <NForm label-placement="top" style="max-width: 480px">
        <!-- Nom du deck -->
        <NFormItem label="Nom du deck">
          <NInput
            v-model:value="deckName"
            placeholder="Ex: Team Feu"
            clearable
          />
        </NFormItem>
      </NForm>

      <!-- Compteur -->
      <NFlex align="center" gap="12" style="margin-bottom: 16px">
        <NText>Sélectionner exactement 10 cartes</NText>
        <NText :type="counterType" style="font-weight: 600">
          {{ selectedCardCount }}/10
        </NText>
      </NFlex>

      <!-- RG1 — Champ de recherche -->
      <NInput
        v-model:value="searchQuery"
        placeholder="Rechercher une carte par nom..."
        clearable
        style="margin-bottom: 16px; max-width: 360px"
      />

      <!-- RG2 + RG3 — Grille filtrée, sélectionnées toujours visibles -->
      <CardGrid
        :cards="filteredCards"
        :selected-cards="selectedCardIds"
        :max-selectable="10"
        size="sm"
        @update:selected-cards="selectedCardIds = $event"
      />

      <!-- Boutons -->
      <NFlex gap="12" style="margin-top: 24px">
        <NButton
          type="primary"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{
            mode === 'create'
              ? 'Créer le deck'
              : 'Enregistrer les modifications'
          }}
        </NButton>
        <NButton @click="handleCancel"> Annuler </NButton>
      </NFlex>
    </NSpin>
  </div>
</template>
