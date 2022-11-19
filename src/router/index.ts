import { createRouter, createWebHistory } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";
import authRoutes from "./authRoutes";
import axios from "axios";
import { useUniversityStore } from "@/stores/university";
import { ref } from "vue";
import { setMetaAttributes } from "@m-media/vue3-meta-tags";
import {
  setDescription,
  setTitle,
} from "@m-media/vue3-meta-tags/src/metaTagger";
import type { Book } from "@/types/book";

export const navIsLoading = ref(true);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      meta: {
        // Notice how we pass the translation key rather than the actual string. This is because Vue Router will cache our meta, so if we just passed the translated string it would not update on language change.
        title: "Home",
      },
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Auth/SettingsView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/register",
      name: "register",
      redirect: () => {
        return `/sign-up`;
      },
    },
    {
      path: "/add-payment-method",
      name: "add-payment-method",
      component: () => import("../views/AddPaymentMethodView.vue"),
      meta: {
        gates: ["auth"],
      },
    },
    {
      path: "/about",
      name: "about",
      meta: {
        gates: ["auth", "confirmedPassword"],
      },
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/books/create",
      name: "create-book",
      component: () => import("../forms/SellBook.vue"),
    },
    // Redirect from the old /textbook/:isbn/:type route to the new /books/:isbn route
    {
      path: "/textbook/:isbn/:type",
      redirect: (to) => {
        return `/books/${to.params.isbn}`;
      },
    },
    {
      path: "/books/:isbn",
      name: "Books",
      meta: {
        skipMetaTagsHandler: true,
      },
      component: () => import("../views/BookView.vue"),
      beforeEnter(to: any, from: any, next: any) {
        setMetaAttributes(to, from);
        axios
          .get(`/api/v1/books/${to.params.isbn}`)
          .then((response: { data: Book }) => {
            to.params.book = response.data;
            setTitle(to.params.book["book-title"]);
            setDescription(to.params.book["book-des"]);
            return next();
          });
      },
    },
    // Redirect from the old /university/:id/:type route to the new /universities/:id route
    {
      path: "/university/:id/:type",
      redirect: (to) => {
        return `/universities/${to.params.id}`;
      },
    },
    {
      path: "/universities/:id",
      name: "Universities",
      meta: {
        skipMetaTagsHandler: true,
      },
      component: () => import("../views/UniversityView.vue"),
      beforeEnter(to: any, from: any, next: any) {
        setMetaAttributes(to, from);
        axios.get(`/api/v1/universities/${to.params.id}`).then((response) => {
          to.params.university = response.data;
          setTitle(to.params.university["uni-name"]);
          setDescription(to.params.university.description);
          return next();
        });
      },
    },
    // Redirect from the old /user/:id/:type route to the new /users/:id route
    {
      path: "/user/:id/:type",
      redirect: (to) => {
        return `/users/${to.params.id}`;
      },
    },
    {
      path: "/users/:id",
      name: "users",
      meta: {
        skipMetaTagsHandler: true,
      },
      component: () => import("../views/UserView.vue"),
      beforeEnter(to: any, from: any, next: any) {
        setMetaAttributes(to, from);
        axios.get(`/api/v1/users/${to.params.id}`).then((response) => {
          to.params.user = response.data;
          setTitle(to.params.user.name);
          return next();
        });
      },
    },
    {
      path: "/find/:query",
      name: "Search",
      component: () => import("../views/SearchView.vue"),
      beforeEnter(to: any, from: any, next: any) {
        axios
          .get(`/api/v1/books/search/${to.params.query}`)
          .then((response) => {
            to.params.books = response.data.data.sort((a: any, b: any) => {
              return b.posts_count - a.posts_count;
            });
            return next();
          });
      },
    },
    {
      path: "/terms-and-conditions",
      name: "terms-and-conditions",
      component: () => import("../views/TermsAndConditionsView.vue"),
    },
    {
      path: "/sell",
      name: "sell",
      component: () => import("../views/SellView.vue"),
    },
    // Add a catch-all 404 page
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/404View.vue"),
    },
    ...authRoutes,
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach(() => {
  navIsLoading.value = true;
});

router.afterEach((to, from, failure) => {
  navIsLoading.value = false;
  if (!failure) {
    $bus.$emit(eventTypes.viewed_page, {
      ...to,
      name: document.title,
    });

    // If there is a uni-id in the query string, we want to set it as a cookie
    if (to.query.uni_id) {
      const university = useUniversityStore();
      university.setCurrentUniversityId(String(to.query.uni_id));
      to.query.uni_id = null;
    }
  }
});

export default router;
