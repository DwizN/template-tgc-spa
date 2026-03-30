<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <!-- Navbar visible seulement si connecté -->
        <HeaderBar v-if="isAuthenticated" />

        <NLayoutContent class="overflow-auto">
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/store/auth'

import HeaderBar from './components/layout/HeaderBar.vue'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>

<style scoped>
:deep(.n-layout-content) {
  padding: 20px;
}
</style>
