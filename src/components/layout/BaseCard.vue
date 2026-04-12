<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '@/types'

const props = defineProps<{
  card: Card
  size?: 'sm' | 'md'
  isSelected?: boolean
  isDisabled?: boolean
  currentHp?: number
}>()

const typeColor = computed(() => {
  const colors: Record<string, string> = {
    Fire: 'bg-orange-500',
    Water: 'bg-blue-400',
    Grass: 'bg-green-500',
    Electric: 'bg-yellow-400',
    Psychic: 'bg-purple-500',
    Normal: 'bg-stone-400',
    Bug: 'bg-lime-500',
  }
  return colors[props.card.type] || 'bg-slate-500'
})
</script>

<template>
  <div
    class="card-item"
    style="
      width: 100%;
      max-width: 200px;
      min-height: 280px;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.2s;
    "
    :style="{
      border: isSelected ? '3px solid #10b981' : '2px solid #e5e7eb',
      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
      opacity: isDisabled && !isSelected ? '0.5' : '1',
      cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
    }"
  >
    <span style="font-size: 10px; color: #9ca3af"
      >#{{ card.pokedexNumber }}</span
    >

    <div
      style="
        height: 100px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
      "
    >
      <img
        :src="card.image || card.imgUrl"
        :alt="card.name"
        style="max-height: 100%; max-width: 100%; object-fit: contain"
      />
    </div>

    <div
      style="
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 5px;
        text-align: center;
        font-size: 14px;
      "
    >
      {{ card.name }}
    </div>

    <div
      :class="typeColor"
      style="
        padding: 2px 8px;
        border-radius: 4px;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 10px;
      "
    >
      {{ card.type }}
    </div>

    <div
      style="
        display: flex;
        gap: 15px;
        margin-top: auto;
        font-size: 12px;
        font-weight: bold;
      "
    >
      <div style="color: #ef4444">❤️ {{ card.hp }}</div>
      <div style="color: #6b7280">⚔️ {{ card.attack }}</div>
    </div>
  </div>
</template>
