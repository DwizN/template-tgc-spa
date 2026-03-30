<template>
  <NSpace vertical :size="24" style="max-width: 400px; margin: 60px auto">
    <NCard title="Inscription">
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem label="Nom d'utilisateur" path="username">
          <NInput
            v-model:value="formValue.username"
            placeholder="Votre pseudo"
            @keydown.enter="handleSubmit"
          />
        </NFormItem>
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
            S'inscrire
          </NButton>
          <NText depth="3" style="text-align: center; display: block">
            Déjà un compte ?
            <RouterLink to="/login">Se connecter</RouterLink>
          </NText>
        </NSpace>
      </NForm>
    </NCard>
  </NSpace>
</template>

<script lang="ts">
export default {
  name: 'RegisterPage',
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
import type { SignUpPayload } from '@/types'

const router = useRouter()
const message = useMessage()
const api = useApi()
const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const formValue = ref<SignUpPayload>({
  username: '',
  email: '',
  password: '',
})

const rules: FormRules = {
  username: [
    {
      required: true,
      message: "Le nom d'utilisateur est requis",
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: "L'email est requis", trigger: 'blur' },
    { type: 'email', message: 'Email invalide', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Le mot de passe est requis', trigger: 'blur' },
    {
      min: 6,
      message: 'Le mot de passe doit contenir au moins 6 caractères',
      trigger: 'blur',
    },
  ],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const { token, user } = await api.signUp(formValue.value)
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
