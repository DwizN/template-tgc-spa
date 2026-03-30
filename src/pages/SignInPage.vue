<template>
  <NSpace vertical :size="24" style="max-width: 400px; margin: 60px auto">
    <NCard title="Connexion">
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem label="Email" path="email">
          <NInput
            v-model:value="formValue.email"
            type="email"
            placeholder="votre@email.com"
            @keydown.enter="handleSubmit"
          />
        </NFormItem>
        <NFormItem label="Mot de passe" path="password">
          <NInput
            v-model:value="formValue.password"
            type="password"
            placeholder="••••••••"
            show-password-on="click"
            @keydown.enter="handleSubmit"
          />
        </NFormItem>
        <NSpace vertical :size="12">
          <NButton
            type="primary"
            block
            :loading="loading"
            @click="handleSubmit"
          >
            Se connecter
          </NButton>
          <NText depth="3" style="text-align: center; display: block">
            Pas encore de compte ?
            <RouterLink to="/register">S'inscrire</RouterLink>
          </NText>
        </NSpace>
      </NForm>
    </NCard>
  </NSpace>
</template>

<script lang="ts">
export default {
  name: 'LoginPage',
}
</script>

<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import { useAuthStore } from '@/store/auth'
import type { SignInPayload } from '@/types'

const router = useRouter()
const message = useMessage()
const api = useApi()
const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const formValue = ref<SignInPayload>({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: "L'email est requis", trigger: 'blur' },
    { type: 'email', message: 'Email invalide', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Le mot de passe est requis', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const { token, user } = await api.signIn(formValue.value)
    authStore.login(token, user)

    message.success(`Bienvenue ${user.username} !`)
    router.push(ROUTES.HOME)
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>
