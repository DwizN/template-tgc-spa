<script setup lang="ts">
import { NGi, NGrid } from 'naive-ui'

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
  <NGrid
    responsive="screen"
    cols="2 s:3 m:4 l:5 xl:6"
    :x-gap="16"
    :y-gap="16"
    class="p-4"
  >
    <NGi v-for="card in props.cards" :key="card.id">
      <BaseCard
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
    </NGi>
  </NGrid>
</template>
