<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import PostOffer from "@/components/PostOffer.vue";
import $bus, { eventTypes } from "@/eventBus/events";
import type { Post } from "@/types/post";
import type { User as UserType } from "@/types/user";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const posts = ref([] as Post[]);

const route = useRoute();

const i18n = useI18n();

const isLoading = ref(true);

const user = route.params.user as unknown as UserType;

const getPosts = () => {
  axios
    .get("/api/v1/posts?paginate=false&user=" + route.params.id)
    .then((response) => {
      posts.value = response.data;
      isLoading.value = false;
    });
};

onMounted(() => {
  getPosts();
});
// onUpdated(() => {
//   getPosts();
// });

// Convert to month and year from timestamp user?.["user-registered"]
const date = new Date(Number(user?.["user-registered"]) * 1000);

const month = ref(date.toLocaleString(i18n.locale.value, { month: "long" }));
const year = ref(date.getFullYear());

$bus.$on(eventTypes.changed_locale, () => {
  // update the month
  month.value = date.toLocaleString(i18n.locale.value, { month: "long" });
});

const appName = import.meta.env.VITE_APP_NAME;

const now = new Date().getTime() / 1000;

const threeMonthsAgo = now - 7776000;

const recentlySeen = Number(user?.last_login) > threeMonthsAgo;
</script>
<template>
  <div class="grid view">
    <section>
      <div class="grid image-and-text">
        <img
          :src="user.profilepic ?? undefined"
          v-fallback-img
          :alt="user.university?.['uni-name']"
          style="max-height: 400px; border-radius: var(--border-radius)"
        />

        <div>
          <h1 style="margin-bottom: 0">
            {{ user.name }}
          </h1>

          <router-link :to="'/universities/' + user.university?.['uni-id']">
            {{ user.university?.["uni-name"] }}
          </router-link>

          <div>
            <a
              href="#"
              :data-tooltip="$t('{appName} supporter', { appName })"
              v-if="year < 2020"
            >
              <img
                style="width: 2.5rem"
                src="https://img.icons8.com/bubbles/50/000000/like.png"
              />
            </a>

            <a
              href="#"
              :data-tooltip="$t('Pro book trader')"
              v-if="user.points && user.points > 10"
            >
              <img
                style="width: 2.5rem"
                src="https://img.icons8.com/bubbles/50/000000/medal.png"
              />
            </a>
            <a
              href="#"
              :data-tooltip="
                $t('{count} positive ratings', {
                  count: user.positive_ratings,
                })
              "
              v-if="user.positive_ratings && user.positive_ratings > 0"
            >
              <img
                style="width: 2.5rem"
                src="https://img.icons8.com/bubbles/50/000000/facebook-like.png"
              />
            </a>
          </div>

          <small>{{
            $t("Member since {month} {year}", {
              month: month,
              year: year,
            })
          }}</small>
        </div>
      </div>
    </section>
    <section>
      <h2>{{ $t("Books") }}</h2>

      <CardElement :aria-busy="isLoading" v-if="isLoading" />
      <template v-else-if="posts.length > 0">
        <PostOffer
          v-for="post in posts"
          :key="post['post-id']"
          :post="post"
          :allow-buying="recentlySeen"
        />
      </template>
      <div v-else>
        {{
          $t("{userName} is not selling any books right now", {
            userName: user.name,
          })
        }}
      </div>
    </section>
  </div>
</template>
