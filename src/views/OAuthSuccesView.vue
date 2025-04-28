<template>
  <div class="loading">
    Вход через Google... Подождите
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refresh_token');

  if (token) {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    router.push('/');
  } else {
    router.push('/login?error=oauth_failed');
  }
});
</script>

<style scoped>
.loading {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 100px;
}
</style>
