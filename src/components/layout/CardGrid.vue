<script setup lang="ts">
import type { Card } from '@/types'

import BaseCard from './BaseCard.vue'

const props = defineProps<{
  cards: Card[]
  selectedIds: number[]
  maxSelection?: number
}>()

const emit = defineEmits<{
  'toggle-card': [id: number]
}>()
</script>

<template>
  <div
    class="grid-container"
    style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      padding: 20px;
    "
  >
    <BaseCard
      v-for="card in props.cards"
      :key="card.id"
      :card="card"
      :is-selected="props.selectedIds.includes(card.id)"
      :is-disabled="
        props.maxSelection
          ? props.selectedIds.length >= props.maxSelection &&
            !props.selectedIds.includes(card.id)
          : false
      "
      @click="emit('toggle-card', card.id)"
    />
  </div>
</template>
