<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
    <!-- BACK HOME -->
    <button
      @click="router.push('/')"
      class="text-sm text-gray-500 hover:text-black mb-4 flex items-center gap-1"
    >
      ← Home
    </button>

    <h1 class="text-2xl font-bold mb-4 text-center md:text-left">Kwitansi Booking</h1>

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
          <h2 class="font-semibold text-lg">{{ item.name }}</h2>
          <p class="text-sm text-gray-500">Rp {{ item.price.toLocaleString() }} / day</p>
          <p class="text-sm text-gray-500">Days: {{ item.days }}</p>
          <p class="text-sm text-gray-500">Pickup: {{ item.pickupLocation }}</p>
          <p class="text-sm font-semibold mt-1">
            Subtotal: Rp {{ (item.price * item.days).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- TOTAL -->
      <div class="flex flex-col sm:flex-row justify-between items-center font-semibold text-lg border-t pt-4">
        <span>Total Semua</span>
        <span>Rp {{ totalAll.toLocaleString() }}</span>
      </div>

      <!-- PRINT BUTTON -->
      <div class="flex justify-end mt-4">
        <button
          @click="printReceipt"
          class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded font-semibold"
        >
          Cetak Kwitansi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

const projectItems = ref(getProjectItems());

// total semua harga
const totalAll = computed(() =>
  projectItems.value.reduce((sum, item) => sum + item.price * item.days, 0)
);

// cetak kwitansi
const printReceipt = () => {
  const printWindow = window.open("", "_blank");
  const html = `
    <html>
      <head>
        <title>Kwitansi Booking</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #f97316; text-align: center; }
          img { max-width: 150px; display: block; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f3f3f3; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Kwitansi Booking</h1>
        <table>
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Produk</th>
              <th>Harga / Day</th>
              <th>Days</th>
              <th>Pickup</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${projectItems.value
              .map(
                item => `
              <tr>
                <td><img src="${item.image || '/images/placeholder.png'}" /></td>
                <td>${item.name}</td>
                <td>Rp ${item.price.toLocaleString()}</td>
                <td>${item.days}</td>
                <td>${item.pickupLocation}</td>
                <td>Rp ${(item.price * item.days).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="5">Total</th>
              <th>Rp ${totalAll.value.toLocaleString()}</th>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
</script>
