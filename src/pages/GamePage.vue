<script setup lang="ts">
import {
  NButton,
  NCard,
  NEmpty,
  NModal,
  NProgress,
  NResult,
  NSpin,
  NTag,
} from 'naive-ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const router = useRouter()

// --- LOGIQUE DE JEU ---

const showEndModal = computed(() => gameStore.gameState?.status === 'finished')

const isWinner = computed(() => {
  if (!gameStore.gameState || !gameStore.socket) return false
  return gameStore.gameState.winner === gameStore.socket.id
})

onMounted(() => {
  if (!gameStore.socket || !gameStore.socket.connected) {
    gameStore.connect()
  }
})

onUnmounted(() => {
  gameStore.resetGame()
})

const handleBackToLobby = () => {
  gameStore.resetGame()
  router.push('/')
}

const handleDraw = () => {
  // eslint-disable-next-line no-console
  console.log('📤 Action: PIOCHER')
  gameStore.drawCard()
}

const handlePlay = (id: number) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (!canPlayCard.value) return
  // eslint-disable-next-line no-console
  console.log('📤 Action: POSER CARTE ID:', id)
  gameStore.playCard(id)
}

// --- LOGIQUE DE VALIDATION ---

const canPlayCard = computed(() => {
  const isMyTurn = gameStore.isMyTurn
  const hasActiveCard = !!gameStore.myBoard?.activeCard
  return isMyTurn && !hasActiveCard
})
</script>

<template>
  <div class="h-screen bg-slate-900 text-white font-sans overflow-hidden">
    <div
      v-if="!gameStore.gameState"
      class="h-full flex flex-col items-center justify-center"
    >
      <NSpin size="large" stroke="white" />
      <p class="mt-4 text-slate-400 italic">Synchronisation du combat...</p>
    </div>

    <div v-else class="h-full flex flex-col p-4">
      <div
        class="flex-1 bg-slate-800/50 rounded-2xl border-2 border-red-500/20 flex flex-col items-center justify-center relative mb-2"
      >
        <div class="absolute top-4 left-4 text-left">
          <p
            class="text-xs uppercase tracking-widest text-red-400 mb-1 font-bold"
          >
            Adversaire
          </p>
          <div class="flex gap-2 text-xl">
            <span
              v-for="i in 3"
              :key="i"
              :class="
                i <= (gameStore.opponentBoard?.score || 0)
                  ? 'text-yellow-400'
                  : 'text-slate-600'
              "
              >★</span
            >
          </div>
        </div>

        <div
          v-if="gameStore.opponentBoard?.activeCard"
          class="text-center animate-fade-in"
        >
          <p class="text-2xl font-black italic uppercase text-white">
            {{ gameStore.opponentBoard.activeCard.name }}
          </p>
          <div class="w-72 mt-2">
            <NProgress
              type="line"
              :percentage="
                ((gameStore.opponentBoard.activeCard.currentHp || 0) /
                  (gameStore.opponentBoard.activeCard.hp || 1)) *
                100
              "
              status="error"
              :show-indicator="false"
            />
            <p
              class="text-right text-[10px] mt-1 text-red-300 font-mono italic"
            >
              {{ gameStore.opponentBoard.activeCard.currentHp || 0 }} /
              {{ gameStore.opponentBoard.activeCard.hp }} HP
            </p>
          </div>
        </div>
        <NEmpty
          v-else
          description="L'adversaire n'a pas encore de Pokémon actif"
        />
      </div>

      <div
        class="h-24 bg-slate-800 rounded-2xl flex items-center justify-between px-10 border-y-4 border-slate-700 shadow-2xl z-10"
      >
        <div class="flex flex-col">
          <NTag
            :type="gameStore.isMyTurn ? 'success' : 'default'"
            size="large"
            round
            class="font-bold"
          >
            {{
              gameStore.isMyTurn
                ? "C'EST VOTRE TOUR"
                : "ATTENTE DE L'ADVERSAIRE"
            }}
          </NTag>
          <p
            class="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-widest"
          >
            Deck: {{ gameStore.myBoard?.deck?.length || 0 }} | Main:
            {{ gameStore.myBoard?.hand?.length || 0 }}/5
          </p>
        </div>

        <div class="flex gap-4">
          <NButton
            size="large"
            type="warning"
            :disabled="!gameStore.isMyTurn"
            @click="handleDraw"
          >
            PIOCHER
          </NButton>

          <NButton
            size="large"
            type="primary"
            :disabled="!gameStore.isMyTurn || !gameStore.myBoard?.activeCard"
            @click="gameStore.attack()"
          >
            ATTAQUER
          </NButton>

          <NButton
            size="large"
            ghost
            :disabled="!gameStore.isMyTurn"
            @click="gameStore.endTurn()"
          >
            FIN DU TOUR
          </NButton>
        </div>
      </div>

      <div
        class="flex-1 bg-slate-800/50 rounded-2xl border-2 border-blue-500/20 flex flex-col items-center mt-2 relative"
      >
        <div class="mt-4 text-center h-24">
          <div v-if="gameStore.myBoard?.activeCard" class="animate-fade-in">
            <p class="text-2xl font-black italic text-blue-400 uppercase">
              {{ gameStore.myBoard.activeCard.name }}
            </p>
            <div class="w-72 mt-1 mx-auto">
              <NProgress
                type="line"
                :percentage="
                  ((gameStore.myBoard.activeCard.currentHp || 0) /
                    (gameStore.myBoard.activeCard.hp || 1)) *
                  100
                "
                status="success"
                :show-indicator="false"
              />
              <p
                class="text-right text-[10px] mt-1 text-blue-300 font-mono italic"
              >
                {{ gameStore.myBoard.activeCard.currentHp || 0 }} /
                {{ gameStore.myBoard.activeCard.hp }} HP
              </p>
            </div>
          </div>
          <div
            v-else
            class="border-2 border-dashed border-slate-600 px-8 py-3 rounded-xl text-slate-500 text-sm inline-block mt-2"
          >
            Posez un Pokémon de votre main pour combattre
          </div>
        </div>

        <div class="mt-auto w-full pb-6">
          <div
            class="flex gap-4 px-10 overflow-x-auto w-full justify-center min-h-[190px]"
          >
            <div
              v-for="(card, idx) in gameStore.myBoard?.hand"
              :key="`${card.id}-${idx}`"
              class="w-32 h-44 bg-gradient-to-br from-white to-slate-200 text-slate-900 rounded-xl p-3 transition-all shadow-2xl flex flex-col border-4 border-transparent group"
              :class="{
                'cursor-pointer hover:-translate-y-6 hover:border-yellow-400':
                  canPlayCard,
                'cursor-not-allowed opacity-50': !canPlayCard,
              }"
              @click="handlePlay(card.id)"
            >
              <div class="flex justify-between items-start">
                <p class="text-[9px] font-mono text-slate-400">
                  #{{ card.id }}
                </p>
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <p
                class="text-xs font-black uppercase leading-tight mt-1 group-hover:text-blue-600"
              >
                {{ card.name }}
              </p>
              <div class="mt-auto border-t border-slate-300 pt-2">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-bold text-red-500"
                    >❤️ {{ card.hp }}</span
                  >
                  <span class="text-[9px] font-bold text-slate-500"
                    >⚔️ {{ card.attack }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NModal v-model:show="showEndModal" :mask-closable="false">
        <NCard style="width: 450px" class="text-center rounded-3xl shadow-2xl">
          <NResult
            :status="isWinner ? 'success' : 'error'"
            :title="isWinner ? 'VICTOIRE ÉPIQUE !' : 'DÉFAITE...'"
            description="Le combat est terminé."
          >
            <template #footer>
              <NButton
                type="primary"
                size="large"
                round
                @click="handleBackToLobby"
                >RETOUR AU LOBBY</NButton
              >
            </template>
          </NResult>
        </NCard>
      </NModal>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
