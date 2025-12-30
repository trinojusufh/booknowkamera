import { createRouter, createWebHistory } from "vue-router";
import ProductList from "../views/ProductList.vue";
import ProductDetail from "../views/ProductDetail.vue";
import BookNow from "../views/BookNow.vue";
import AddToProject from "../views/AddToProject.vue";
import Checkout from "../views/Checkout.vue";

const routes = [
  {
    path: "/",
    name: "product-list",
    component: ProductList,
  },
  {
    path: "/products/:id",
    name: "product-detail",
    component: ProductDetail,
  },
  {
    path: "/book-now/:id",
    name: "BookNow",
    component: BookNow,
  },
  {
    path: "/project",
    name: "project",
    component: AddToProject,
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
