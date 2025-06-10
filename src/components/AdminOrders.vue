<template>
    <div class="sorting-controls">
        <label>
            Сортировать по:
            <select v-model="sortBy">
            <option value="id">ID</option>
            <option value="orderStatus">Статус</option>
            <option value="total">Итог</option>
            </select>
        </label>

        <label>
            Порядок:
            <select v-model="sortDirection">
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
            </select>
        </label>
    </div>
    <div class="admin-orders">
      <h1>Заказы</h1>
      <div v-if="loading">Загрузка...</div>
      <div v-else>
        <div v-for="order in sortedOrders" :key="order.id" class="order-card">
          <p><strong>ID заказа:</strong> {{ order.id }}</p>
          <p><strong>Пользователь:</strong> {{ order.user }}</p>
          <p><strong>Дата заказа:</strong> {{ formatDate(order.createdAt) }}</p>

          <p><strong>Содержимое заказа:</strong></p>
          <ul class="order-items-list">
            <li v-for="(item, index) in order.orderItems" :key="index">
              {{ item.name }} — {{ item.quantity }} шт. × {{ formatPrice(item.productVariant.product.price) }}
            </li>
          </ul>
          <p><strong>Статус:</strong> 
            <select v-model="order.orderStatus" @change="updateStatus(order)">
              <option value="NEW">Новый</option>
              <option value="DELIVERED">Получен</option>
              <option value="CANCELED">Отменен</option>
            </select>
          </p>
          <p><strong>Итог:</strong> {{ formatPrice(order.total) }}</p>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import { orderService } from '@/services/orderService';
import { useToast } from 'vue-toastification';

const orders = ref([]);
const loading = ref(true);
const toast = useToast();

const sortBy = ref('id');

const sortDirection = ref('asc');
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => {
  const aValue = a[sortBy.value];
  const bValue = b[sortBy.value];
  if (typeof aValue === 'number' && typeof bValue === 'number') {
  return sortDirection.value === 'asc' ? aValue - bValue : bValue - aValue;
}

return sortDirection.value === 'asc'
? String(aValue).localeCompare(String(bValue))
: String(bValue).localeCompare(String(aValue));
});
});

onMounted(async () => {
await loadOrders();
});

const loadOrders = async () => {
loading.value = true;
try {
    const response = await orderService.getAllOrders();
    orders.value = response;
} catch (err) {
    toast.error("Ошибка загрузки заказов", {
    timeout: 3000
    });
} finally {
    loading.value = false;
}
};

const updateStatus = async (order) => {
try {
    const data = {
        orderStatus: order.orderStatus,
        orderId: order.id
    }
    await orderService.updateOrderStatus(data);
    toast.success("Статус обновлен", {
        timeout: 3000
    });
    } catch (err) {
        toast.error("Ошибка обновления статуса", {
            timeout: 3000
        });
}
};

const formatPrice = (price) => {
return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
}).format(price);
};
</script>

<style scoped>
.admin-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-orders h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.order-items-list {
  margin: 0.5rem 0 1rem;
  padding-left: 1.2rem;
  list-style-type: disc;
  color: #555;
}

.order-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-card p {
  margin: 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.order-card strong {
  font-weight: 600;
}

.order-card select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background: #f9f9f9;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: border 0.2s;
}

.order-card select:focus {
  border-color: #2196f3;
  outline: none;
}
.sorting-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.sorting-controls label {
  font-size: 1rem;
  color: #333;
}

.sorting-controls select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>

  