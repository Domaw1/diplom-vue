<template>
  <div class="reset-password-container">
    <h2>Сброс пароля</h2>
    <div v-if="!isSubmitted">
      <div class="form-group">
        <label>Новый пароль</label>
        <input type="password" v-model="newPassword" />
      </div>
      <button @click="submitNewPassword" :disabled="isSubmitting">
        {{ isSubmitting ? 'Сброс...' : 'Сбросить пароль' }}
      </button>
    </div>
    <div v-else>
      <p>Пароль успешно сброшен. Теперь вы можете <router-link to="/auth">войти</router-link>.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const newPassword = ref('');
const isSubmitting = ref(false);
const isSubmitted = ref(false);

const token = ref('');

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    toast.error('Токен сброса не найден.');
    router.push('/');
  }
});

const submitNewPassword = async () => {
  if (!newPassword.value) {
    toast.warning('Введите новый пароль');
    return;
  }

  isSubmitting.value = true;
  try {
    await authService.confirmResetPassword(token.value, newPassword.value);
    toast.success('Пароль успешно обновлён!');
    isSubmitted.value = true;
  } catch (err) {
    toast.error(err.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.reset-password-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
