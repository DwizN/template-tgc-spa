<script setup lang="ts">
import type { Card as CardType } from '@/types'

import PokemonCard from './PokemonCard.vue'

interface Props {
  card: CardType
  size?: 'sm' | 'md'
  isSelected?: boolean
  isDisabled?: boolean
  currentHp?: number
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  isSelected: false,
  isDisabled: false,
  currentHp: undefined,
})

defineEmits<{ click: [] }>()
</script>

<template>
  <PokemonCard
    :card="card"
    :size="size"
    :is-selected="isSelected"
    :is-disabled="isDisabled"
    :current-hp="currentHp"
    @click="$emit('click')"
  />
</template>
