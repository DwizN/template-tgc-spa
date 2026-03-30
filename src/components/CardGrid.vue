<script setup lang="ts">
import { computed } from 'vue'

import type { Card as CardType } from '@/types'

import CardItem from './CardItem.vue'

interface Props {
  cards: CardType[]
  selectedCards?: number[]
  maxSelectable?: number | null
  size?: 'sm' | 'md'
  readonly?: boolean
}

interface Emits {
  'update:selectedCards': [cards: number[]]
}

const props = withDefaults(defineProps<Props>(), {
  selectedCards: () => [],
  maxSelectable: null,
  size: 'md',
  readonly: false,
})

const emit = defineEmits<Emits>()

const selectedSet = computed(() => new Set(props.selectedCards))

const isCardDisabled = computed(() => (cardId: number) => {
  if (props.readonly) return false
  if (props.maxSelectable === null) return false
  if (selectedSet.value.has(cardId)) return false
  return selectedSet.value.size >= props.maxSelectable
})

const isCardSelected = computed(
  () => (cardId: number) => selectedSet.value.has(cardId),
)

const handleCardClick = (cardId: number) => {
  if (props.readonly) return
  if (isCardDisabled.value(cardId)) return

  const newSelected = new Set(selectedSet.value)
  if (newSelected.has(cardId)) {
    newSelected.delete(cardId)
  } else {
    newSelected.add(cardId)
  }
  emit('update:selectedCards', Array.from(newSelected))
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <CardItem
      v-for="card in cards"
      :key="card.id"
      :card="card"
      :size="size"
      :is-selected="isCardSelected(card.id)"
      :is-disabled="isCardDisabled(card.id)"
      @click="handleCardClick(card.id)"
    />
  </div>
</template>
