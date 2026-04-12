<script setup lang="ts">
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  useMessage,
} from 'naive-ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import { useAuthStore } from '../stores/auth'

const api = useApi()
const auth = useAuthStore()
const router = useRouter()
const message = useMessage()
const loading = ref(false)
const form = reactive({ email: '', password: '' })

const handleLogin = async () => {
  if (!form.email || !form.password) return
  loading.value = true
  try {
    const res = await api.signIn(form)
    auth.login(res)
    router.push(ROUTES.HOME)
  } catch (err: unknown) {
    const e = err as Error
    message.error(e.message || 'Identifiants incorrects')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="purple-banner">
      <h1>Connexion</h1>
      <p>Page de connexion avec email et mot de passe</p>
    </div>
    <div class="form-container w-full max-w-md mx-auto px-4 md:px-0">
      <NCard class="login-card">
        <NSpace vertical size="large">
          <h2 style="margin: 0">Connexion</h2>
          <NForm @submit.prevent="handleLogin">
            <NFormItem label="Email">
              <NInput
                v-model:value="form.email"
                placeholder="votre@email.com"
                size="large"
              />
            </NFormItem>
            <NFormItem label="Mot de passe">
              <NInput
                v-model:value="form.password"
                type="password"
                placeholder="........"
                show-password-on="mousedown"
                size="large"
              />
            </NFormItem>
            <NButton
              type="primary"
              block
              attr-type="submit"
              :loading="loading"
              color="#18a058"
              size="large"
            >
              Se connecter
            </NButton>
          </NForm>
          <div style="text-align: center">
            Pas encore de compte ?
            <RouterLink
              :to="ROUTES.REGISTER"
              style="color: #335eea; text-decoration: none"
              >S'inscrire</RouterLink
            >
          </div>
        </NSpace>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/* Script répété par erreur dans ton original, je garde la structure propre */
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background-color: #f9fafb;
}
.purple-banner {
  background-color: #a020f0;
  color: white;
  padding: 40px 60px;
}
.purple-banner h1 {
  margin: 0;
  font-size: 24px;
}
.form-container {
  display: flex;
  justify-content: center;
  margin-top: -30px;
}
.login-card {
  max-width: 450px;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
