<template>
  <AuthLayout>
    <section class="auth-card" aria-labelledby="login-title">
      <h1 id="login-title" class="title">Вход в систему</h1>

      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="login">Email</label>
          <input id="login" v-model="form.login" type="email" autocomplete="username" required />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
        </div>

        <div class="form-row form-row--aside">
          <label class="remember" for="remember">
            <input id="remember" type="checkbox" v-model="form.remember" />
            <span>Запомнить меня</span>
          </label>

          <RouterLink to="/auth/forgot" class="link-small">Забыли пароль?</RouterLink>
        </div>

        <div v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</div>

        <div class="form-actions">
          <button class="btn btn--primary" type="submit" :disabled="loading">
            {{ loading ? 'Входим…' : 'Войти' }}
          </button>
        </div>
      </form>

      <footer class="card-footer">
        <small>Если у вас нет учетной записи — обратитесь к администратору.</small>
      </footer>
    </section>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
//import { useRouter, RouterLink } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth.store'

//const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ login: '', password: '', remember: false })
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

onMounted(async () => {
  try {
    // Проверяем наличие CSRF в meta
    const csrfMeta = document.querySelector('meta[name="csrf-token"]')
    if (!csrfMeta) {
      console.warn('⚠️ CSRF meta тег не найден при загрузке страницы')
    } else {
      console.log('✅ CSRF токен присутствует в meta теге ', csrfMeta)
    }
  } catch (error) {
    console.log('ℹ️ Error checking CSRF token:', error)
  }
})

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    // Подготовка данных для запроса
    const credentials = {
      login: form.login.trim(),
      password: form.password,
    }
    // Отправляем запрос
    await authStore.login(credentials)
  } catch (err) {
    console.log(err)
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 10px;
  padding: 28px;
  box-shadow: 0 8px 12px rgba(28, 28, 28, 0.353);
}

.title { font-size: 20px; margin-bottom: 18px; text-align:center; }

.form-group { display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }
.form-group input { padding:10px; border:1px solid #e5e7eb; border-radius:6px; }

.form-row--aside { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:6px; }

.remember { display:inline-flex; align-items:center; gap:8px; font-size:14px; color:#374151; cursor:pointer; }
.remember input { width:16px; height:16px; }

.alert--error { margin-top:10px; background:#fff1f2; color:#7f1d1d; padding:8px; border-radius:6px; }

.form-actions { margin-top:16px; }
.btn { padding:10px 14px; border-radius:6px; cursor:pointer; border:none; }
.btn--primary { background:#031432; color:#fff; width:100%; }

.card-footer { margin-top:14px; text-align:center; color:#6b7280; font-size:13px; }
</style>
