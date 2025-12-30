<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import products from "../data/products.json";
import Swal from "sweetalert2";

const router = useRouter();
const route = useRoute();

/* ===================== PRODUCT ===================== */
const product = computed(() =>
  products.find((p) => String(p.id) === String(route.params.id))
);

const selectedImage = ref(
  product.value?.images?.length
    ? `/images/${product.value.images[0].image}`
    : "/images/placeholder.png"
);

/* ===================== LOCATIONS ===================== */
const locations = ref([
  { id: "JKT", name: "Jakarta" },
  { id: "SBY", name: "Surabaya" },
]);

/* ===================== GET BOOKING ===================== */
const existingBooking = computed(() => {
  const stored = localStorage.getItem("booking");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
});

/* ===================== AVAILABILITY ===================== */
const availabilityByLocation = computed(() => {
  const result = {};
  locations.value.forEach((loc) => {
    if (
      existingBooking.value &&
      existingBooking.value.productId === product.value?.id &&
      existingBooking.value.pickupLocation === loc.id
    ) {
      result[loc.id] = "unavailable";
    } else if (loc.id === "SBY") {
      result[loc.id] = "by_request";
    } else {
      result[loc.id] = "available";
    }
  });
  return result;
});

/* ===================== DISABLE BOOK NOW ===================== */
const isBookDisabled = computed(() => {
  if (!product.value) return true;
  if (!existingBooking.value) return false;
  return existingBooking.value.productId === product.value.id;
});

/* ===================== PRICE CHART ===================== */
const showPriceChart = ref(false);
const priceTable = computed(() => {
  const base = product.value?.price || 0;
  return [
    { label: "1 Day", total: base },
    { label: "2 Days (Free 1)", total: base * 2 },
    { label: "3 Days", total: base * 2 },
    { label: "7 Days (-10%)", total: base * 7 * 0.9 },
    { label: "14 Days (-20%)", total: base * 14 * 0.8 },
  ];
});

/* ===================== NAVIGASI ===================== */
const goToBookNow = () => {
  if (!product.value) return;
  router.push(`/book-now/${product.value.id}`);
};

/* ===================== PROJECT ARRAY ===================== */
const getProjectItems = () => {
  const stored = localStorage.getItem("projectItems");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveProjectItems = (items) => {
  localStorage.setItem("projectItems", JSON.stringify(items));
};

/* ===================== ADD TO PROJECT ===================== */
const addToProject = () => {
  if (!product.value) return;

  const projectItems = getProjectItems();
  const exists = projectItems.find((p) => p.id === product.value.id);

  if (exists) {
    Swal.fire({
      icon: "warning",
      title: "Sudah ada",
      text: "Produk ini sudah ada di project",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  projectItems.push({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: selectedImage.value,
    days: 1,
    pickupLocation: "",
  });

  saveProjectItems(projectItems);

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Produk ditambahkan ke project",
    timer: 1500,
    showConfirmButton: false,
  });
};

const goToProject = () => {
  router.push("/project");
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 pb-16">
    <!-- BACK -->
    <button @click="router.push('/')" class="mb-4 text-sm text-gray-500 hover:text-black">
      ← Back
    </button>

    <!-- NOT FOUND -->
    <div v-if="!product" class="py-20 text-center text-gray-400">
      Product tidak ditemukan
    </div>

    <!-- CONTENT -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
      <!-- LEFT -->
      <div>
        <!-- MAIN IMAGE -->
        <div class="bg-gray-100 rounded-xl w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] flex items-center justify-center overflow-hidden mb-4">
          <img :src="selectedImage" class="max-w-full max-h-full object-contain px-4 sm:px-6" />
        </div>

        <!-- THUMBNAIL -->
        <div class="flex gap-3 overflow-x-auto pb-2">
          <img
            v-for="(img, i) in product.images"
            :key="i"
            :src="'/images/' + img.image"
            @click="selectedImage = '/images/' + img.image"
            class="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-gray-100 rounded-lg cursor-pointer border shrink-0 hover:border-black"
            :class="[selectedImage === '/images/' + img.image ? 'border-black' : '']"
          />
        </div>

        <!-- PACKAGE -->
        <div v-if="product.default_package" class="border rounded-xl p-4 mt-4">
          <h3 class="font-semibold mb-3">Package</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div v-for="item in product.default_package.components" :key="item.id" class="text-center">
              <img :src="`/images/${item.product.image.image}`" class="h-16 mx-auto mb-2 object-contain" />
              <p class="font-medium">{{ item.product.name }}</p>
              <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="space-y-4">
        <h1 class="text-xl font-semibold">{{ product.name }}</h1>
        <p class="text-sm text-gray-500">Brand {{ product.manufacturer?.name || "-" }}</p>

        <!-- PRICE -->
        <div class="border rounded-xl p-4 space-y-2">
          <p class="text-xl font-bold text-orange-600">
            Rp {{ product.price.toLocaleString() }} <span class="text-sm font-normal">/ day</span>
          </p>
          <button @click="showPriceChart = true" class="text-sm text-orange-500 hover:underline">View price chart</button>
        </div>

        <!-- AVAILABILITY & LOCATIONS INFO -->
        <div class="border rounded-xl p-4 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium flex items-center gap-1">
              Availability
              <span class="relative group cursor-pointer">ℹ️
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  <div class="flex items-center gap-2"><span class="text-green-500">●</span> Available</div>
                  <div class="flex items-center gap-2"><span class="text-yellow-400">●</span> Available By Request</div>
                  <div class="flex items-center gap-2"><span class="text-red-500">●</span> Unavailable</div>
                </span>
              </span>
            </span>
          </div>

          <div class="space-y-2">
            <span class="text-xs text-gray-500 font-medium">Locations</span>
            <div class="flex gap-2 flex-wrap">
              <div
                v-for="loc in locations"
                :key="loc.id"
                class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                :class="{
                  'bg-green-100 text-green-600': availabilityByLocation[loc.id] === 'available',
                  'bg-yellow-100 text-yellow-600': availabilityByLocation[loc.id] === 'by_request',
                  'bg-red-100 text-red-500': availabilityByLocation[loc.id] === 'unavailable',
                }"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-600': availabilityByLocation[loc.id] === 'available',
                    'bg-yellow-400': availabilityByLocation[loc.id] === 'by_request',
                    'bg-red-500': availabilityByLocation[loc.id] === 'unavailable',
                  }"
                ></span>
                {{ loc.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- ACTION -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            @click="addToProject"
            class="flex-1 border border-orange-400 text-orange-500 py-3 rounded-lg font-medium hover:bg-orange-50"
          >
            Add to Project
          </button>
          <button
            class="flex-1 bg-orange-400 text-white py-3 rounded-lg font-medium hover:bg-orange-500"
            :disabled="isBookDisabled"
            @click="goToBookNow"
          >
            Book Now
          </button>
          <button
            class="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100"
            @click="goToProject"
          >
            Lihat Project
          </button>
        </div>

        <p class="text-xs text-gray-500">ℹ️ Booking akan diproses oleh Online Customer Service</p>
      </div>
    </div>
  </div>

  <!-- PRICE CHART MODAL -->
  <div v-if="showPriceChart" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div class="bg-white w-full max-w-md rounded-xl p-5">
      <div class="flex justify-between mb-4">
        <h3 class="font-semibold">Price Chart</h3>
        <button @click="showPriceChart = false">✕</button>
      </div>
      <div class="space-y-3 text-sm">
        <div v-for="(row, i) in priceTable" :key="i" class="flex justify-between border-b pb-2">
          <span>{{ row.label }}</span>
          <span class="font-semibold text-orange-600">Rp {{ row.total.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
