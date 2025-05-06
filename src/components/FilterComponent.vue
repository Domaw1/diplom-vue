<template>
  <div class="filters">
    <!-- Фильтр по цене -->
    <div class="filter-section">
      <h3 class="filter-title">Цена</h3>
      <div class="price-inputs">
        <div class="price-input-group">
          <label>От</label>
          <input
            type="number"
            v-model.number="priceRange[0]"
            :min="minPrice"
            :max="priceRange[1]"
            @input="handlePriceChange"
            class="price-input"
          >
          <span>₽</span>
        </div>
        <div class="price-input-group">
          <label>До</label>
          <input
            type="number"
            v-model.number="priceRange[1]"
            :min="priceRange[0]"
            :max="maxPrice"
            @input="handlePriceChange"
            class="price-input"
          >
          <span>₽</span>
        </div>
      </div>
      <div class="price-buttons">
        <button
          v-for="range in priceRanges"
          :key="range.label"
          :class="{ active: isPriceRangeActive(range) }"
          @click="setPriceRange(range)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Фильтр по брендам -->
    <div class="filter-section">
      <h3 class="filter-title">Бренд</h3>
      <div class="brand-search">
        <input
          type="text"
          placeholder="Поиск бренда"
          v-model="brandSearch"
        >
      </div>
      <div class="brand-list">
        <label v-for="brand in filteredBrands" :key="brand.id" class="brand-item">
          <input
            type="checkbox"
            :checked="selectedBrands.includes(brand.name)"
            @change="toggleBrand(brand.name)"
          >
          <img 
            v-if="brand.logoUrl" 
            :src="brand.logoUrl" 
            :alt="brand.name"
            class="brand-logo"
          >
          <span class="brand-name">{{ brand.name }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">Цвет</h3>
      <div class="color-filters">
        <div 
          v-for="color in availableColors"
          :key="color.color"
          class="color-option"
          :class="{ active: selectedColors.includes(color.color) }"
          :style="{ backgroundColor: getColorHex(color.color) }"
          @click="toggleColor(color.color)"
          :title="color.color"
        ></div>
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">Размер</h3>
      <div class="size-filters">
        <button
          v-for="s in sizes"
          :key="s.size"
          :class="{ active: selectedSizes.includes(s.size) }"
          @click="toggleSize(s.size)"
        >
          {{ s.size }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { LoadBrands, LoadColors, LoadSizes } from "@/db/api";

const emit = defineEmits(['filter-change']);

const minPrice = ref(0);
const maxPrice = ref(20000);
const priceRange = ref([0, 20000]);
const brandSearch = ref('');

const priceRanges = [
  { label: "до 1 000 ₽", min: 0, max: 1000 },
  { label: "1 000–2 500 ₽", min: 1000, max: 2500 },
  { label: "2 500–5 000 ₽", min: 2500, max: 5000 },
  { label: "5 000 ₽ и дороже", min: 5000, max: Infinity },
  { label: "Неважно", min: 0, max: Infinity }
];

const brands = ref([]);
const availableColors = ref([]);
const sizes = ref([]);

const selectedBrands = ref([]);
const selectedColors = ref([]);
const selectedSizes = ref([]);

onMounted(async () => {
  try {
    [brands.value, availableColors.value, sizes.value] = await Promise.all([
      LoadBrands(),
      LoadColors(),
      LoadSizes()
    ]);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
});

const filteredBrands = computed(() => {
  if (!brands.value.value) return [];
  const searchTerm = brandSearch.value.toLowerCase();
  return brands.value.value.filter(brand => 
    brand.name.toLowerCase().startsWith(searchTerm)
  );
});

const getColorHex = (colorName) => {
  const colorMap = {
    'Красный': '#FF0000',
    'Синий': '#0000FF',
    'Зеленый': '#008000',
    'Черный': '#000000',
    'Белый': '#FFFFFF',
    'Желтый': '#FFFF00',
    'Фиолетовый': '#800080'
  };
  return colorMap[colorName] || '#CCCCCC';
};

const setPriceRange = (range) => {
  priceRange.value = [range.min, range.max === Infinity ? maxPrice.value : range.max];
  updateFilters();
};

const isPriceRangeActive = (range) => {
  return priceRange.value[0] === range.min &&
    (priceRange.value[1] === (range.max === Infinity ? maxPrice.value : range.max));
};

const toggleBrand = (brandName) => {
  const index = selectedBrands.value.indexOf(brandName);
  if (index === -1) {
    selectedBrands.value.push(brandName);
  } else {
    selectedBrands.value.splice(index, 1);
  }
  updateFilters();
};

const toggleColor = (colorName) => {
  const index = selectedColors.value.indexOf(colorName);
  if (index === -1) {
    selectedColors.value.push(colorName);
  } else {
    selectedColors.value.splice(index, 1);
  }
  updateFilters();
};

const toggleSize = (sizeName) => {
  const index = selectedSizes.value.indexOf(sizeName);
  if (index === -1) {
    selectedSizes.value.push(sizeName);
  } else {
    selectedSizes.value.splice(index, 1);
  }
  updateFilters();
};

const handlePriceChange = () => {
  if (priceRange.value[0] < minPrice.value) priceRange.value[0] = minPrice.value;
  if (priceRange.value[1] > maxPrice.value) priceRange.value[1] = maxPrice.value;
  if (priceRange.value[0] > priceRange.value[1]) priceRange.value[0] = priceRange.value[1];
  updateFilters();
};

const updateFilters = () => {
  emit('filter-change', {
    brands: selectedBrands.value,
    colors: selectedColors.value,
    sizes: selectedSizes.value,
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1]
  });
};
</script>

<style scoped>
.filters {
  width: 250px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-right: 20px;
}

.filter-section {
  margin-bottom: 25px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.price-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.price-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.price-input-group label {
  font-size: 14px;
  color: #666;
}

.price-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: right;
}

.price-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.price-buttons button {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.price-buttons button.active {
  background: #005BFF;
  color: white;
  border-color: #005BFF;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.brand-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: 4px;
}

.brand-name {
  font-size: 14px;
}

.brand-search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.brand-list {
  max-height: 300px;
  overflow-y: auto;
}

.size-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-filters button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.size-filters button.active {
  background: #005BFF;
  color: white;
  border-color: #005BFF;
}

.color-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #005BFF;
  box-shadow: 0 0 5px rgba(0, 91, 255, 0.5);
}
</style>