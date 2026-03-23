import { createRouter, createWebHistory } from "vue-router";
import HomeView from '../views/MainView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:techId',
      name: 'homeWithTech',
      component: HomeView,
      props: true,
    },
    {
      path: '/:techId/:sectionId',
      name: 'homeWithSection',
      component: HomeView,
      props: true,
    },
  ],
});

export default router;
