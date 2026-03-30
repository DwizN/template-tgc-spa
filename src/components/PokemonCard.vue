<script setup lang="ts">
import { NCard, NText } from 'naive-ui'
import { computed } from 'vue'

import { useColors } from '@/composables/useColors'
import type { Card } from '@/types'

interface Props {
  card: Card
  size?: 'sm' | 'md'
  isSelected?: boolean
  isDisabled?: boolean
  currentHp?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  isSelected: false,
  isDisabled: false,
  currentHp: undefined,
})

defineEmits<{ click: [] }>()

const { getTypeColor, hpColor } = useColors()

const cardWidth = computed(() => ({ sm: '100px', md: '140px' })[props.size])
const imgHeight = computed(() => ({ sm: '100px', md: '120px' })[props.size])
const fontSize = computed(() => ({ sm: '10px', md: '12px' })[props.size])

const hpPercentage = computed(() => {
  if (props.currentHp === undefined) return 100
  return Math.max(0, Math.min(100, (props.currentHp / props.card.hp) * 100))
})

const hpBarColor = computed(() => hpColor(hpPercentage.value))

const borderStyle = computed(() => {
  if (props.isSelected) return '2px solid #18a058'
  return '1px solid #e0e0e6'
})

const cardStyle = computed(() => ({
  width: cardWidth.value,
  cursor: props.isDisabled ? 'not-allowed' : 'pointer',
  opacity: props.isDisabled ? 0.4 : 1,
  border: borderStyle.value,
  boxShadow: props.isSelected ? '0 0 0 2px #18a05830' : undefined,
  transition: 'all 0.2s',
  flexShrink: '0',
  position: 'relative' as const,
}))
</script>

<template>
  <div :style="cardStyle" @click="!isDisabled && $emit('click')">
    <NCard
      :content-style="{ padding: '0' }"
      :style="{ border: 'none', borderRadius: '8px', overflow: 'hidden' }"
    >
      <!-- Image -->
      <div
        :style="{
          height: imgHeight,
          overflow: 'hidden',
          background: '#f5f5f5',
        }"
      >
        <img
          :src="card.imgUrl"
          :alt="card.name"
          :style="{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }"
          loading="lazy"
        />
      </div>

      <!-- Infos -->
      <div :style="{ padding: '6px 8px', background: '#fff' }">
        <!-- Numéro Pokédex + nom -->
        <div>
          <NText
            :style="{ fontSize: fontSize, color: '#999', display: 'block' }"
          >
            #{{ String(card.pokedexNumber).padStart(3, '0') }}
          </NText>
          <NText
            :style="{
              fontSize: fontSize,
              fontWeight: '600',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }"
          >
            {{ card.name }}
          </NText>
        </div>

        <!-- Type -->
        <div :style="{ marginTop: '4px' }">
          <span
            :style="{
              fontSize: '10px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: getTypeColor(card.type),
              padding: '1px 6px',
              borderRadius: '4px',
              display: 'inline-block',
            }"
          >
            {{ card.type }}
          </span>
        </div>

        <!-- HP / Attaque -->
        <div
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }"
        >
          <NText :style="{ fontSize: fontSize, color: '#d03050' }"
            >❤ {{ card.hp }}</NText
          >
          <NText :style="{ fontSize: fontSize, color: '#f0a020' }"
            >⚔️ {{ card.attack }}</NText
          >
        </div>

        <!-- Barre HP courants (RG4) -->
        <div v-if="currentHp !== undefined" :style="{ marginTop: '4px' }">
          <div
            :style="{
              width: '100%',
              height: '4px',
              background: '#eee',
              borderRadius: '2px',
              overflow: 'hidden',
            }"
          >
            <div
              :style="{
                width: `${hpPercentage}%`,
                height: '100%',
                backgroundColor: hpBarColor,
                transition: 'width 0.4s',
              }"
            />
          </div>
          <NText
            :style="{
              fontSize: '10px',
              color: '#999',
              display: 'block',
              textAlign: 'center',
              marginTop: '2px',
            }"
          >
            {{ currentHp }}/{{ card.hp }}
          </NText>
        </div>
      </div>

      <!-- Badge sélection -->
      <div
        v-if="isSelected"
        :style="{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '18px',
          height: '18px',
          background: '#18a058',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </NCard>
  </div>
</template>
