<template>
  <NConfigProvider>
    <NDialogProvider>
      <NMessageProvider>
        <NLayout>
          <HeaderBar v-if="auth.isAuthenticated" />

          <NLayoutContent :style="auth.isAuthenticated ? 'padding: 24px' : ''">
            <RouterView />
          </NLayoutContent>
        </NLayout>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NLayout,
  NLayoutContent,
  NMessageProvider,
} from 'naive-ui'

import HeaderBar from './components/layout/HeaderBar.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f8fafc; /* Pour coller au gris clair Figma */
  font-family:
    v-sans,
    system-ui,
    -apple-system,
    sans-serif;
}
</style>
