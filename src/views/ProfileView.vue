<template>
  <nav-bar></nav-bar>
  <div class="user-profile">
    <div class="profile-header">
      <h1>Личный кабинет</h1>
      <button @click="logout" class="logout-btn">Выйти</button>
    </div>

    <div class="profile-content">
      <div class="user-info-section">
        <h2 style="margin-bottom: 30px;">Мои данные</h2>
        
        <div v-if="!isEditing" class="user-info">
          <div class="info-item">
            <span class="info-label">Имя пользователя:</span>
            <span class="info-value">{{ user.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <button @click="startEditing" class="edit-btn">Редактировать</button>
        </div>
        
        <form v-else @submit.prevent="saveProfile" class="edit-form">
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              v-model="editForm.username"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="editForm.email"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">Новый пароль (оставьте пустым, если не хотите менять)</label>
            <input
              type="password"
              id="password"
              v-model="editForm.password"
            >
          </div>
          
          <div class="form-group">
            <label for="currentPassword">Текущий пароль (для подтверждения изменений)</label>
            <input
              type="password"
              id="currentPassword"
              v-model="editForm.currentPassword"
            >
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelEditing" class="cancel-btn">Отмена</button>
            <button type="submit" class="save-btn">Сохранить</button>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <div class="orders-section">
        <h2>Мои заказы</h2>
        
        <div v-if="ordersLoading" class="loading">Загрузка...</div>
        
        <div v-else-if="ordersData.length === 0" class="no-orders">
          У вас пока нет заказов
        </div>
        
        <div v-else class="orders-list">
          <div v-for="order in ordersData" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-id">Заказ #{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              <span class="order-status" :class="getStatusClass(order.orderStatus)">
                {{ getStatusText(order.orderStatus) }}
              </span>
              <span class="order-total">{{ order.total }} ₽</span>
            </div>
            
            <div class="order-products">
              <div v-for="item in order.orderItems" :key="item.id" class="product-item">
                <img
                  height="200px" width="200px"
                  v-if="item.productVariant.product.imageUrls && item.productVariant.product.imageUrls.length > 0"
                  :src="item.productVariant.product.imageUrls[0]"
                  :alt="item.productVariant.product.name"
                >
                <div class="product-info">
                  <h3>{{ item.productVariant.product.name }}</h3>
                  <p>{{ item.productVariant.product.description }}</p>
                  <p>{{ item.quantity }} × {{ item.productVariant.product.price }} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import NavBar from '@/components/NavBar.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const router = useRouter();

const user = ref({
  username: '',
  email: '',
  registrationDate: ''
});

const editForm = ref({
  username: '',
  email: '',
  password: '',
  currentPassword: ''
});

const ordersData = ref([]);
const ordersLoading = ref(true);
const isEditing = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const userData = await userService.getProfile();
    user.value = {
      username: userData.username,
      email: userData.email,
      registrationDate: userData.createdAt || new Date().toISOString()
    };

    ordersData.value = await userService.getOrders();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    toast.error('Ошибка загрузки данных профиля');
  } finally {
    ordersLoading.value = false;
  }
});

const startEditing = () => {
  editForm.value = {
    username: user.value.username,
    email: user.value.email,
    password: '',
    currentPassword: ''
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  errorMessage.value = '';
};

const saveProfile = async () => {
  try {
    const updatedUser = await userService.updateUser(
      {
        username: editForm.value.username,
        email: editForm.value.email,
        password: editForm.value.password,
        currentPassword: editForm.value.currentPassword
      }
    );
    
    user.value = {
      username: updatedUser.username,
      email: updatedUser.email,
      registrationDate: user.value.registrationDate
    };
    
    isEditing.value = false;
    toast.success('Профиль успешно обновлен', {
        timeout: 2000
      });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Ошибка при обновлении профиля';
    toast.error(errorMessage.value, {
        timeout: 2000
    });
  }
};

const logout = () => {
  authService.logout();
  router.push('/');
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

const getStatusText = (status) => {
  const statusMap = {
    'NEW': 'Новый',
    'DELIVERED': 'Доставлен',
    'CANCELED': 'Отменен'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`;
};
</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-btn, .edit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn {
  background-color: #ff4444;
  color: white;
}

.logout-btn:hover {
  background-color: #cc0000;
}

.edit-btn {
  background-color: #005BFF;
  color: white;
}

.edit-btn:hover {
  background-color: #0044cc;
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.user-info-section, .orders-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: 1rem;
}

.info-label {
  font-weight: 500;
  min-width: 150px;
}

.edit-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: #005BFF;
  outline: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #005BFF;
  color: white;
}

.save-btn:hover {
  background-color: #0044cc;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.error-message {
  color: #c62828;
  padding: 0.75rem;
  background-color: #ffebee;
  border-radius: 4px;
  margin-top: 1rem;
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.orders-list {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  border: 1px solid #005BFF;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #005BFF;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.order-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-new {
  background-color: #fff3e0;
  color: #e65100;
}

.status-delivered {
  background-color: #f1f8e9;
  color: #33691e;
}

.status-canceled {
  background-color: #ffebee;
  color: #c62828;
}

.order-products {
  padding: 1rem;
}

.product-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  align-items: center;
}

.product-info h3 {
  margin: 0;
  font-size: 1rem;
}

.product-info p {
  margin: 0.25rem 0 0;
  color: #666;
}
</style>