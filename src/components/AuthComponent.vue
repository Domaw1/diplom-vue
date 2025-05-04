<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Почта</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
          >
          <span class="error-text" v-if="errors.email">{{ errors.email }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
          >
          <span class="error-text" v-if="errors.password">{{ errors.password }}</span>
        </div>
        
        <div class="form-group" v-if="!isLoginMode">
          <label for="username">Имя</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
          >
          <span class="error-text" v-if="errors.username">{{ errors.username }}</span>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting">Обработка...</span>
          <span v-else>{{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}</span>
        </button>
      </form>
      
      <p class="toggle-mode" @click="toggleMode">
        {{ isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
      </p>
      <a href="http://localhost:8080/oauth2/authorization/google" class="google-login-btn">
        Войти через Google
      </a>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';

const toast = useToast();

const router = useRouter();

const isLoginMode = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const errors = ref({
  email: '',
  password: '',
  username: ''
});

const form = ref({
  username: '',
  password: '',
  email: ''
});

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  if (!form.value.email || !form.value.password || (!isLoginMode.value && !form.value.username)) {
    toast.warning('Пожалуйста, заполните все поля.');
    return;
  }

  try {
    if (isLoginMode.value) {
      await authService.login({
        email: form.value.email,
        password: form.value.password
      });
      toast.success('Успешный вход!\nПеренаправление на главную через 3 секунды...', {
        timeout: 3000,
        position: 'top-center'
      });

    } else {
      await authService.register({
        username: form.value.username,
        password: form.value.password,
        email: form.value.email
      });
      toast.success('Регистрация прошла успешно!!', {
          timeout: false,
          position: 'top-center'
        });
      }

      setTimeout(() => {
        router.push('/');
      }, 3000);
  } catch (error) {
    errorMessage.value = error.message || 'Произошла ошибка';
    toast.error(errorMessage.value, {
      timeout: 2000,
      position: 'top-center'
    });
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  border-color: #005BFF;
  outline: none;
}

.error-text {
  color: #c62828;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #005BFF;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0044cc;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.toggle-mode {
  text-align: center;
  margin-top: 1rem;
  color: #005BFF;
  cursor: pointer;
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  text-align: center;
}
</style>