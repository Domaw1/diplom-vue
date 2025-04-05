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
          <div class="user-info">
            <div class="info-item">
              <span class="info-label">Имя пользователя:</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
          </div>
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
  
  const router = useRouter();
  
  const user = ref({
    username: '',
    email: '',
    registrationDate: ''
  });
  
  const ordersData = ref([]);
  const ordersLoading = ref(true);
  
  onMounted(async () => {
  try {
    const userData = await userService.getProfile();
    user.value = {
      username: userData.username,
      email: userData.email,
      registrationDate: userData.createdAt || new Date().toISOString()
    };

    ordersData.value = await userService.getOrders();
    console.log(ordersData.value);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  } finally {
    ordersLoading.value = false;
  }
});
  
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
  
  .logout-btn {
    padding: 0.5rem 1rem;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .logout-btn:hover {
    background-color: #cc0000;
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
  
  .status-processing {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .status-shipped {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .status-delivered {
    background-color: #f1f8e9;
    color: #33691e;
  }
  
  .status-cancelled {
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
  
  .product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .product-info h3 {
    margin: 0;
    font-size: 1rem;
  }
  
  .product-info p {
    margin: 0.25rem 0 0;
    color: #666;
  }
  
  .order-action {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background-color: #f5f5f5;
    border: none;
    border-top: 1px solid #eee;
    cursor: pointer;
    text-align: center;
  }
  
  .order-action:hover {
    background-color: #005BFF;
    color: white;
  }
  

  </style>