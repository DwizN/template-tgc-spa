<script setup lang="ts">
import {
  NButton,
  NCard,
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
  <div
    class="h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col"
  >
    <div
      v-if="!gameStore.gameState"
      class="h-full flex flex-col items-center justify-center bg-slate-900 text-white"
    >
      <NSpin size="large" stroke="white" />
      <p class="mt-4 text-slate-400 italic">Synchronisation du combat...</p>
    </div>

    <div v-else class="h-full flex flex-col">
      <div
        class="flex-1 p-4 md:p-6 flex flex-col items-center justify-center relative border-b border-slate-200"
      >
        <div class="absolute top-4 left-6 flex flex-col gap-1 text-left">
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
          >
            Adversaire
          </p>
          <div class="flex gap-1 text-lg md:text-xl">
            <span
              v-for="i in 3"
              :key="i"
              :class="
                i <= (gameStore.opponentBoard?.score || 0)
                  ? 'text-yellow-400'
                  : 'text-slate-200'
              "
              >★</span
            >
          </div>
        </div>

        <div
          v-if="gameStore.opponentBoard?.activeCard"
          class="w-36 s:w-40 md:w-48 aspect-[3/4] bg-white rounded-xl shadow-lg border border-slate-200 p-3 md:p-4 flex flex-col animate-fade-in"
        >
          <p class="text-[10px] text-slate-400 font-mono mb-1">
            #{{ gameStore.opponentBoard.activeCard.id }}
          </p>
          <p
            class="font-black uppercase text-xs md:text-sm leading-tight text-slate-800 truncate"
          >
            {{ gameStore.opponentBoard.activeCard.name }}
          </p>
          <div
            class="flex-1 bg-slate-50 rounded-lg my-2 flex items-center justify-center text-3xl md:text-4xl grayscale opacity-80"
          >
            👾
          </div>
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
          <p class="text-[10px] text-right font-bold text-red-500 mt-1">
            {{ gameStore.opponentBoard.activeCard.currentHp }} HP
          </p>
        </div>
        <div v-else class="flex flex-col items-center opacity-30">
          <div
            class="w-36 s:w-40 md:w-48 aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center"
          >
            <span class="text-xs italic text-center px-4">En attente...</span>
          </div>
        </div>
      </div>

      <div
        class="bg-white shadow-sm z-10 flex flex-col md:flex-row items-center justify-between p-3 md:px-10 border-y border-slate-200 gap-3"
      >
        <div class="flex flex-col gap-1 items-center md:items-start">
          <NTag
            :type="gameStore.isMyTurn ? 'success' : 'default'"
            size="medium"
            round
            class="font-bold px-6"
          >
            {{ gameStore.isMyTurn ? "C'EST VOTRE TOUR" : 'TOUR ADVERSAIRE' }}
          </NTag>
          <p
            class="text-[9px] text-slate-400 font-mono uppercase tracking-tighter hidden md:block"
          >
            Deck: {{ gameStore.myBoard?.deck?.length || 0 }} | Main:
            {{ gameStore.myBoard?.hand?.length || 0 }}/5
          </p>
        </div>

        <div class="flex gap-2 w-full md:w-auto">
          <NButton
            secondary
            strong
            round
            size="small"
            class="flex-1 md:flex-none"
            :disabled="!gameStore.isMyTurn"
            @click="handleDraw"
            >PIOCHER</NButton
          >
          <NButton
            type="error"
            strong
            round
            size="small"
            class="flex-1 md:flex-none"
            :disabled="!gameStore.isMyTurn || !gameStore.myBoard?.activeCard"
            @click="gameStore.attack()"
            >ATTAQUER</NButton
          >
          <NButton
            tertiary
            strong
            round
            size="small"
            class="flex-1 md:flex-none"
            :disabled="!gameStore.isMyTurn"
            @click="gameStore.endTurn()"
            >FIN DU TOUR</NButton
          >
        </div>
      </div>

      <div
        class="flex-[1.5] p-4 md:p-6 flex flex-col relative bg-slate-100/30 overflow-hidden"
      >
        <div class="absolute top-4 left-6 text-left">
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
          >
            Vous
          </p>
          <div class="flex gap-1 text-lg md:text-xl">
            <span
              v-for="i in 3"
              :key="i"
              :class="
                i <= (gameStore.myBoard?.score || 0)
                  ? 'text-blue-500'
                  : 'text-slate-200'
              "
              >★</span
            >
          </div>
        </div>

        <div class="flex-1 flex items-center justify-center mb-4">
          <div
            v-if="gameStore.myBoard?.activeCard"
            class="w-40 s:w-48 md:w-56 aspect-[3/4] bg-white rounded-2xl shadow-2xl border-2 border-blue-400 p-4 md:p-5 flex flex-col transform transition-all animate-fade-in"
          >
            <div class="flex justify-between items-start mb-1">
              <p class="text-[10px] text-slate-400 font-mono">
                #{{ gameStore.myBoard.activeCard.id }}
              </p>
              <div
                class="px-2 py-0.5 bg-blue-100 rounded text-[8px] font-bold text-blue-600 uppercase"
              >
                Actif
              </div>
            </div>
            <p
              class="font-black uppercase text-xs md:text-base mb-1 text-slate-800 truncate"
            >
              {{ gameStore.myBoard.activeCard.name }}
            </p>
            <div
              class="flex-1 bg-blue-50/50 rounded-xl my-2 flex items-center justify-center text-4xl md:text-5xl"
            >
              🔥
            </div>
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
            <div class="flex justify-between items-center mt-2">
              <span
                class="text-[9px] md:text-[10px] font-black text-slate-400 italic"
                >ATK: {{ gameStore.myBoard.activeCard.attack }}</span
              >
              <p class="text-[10px] md:text-xs font-bold text-blue-600">
                {{ gameStore.myBoard.activeCard.currentHp }} HP
              </p>
            </div>
          </div>
          <div
            v-else
            class="group border-2 border-dashed border-slate-300 rounded-2xl p-6 md:p-10 flex flex-col items-center gap-2 transition-colors hover:border-blue-300"
          >
            <div
              class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-300"
            >
              ＋
            </div>
            <p
              class="text-slate-400 text-[10px] md:text-xs font-medium text-center"
            >
              Posez un Pokémon actif
            </p>
          </div>
        </div>

        <div
          class="h-32 s:h-40 md:h-44 flex gap-3 overflow-x-auto items-end pb-2 px-2 md:px-10 justify-start sm:justify-center scrollbar-hide"
        >
          <div
            v-for="(card, idx) in gameStore.myBoard?.hand"
            :key="`${card.id}-${idx}`"
            class="min-w-[100px] s:min-w-[110px] md:w-28 h-full bg-white rounded-xl shadow-md border border-slate-200 p-2 md:p-3 flex flex-col transition-all duration-300 group relative"
            :class="
              canPlayCard
                ? 'cursor-pointer hover:-translate-y-4 md:hover:-translate-y-12'
                : 'opacity-40 grayscale'
            "
            @click="handlePlay(card.id)"
          >
            <p
              class="text-[8px] font-bold text-slate-400 uppercase truncate mb-1"
            >
              {{ card.name }}
            </p>
            <div
              class="flex-1 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors"
            ></div>
            <div
              class="flex justify-between items-center mt-2 text-[9px] font-black"
            >
              <span class="text-red-500">❤️ {{ card.hp }}</span>
              <span class="text-blue-500">⚔️ {{ card.attack }}</span>
            </div>
          </div>
        </div>
      </div>

      <NModal v-model:show="showEndModal" :mask-closable="false">
        <NCard
          style="width: 90%; max-width: 450px"
          class="text-center rounded-3xl shadow-2xl border-none"
        >
          <NResult
            :status="isWinner ? 'success' : 'error'"
            :title="isWinner ? 'VICTOIRE ÉPIQUE !' : 'DÉFAITE...'"
            :description="
              isWinner
                ? 'Vous avez terrassé votre adversaire.'
                : 'Votre deck n\'a pas suffi cette fois-ci.'
            "
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
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
