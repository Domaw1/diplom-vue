<template>
  <div class="filter-controls">
  <label>
    Фильтр по ID:
    <input type="number" v-model.number="filterId" placeholder="Введите ID" min="0" />
  </label>

  <label>
    Фильтр по статусу:
    <select v-model="filterStatus">
      <option value="">Все</option>
      <option value="NEW">Новый</option>
      <option value="DELIVERED">Вручен</option>
      <option value="CANCELED">Отменен</option>
    </select>
  </label>

  <label>
    Итог больше:
    <input
      type="number"
      v-model.number="filterMinTotal"
      placeholder="0"
      min="0"
    />
  </label>

  <label>
    Итог меньше:
    <input
      type="number"
      v-model.number="filterMaxTotal"
      placeholder="∞"
      min="0"
    />
  </label>

  <button @click="resetFilters" class="reset-btn">Сбросить фильтры</button>
</div>


  <div class="admin-orders">
    <h1>Заказы</h1>
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <div v-if="filteredOrders.length === 0">Нет заказов по заданным фильтрам.</div>
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
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
          <select
            v-model="order.orderStatus"
            @change="updateStatus(order)"
            :disabled="order.orderStatus === 'DELIVERED'"
          >
            <option value="NEW">Новый</option>
            <option value="DELIVERED">Вручен</option>
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

// Фильтры
const filterId = ref(null);
const filterStatus = ref('');
const filterMinTotal = ref(null);
const filterMaxTotal = ref(null);

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesId = filterId.value === null || order.id === filterId.value;
    const matchesStatus = !filterStatus.value || order.orderStatus === filterStatus.value;
    const matchesMin = filterMinTotal.value === null || order.total >= filterMinTotal.value;
    const matchesMax = filterMaxTotal.value === null || order.total <= filterMaxTotal.value;

    return matchesId && matchesStatus && matchesMin && matchesMax;
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
    toast.error("Ошибка загрузки заказов", { timeout: 3000 });
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (order) => {
  try {
    await orderService.updateOrderStatus({
      orderStatus: order.orderStatus,
      orderId: order.id
    });
    toast.success("Статус обновлен", { timeout: 3000 });
  } catch (err) {
    toast.error("Ошибка обновления статуса", { timeout: 3000 });
  }
};

const resetFilters = () => {
  filterId.value = null;
  filterStatus.value = '';
  filterMinTotal.value = null;
  filterMaxTotal.value = null;
};


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

.filter-controls {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.filter-controls label {
  font-size: 1rem;
  color: #333;
}

.filter-controls select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.filter-controls label {
  font-size: 1rem;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.filter-controls input,
.filter-controls select {
  margin-top: 0.4rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 180px;
}

.reset-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  align-self: flex-end;
  margin-top: auto;
  height: fit-content;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #d32f2f;
}

</style>
