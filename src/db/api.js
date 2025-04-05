import {ref} from "vue";
import axios from "axios";


export const LoadProducts = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/products").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const LoadCategories = async () => {
    let data = ref([]);
    axios.get("http://localhost:8080/api/v1/category").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc);
        });

    return data;
}

export const LoadBrands = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/brand").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const LoadSizes = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/size").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const LoadColors = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/color").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const fetchFilteredProducts = async (filters) => {
  try {
    let data = ref([])
    const params = new URLSearchParams();
    
    if (filters.brands?.length) {
      params.append('brand', filters.brands.join(','));
    }
    if (filters.colors?.length) {
      params.append('color', filters.colors.join(','));
    }
    if (filters.sizes?.length) {
      params.append('size', filters.sizes.join(','));
    }
    if(filters.subCategory) {
        params.append('subCategory', filters.subCategory);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
      params.append('sortDirection', filters.sortDirection || 'asc');
    }

    const response = await axios.get('http://localhost:8080/api/v1/products/filter', { params });
    data.value = response.data;
    return data;
  } catch (error) {
    console.error('Ошибка фильтрации:', error);
    throw error;
  }
};