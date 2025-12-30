<template>
  <div v-if="product" class="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 p-4 space-y-6">

    <!-- TOP FILTER -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label class="text-xs text-gray-500">Pickup</label>
        <input
          type="datetime-local"
          v-model="pickupDate"
          class="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500">Return</label>
        <input
          type="datetime-local"
          v-model="returnDate"
          class="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500">Location</label>
        <select
          v-model="pickupLocation"
          class="w-full border rounded px-2 py-1 text-sm"
        >
          <option disabled value="">Select location</option>
          <option 
            v-for="loc in locations" 
            :key="loc.id" 
            :value="loc.id"
            :disabled="availabilityByLocation[loc.id] === 'unavailable'"
          >
            {{ loc.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-500">Day Count</label>
        <input
          type="number"
          min="1"
          v-model.number="dayCountInput"
          class="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>

    <!-- MAIN -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT -->
      <div class="lg:col-span-2 space-y-4">
        <!-- PRODUCT -->
        <div class="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
          <img
            :src="selectedImage"
            class="w-full sm:w-40 h-28 sm:h-28 object-contain border rounded"
          />
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <h2 class="font-semibold text-base sm:text-lg">{{ product.name }}</h2>
              <p class="text-sm text-gray-500">
                Rp {{ product.price.toLocaleString() }} / day
              </p>
              <p class="text-xs mt-1">
                ● <span 
                    :class="availabilityStatusClass">{{ availabilityStatusText }}</span>
              </p>
            </div>
            <!-- PRICE CHART -->
            <div
              @click="showPriceChart = true"
              class="mt-2 sm:mt-0 text-sm text-orange-500 cursor-pointer flex items-center gap-1 hover:underline"
            >
              Price Chart
            </div>
          </div>
        </div>

        <!-- PACKAGE -->
        <div v-if="product.default_package" class="border rounded-lg p-4">
          <h3 class="font-semibold mb-3">Package</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div v-for="item in product.default_package.components" :key="item.id" class="text-center">
              <img :src="`/images/${item.product.image.image}`" class="h-16 mx-auto mb-2 object-contain" />
              <p class="font-medium">{{ item.product.name }}</p>
              <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="border rounded-lg p-4 space-y-3 h-fit">
        <div class="flex justify-between text-sm">
          <span>Rent ({{ dayCount }} days)</span>
          <span>Rp {{ rentTotal.toLocaleString() }}</span>
        </div>

        <div v-if="freeDays > 0" class="flex justify-between text-sm text-green-600">
          <span>Free ({{ freeDays }} days)</span>
          <span>- Rp {{ freeAmount.toLocaleString() }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rp {{ subtotal.toLocaleString() }}</span>
        </div>

        <div v-if="discountRate > 0" class="flex justify-between text-sm text-red-500">
          <span>Discount ({{ discountRate * 100 }}%)</span>
          <span>- Rp {{ discount.toLocaleString() }}</span>
        </div>

        <hr />

        <div class="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>Rp {{ total.toLocaleString() }}</span>
        </div>

        <button
          :disabled="!isValid"
          @click="confirmBooking"
          class="w-full mb-2 sm:mb-0 
                 bg-yellow-500 hover:bg-yellow-600 
                 disabled:bg-gray-300 text-white py-3 rounded font-semibold"
        >
          Book Now
        </button>

        <button
          @click="cancelBooking"
          class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20 text-gray-400">
    Loading product...
  </div>

  <!-- PRICE CHART MODAL -->
  <div v-if="showPriceChart" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white w-full max-w-md mx-2 sm:mx-0 rounded-xl p-5 relative animate-fade-in overflow-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-lg">Price Chart - {{ product.name }}</h3>
        <button @click="showPriceChart = false" class="text-gray-400 hover:text-black">✕</button>
      </div>
      <div class="space-y-3">
        <div v-for="(row, i) in priceTable" :key="i" class="flex justify-between items-center border-b pb-2 text-sm">
          <span>{{ row.label }}</span>
          <span class="font-semibold text-orange-600">Rp {{ row.total.toLocaleString() }}</span>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4">
        * Discount applied automatically during checkout
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useRouter, useRoute } from "vue-router";
import { useCart } from "../stores/cart";
import products from "../data/products.json";

const router = useRouter();
const route = useRoute();
const cart = useCart();

/* ===================== PRODUCT ===================== */
const product = computed(() =>
  products.find((p) => String(p.id) === String(route.params.id))
);


const selectedImage = computed(() => {
  if (!product.value?.images?.length) return "/images/placeholder.png";
  return `/images/${product.value.images[0].image}`;
});

/* ===================== FORM STATE ===================== */
const pickupDate = ref(cart.booking?.startDate || "");
const returnDate = ref(cart.booking?.endDate || "");
const pickupLocation = ref(cart.booking?.pickupLocation || "");
const returnLocation = ref(cart.booking?.pickupLocation || "");
const dayCountInput = ref(1);

/* ===================== LOCATIONS ===================== */
const locations = computed(() => [
  { id: "JKT", name: "Jakarta" },
  { id: "SBY", name: "Surabaya" },
]);

/* ===================== AVAILABILITY ===================== */
const availabilityByLocation = computed(() => {
  const result = {};
  locations.value.forEach(loc => {
    if (cart.booking?.pickupLocation === loc.id) result[loc.id] = "unavailable";
    else result[loc.id] = "available";
  });
  return result;
});

const availabilityStatus = computed(() => {
  if (!pickupLocation.value) return "available";
  return availabilityByLocation.value[pickupLocation.value] || "available";
});

const availabilityStatusText = computed(() => {
  const status = availabilityStatus.value;
  if (status === "available") return "Available";
  if (status === "unavailable") return "Unavailable";
  return "By Request";
});

const availabilityStatusClass = computed(() => {
  const status = availabilityStatus.value;
  if (status === "available") return "text-green-600";
  if (status === "unavailable") return "text-red-500";
  return "text-yellow-500";
});

/* ===================== DAY COUNT ===================== */
const dayCount = computed(() => {
  if (!pickupDate.value || !returnDate.value) return 1;
  const diff = dayjs(returnDate.value).diff(dayjs(pickupDate.value), "day");
  return diff >= 1 ? diff : 1;
});

watch(dayCount, val => { dayCountInput.value = val; });
watch(dayCountInput, val => {
  if (!pickupDate.value || val < 1) return;
  returnDate.value = dayjs(pickupDate.value).add(val, "day").format("YYYY-MM-DDTHH:mm");
});

/* ===================== LOCALSTORAGE + CART SYNC ===================== */
watch([pickupDate, returnDate, pickupLocation, returnLocation], () => {
  if (!product.value) return; // aman dari error
  const booking = {
    productId: product.value.id,
    startDate: pickupDate.value,
    endDate: returnDate.value,
    days: dayCount.value,
    pickupLocation: pickupLocation.value,
    returnLocation: returnLocation.value,
  };
  cart.updateBooking(booking);
  localStorage.setItem("booking", JSON.stringify(booking));
}, { immediate: true });

/* ===================== PRICE LOGIC ===================== */
const rentTotal = computed(() => product.value ? product.value.price * dayCount.value : 0);
const freeDays = computed(() => Math.floor(dayCount.value / 2));
const freeAmount = computed(() => product.value ? freeDays.value * product.value.price : 0);
const subtotal = computed(() => rentTotal.value - freeAmount.value);
const discountRate = computed(() => (dayCount.value >= 14 ? 0.2 : dayCount.value >= 7 ? 0.1 : 0));
const discount = computed(() => subtotal.value * discountRate.value);
const total = computed(() => subtotal.value - discount.value);

/* ===================== VALIDATION ===================== */
const isValid = computed(() => {
  return pickupDate.value && returnDate.value && pickupLocation.value && dayCount.value >= 1 && availabilityStatus.value === "available";
});

/* ===================== PRICE CHART ===================== */
const showPriceChart = ref(false);
const priceTable = computed(() => {
  const base = product.value.price;
  return [
    { days: 1, label: "1 Day", total: base },
    { days: 2, label: "2 Days (Free 1)", total: base * 2 },
    { days: 3, label: "3 Days", total: base * 2 },
    { days: 5, label: "5 Days", total: base * 4 },
    { days: 7, label: "7 Days (-10%)", total: base * 7 * 0.9 },
    { days: 14, label: "14 Days (-20%)", total: base * 14 * 0.8 },
  ];
});

const confirmBooking = () => {
  if (!isValid.value) return;

  Swal.fire({
    icon: "success",
    title: "Booking Berhasil",
    text: "Terima kasih telah melakukan booking.",
    timer: 2000,
    showConfirmButton: false,
  });

  setTimeout(() => {
    const productImage = selectedImage.value || "/images/placeholder.png";

    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Kwitansi Booking</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              margin: 0;
              box-sizing: border-box;
              background: #f9f9f9;
              display: flex;
              justify-content: center;
            }
            .container {
              max-width: 500px;
              width: 100%;
              background: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #f97316;
              text-align: center;
              margin-bottom: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto 20px;
              border-radius: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #f3f3f3;
            }
            @media print {
              body {
                background: #fff;
              }
              .container {
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Kwitansi Booking</h1>
            <img src="${productImage}" alt="${product.value.name}" />
            <table>
              <tr><th>Produk</th><td>${product.value.name}</td></tr>
              <tr><th>Pickup</th><td>${pickupDate.value}</td></tr>
              <tr><th>Return</th><td>${returnDate.value}</td></tr>
              <tr><th>Lokasi</th><td>${pickupLocation.value}</td></tr>
              <tr><th>Hari</th><td>${dayCount.value}</td></tr>
              <tr><th>Total</th><td>Rp ${total.value.toLocaleString()}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();

    // Optional: langsung print
    // receiptWindow.print();

    router.replace("/");
  }, 2100);
};


const cancelBooking = () => {
  cart.clearBooking();
  router.replace("/");
};
</script>
