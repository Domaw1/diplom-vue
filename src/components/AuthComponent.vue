<template>
    <div class="auth-container">
      <div class="auth-form">
        <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">Почта</label>
            <input
              type="email"
              id="username"
              v-model="form.email"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              required
            >
          </div>
          
          <div class="form-group" v-if="!isLoginMode">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
            >
          </div>
          
          <button type="submit" class="submit-btn">
            {{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
          </button>
        </form>
        
        <p class="toggle-mode" @click="toggleMode">
          {{ isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </p>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { authService } from '@/services/authService';
  
  const router = useRouter();
  
  const isLoginMode = ref(true);
  const errorMessage = ref('');
  
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
    try {
      if (isLoginMode.value) {
        await authService.login({
          email: form.value.email,
          password: form.value.password
        });
      } else {
        await authService.register({
          username: form.value.username,
          password: form.value.password,
          email: form.value.email
        });
      }
      
      router.push('/');
    } catch (error) {
      errorMessage.value = error.message || 'Произошла ошибка';
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
  
  .submit-btn:hover {
    background-color: #0044cc;
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
  </style>