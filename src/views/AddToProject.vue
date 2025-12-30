<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
    <!-- BACK HOME -->
    <button
      @click="router.push('/')"
      class="text-sm text-gray-500 hover:text-black mb-4 flex items-center gap-1"
    >
      ← Home
    </button>

    <h1 class="text-2xl font-bold mb-4 text-center md:text-left">Project Booking</h1>

    <!-- LIST ITEMS -->
    <div v-if="projectItems.length === 0" class="text-gray-500 text-center py-10">
      Belum ada produk yang ditambahkan.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(item, index) in projectItems"
        :key="item.id"
        class="flex flex-col sm:flex-row items-center sm:items-start border rounded-lg p-4 gap-4"
      >
        <img
          :src="item.image || '/images/placeholder.png'"
          class="w-full sm:w-24 h-24 object-contain rounded border"
        />
        <div class="flex-1 flex flex-col sm:justify-between w-full gap-2">
          <div>
            <h2 class="font-semibold text-lg">{{ item.name }}</h2>
            <p class="text-sm text-gray-500">Rp {{ item.price.toLocaleString() }} / day</p>

            <!-- Days -->
            <div class="flex items-center gap-2 mt-1">
              <label class="text-sm text-gray-500">Days:</label>
              <input
                type="number"
                min="1"
                v-model.number="item.days"
                @change="saveToStorage"
                class="w-16 border rounded px-2 py-1 text-sm"
              />
            </div>

            <!-- Pickup Location -->
            <div class="flex items-center gap-2 mt-1">
              <label class="text-sm text-gray-500">Pickup:</label>
              <select v-model="item.pickupLocation" @change="saveToStorage" class="border rounded px-2 py-1 text-sm">
                <option value="">Pilih Lokasi</option>
                <option value="JKT">Jakarta</option>
                <option value="SBY">Surabaya</option>
              </select>
            </div>
          </div>
        </div>
        <button
          @click="removeItem(index)"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-2 sm:mt-0"
        >
          Hapus
        </button>
      </div>

      <!-- TOTAL -->
      <div class="flex flex-col sm:flex-row justify-between items-center font-semibold text-lg border-t pt-4">
        <span>Total Semua</span>
        <span>Rp {{ totalAll.toLocaleString() }}</span>
      </div>

      <!-- ACTION -->
      <div class="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          @click="clearProject"
          class="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded font-semibold"
        >
          Kosongkan Project
        </button>
        <button
          @click="checkout"
          :disabled="projectItems.length === 0"
          class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold"
        >
          Checkout / Book All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// ambil projectItems dari localStorage
const getProjectItems = () => {
  const stored = localStorage.getItem("projectItems");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// reactive array
const projectItems = ref(getProjectItems());

// simpan ke localStorage
const saveToStorage = () => {
  localStorage.setItem("projectItems", JSON.stringify(projectItems.value));
};

// remove single item
const removeItem = (index) => {
  projectItems.value.splice(index, 1);
  saveToStorage();
};

// clear all project
const clearProject = () => {
  projectItems.value = [];
  saveToStorage();
};

// total semua harga
const totalAll = computed(() => {
  return projectItems.value.reduce(
    (sum, item) => sum + item.price * item.days,
    0
  );
});

// checkout / book all
const checkout = () => {
  if (projectItems.value.length === 0) return;

  // arahkan ke halaman kwitansi multi-product
  router.push("/checkout");
};
</script>
