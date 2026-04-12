<script setup lang="ts">
import { NButton, NCard, NEmpty, NScrollbar, NSelect, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue'

import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// L'ID du deck sélectionné par l'utilisateur
const selectedDeckId = ref<number | null>(null)

// Les options de deck (vérifie que ces IDs existent bien sur ton API)
const deckOptions = [
  { label: 'Deck Feu (10 cartes)', value: 1 },
  { label: 'Deck Eau (10 cartes)', value: 2 },
  { label: 'Deck Test #9', value: 9 },
]

onMounted(() => {
  // Connexion socket au montage du lobby
  gameStore.connect()
})

const handleCreate = () => {
  if (selectedDeckId.value) {
    // eslint-disable-next-line no-console
    console.log('📤 Création de salle avec le deck ID:', selectedDeckId.value)
    gameStore.createRoom(selectedDeckId.value)
  }
}

const handleJoin = (roomId: string) => {
  if (selectedDeckId.value) {
    // eslint-disable-next-line no-console
    console.log(
      '📤 Rejoint la salle',
      roomId,
      'avec le deck ID:',
      selectedDeckId.value,
    )
    gameStore.joinRoom(roomId, selectedDeckId.value)
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <NCard
      title="Lobby de Combat"
      class="shadow-xl rounded-2xl border-2 border-slate-700 bg-slate-800 text-white"
    >
      <div class="space-y-6">
        <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
          <p
            class="text-sm font-bold mb-3 uppercase tracking-wider text-blue-400"
          >
            1. Préparation du Deck
          </p>
          <div class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 w-full">
              <p class="text-[10px] text-slate-400 mb-1 ml-1 uppercase">
                Sélectionner un deck actif
              </p>
              <NSelect
                v-model:value="selectedDeckId"
                :options="deckOptions"
                placeholder="Choisis ton deck pour combattre"
              />
            </div>
            <NButton
              type="primary"
              size="large"
              :disabled="!selectedDeckId"
              class="font-bold w-full sm:w-auto"
              @click="handleCreate"
            >
              CRÉER UNE SALLE
            </NButton>
          </div>
        </div>

        <div>
          <p
            class="text-sm font-bold mb-3 uppercase tracking-wider text-green-400"
          >
            2. Salles disponibles
          </p>
          <NScrollbar style="max-height: 400px" class="pr-2">
            <div v-if="gameStore.rooms.length > 0" class="space-y-3">
              <div
                v-for="room in gameStore.rooms"
                :key="room.id"
                class="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-blue-500 transition-all group"
              >
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-3">
                    <span
                      class="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400"
                    >
                      ID: {{ room.id.slice(0, 8) }}
                    </span>
                    <NTag
                      :type="room.players.length === 1 ? 'success' : 'warning'"
                      size="small"
                      round
                      class="font-bold"
                    >
                      {{ room.players.length }}/2 JOUEURS
                    </NTag>
                  </div>
                  <p class="text-xs text-slate-500 italic mt-1">
                    {{
                      room.players.length === 1
                        ? "En attente d'un adversaire..."
                        : 'Salle complète'
                    }}
                  </p>
                </div>

                <NButton
                  secondary
                  type="success"
                  size="medium"
                  :disabled="!selectedDeckId || room.players.length >= 2"
                  @click="handleJoin(room.id)"
                >
                  {{ !selectedDeckId ? 'Choisis un deck' : 'REJOINDRE' }}
                </NButton>
              </div>
            </div>

            <NEmpty
              v-else
              description="Aucun adversaire en attente... Sois le premier à créer une salle !"
              class="py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-700"
            />
          </NScrollbar>
        </div>
      </div>
    </NCard>

    <p
      v-if="!selectedDeckId"
      class="text-center mt-4 text-orange-400 text-xs animate-pulse"
    >
      ⚠️ Tu dois sélectionner un deck pour pouvoir créer ou rejoindre une
      partie.
    </p>
  </div>
</template>

<style scoped>
:deep(.n-base-selection) {
  --n-border: 1px solid #475569 !important;
  --n-color: #1e293b !important;
  --n-text-color: #f8fafc !important;
}
</style>
