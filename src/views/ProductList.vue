<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import products from '../data/products.json'
import Swal from 'sweetalert2'
import { useCart } from '../stores/cart'

import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-vue-next'

/* =====================
   INIT
===================== */
const cart = useCart()
const router = useRouter()

/* =====================
   FILTER STATE
===================== */
const search = ref('')
const maxPrice = ref(1000000)

/* =====================
   PAGINATION
===================== */
const currentPage = ref(1)
const perPage = 10

watch([search, maxPrice], () => {
  currentPage.value = 1
})

/* =====================
   FILTER LOGIC
===================== */
const filteredProducts = computed(() => {
  return products.filter(p => {
    const nameMatch = p.name
      ?.toLowerCase()
      .includes(search.value.toLowerCase())

    const priceMatch = p.price <= maxPrice.value

    return nameMatch && priceMatch
  })
})

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / perPage)
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

/* =====================
   IMAGE SAFE
===================== */
const getImage = (p) => {
  return p.images?.length
    ? `/images/${p.images[0].image}`
    : '/images/placeholder.png'
}

/* =====================
   ROUTE TO DETAIL
===================== */
const goToDetail = (product) => {
  router.push(`/products/${product.id}`)
}

const goToProject = () => {
  router.push(`/project`)
}

/* =====================
   BOOK ACTION
===================== */
const book = (product) => {
  if (!cart.isAvailable()) {
    Swal.fire({
      icon: 'warning',
      title: 'Tanggal bentrok',
      text: 'Silakan pilih tanggal lain',
    })
    return
  }

  cart.add({
    id: product.id,
    name: product.name,
    price: product.price,
    days: 3,
    total: product.price * 3
  })

  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: 'Produk masuk ke cart',
    timer: 1500,
    showConfirmButton: false
  })
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4">

    <!-- HEADER -->
    <div class="flex items-center gap-2 mb-4">
      <Camera class="w-5 h-5" />
  
      <h1 class="font-semibold text-lg">Product List</h1>
    </div>
      <div @click="goToProject" class="flex items-center gap-2 mb-4">
      <ShoppingCart  class="w-5 h-5" />
      <h1 class="font-semibold text-lg">Project List</h1>
    </div>



    <!-- MAIN LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- LEFT : FILTER -->
      <aside class="lg:col-span-1">
        <div class="border rounded-lg p-4 sticky top-4 bg-white">

          <!-- SEARCH -->
          <div class="relative mb-4">
            <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              v-model="search"
              placeholder="Cari kamera..."
              class="pl-9 pr-3 py-2 border rounded w-full text-sm"
            />
          </div>

          <!-- PRICE -->
          <div>
            <label class="text-xs font-medium">Max Price</label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              v-model="maxPrice"
              class="w-full mt-2"
            />
            <p class="text-xs text-gray-600 mt-1">
              Rp {{ maxPrice.toLocaleString() }}
            </p>
          </div>

        </div>
      </aside>

      <!-- RIGHT : PRODUCT LIST -->
      <section class="lg:col-span-3">

        <!-- GRID -->
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">

          <!-- CARD -->
          <div
            v-for="p in paginatedProducts"
            :key="p.id"
            @click="goToDetail(p)"
            class="border rounded-lg p-3 flex flex-col bg-white
                   hover:shadow-md transition cursor-pointer group"
          >
            <!-- IMAGE -->
            <div
              class="aspect-square bg-gray-100 rounded mb-3
                     flex items-center justify-center overflow-hidden"
            >
              <img
                :src="getImage(p)"
                class="w-full h-full object-contain p-2
                       group-hover:scale-105 transition"
              />
            </div>

            <!-- TITLE -->
            <h2
              class="text-sm font-medium leading-snug
                     line-clamp-2 min-h-[36px]"
            >
              {{ p.name }}
            </h2>

            <!-- PRICE -->
            <p class="text-xs text-orange-600 font-semibold mt-1">
              Rp {{ p.price.toLocaleString() }} / hari
            </p>

       
          </div>

        </div>

        <!-- PAGINATION -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-3 mt-8"
        >
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="p-2 border rounded disabled:opacity-40"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <span class="text-sm">
            Page {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="p-2 border rounded disabled:opacity-40"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

      </section>
    </div>

  </div>
</template>
