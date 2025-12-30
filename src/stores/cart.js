import { defineStore } from "pinia";

export const useCart = defineStore("cart", {
  state: () => ({
    booking: JSON.parse(localStorage.getItem("booking")) || null,
  }),

  actions: {
    setBooking(payload) {
      this.booking = payload;
      localStorage.setItem("booking", JSON.stringify(payload));
    },

    updateBooking(payload) {
      if (!this.booking) return;

      this.booking = {
        ...this.booking,
        ...payload,
      };

      localStorage.setItem("booking", JSON.stringify(this.booking));
    },

    clearBooking() {
      this.booking = null;
      localStorage.removeItem("booking");
    },

    // cek availability lokasi
    isAvailable(locationId) {
      // jika ada booking dan lokasinya sama => unavailable
      if (this.booking && this.booking.pickupLocation === locationId) {
        return false; // sudah booked
      }
      return true; // available
    },
  },
});
