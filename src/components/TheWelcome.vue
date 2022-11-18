<script setup lang="ts">
import { useUniversityStore } from "@/stores/university";
import { useUserStore } from "@/stores/user";
import type { Book } from "@/types/book";
import type { University } from "@/types/university";
import axios from "axios";
import { onMounted, ref } from "vue";
import BaseButton from "./BaseButton.vue";
import BookElement from "./BookElement.vue";
import CardElement from "./CardElement.vue";
import UniversitySelect from "./UniversitySelect.vue";

const appName = import.meta.env.VITE_APP_NAME;

const suggestedBooks = ref([] as Book[]);

const universityStore = useUniversityStore();
const userStore = useUserStore();

const getSuggestedBooks = () => {
  axios.get("/api/v1/suggestions/textbooks").then((response) => {
    suggestedBooks.value = response.data.data;
  });
};

const recentBooks = ref([] as Book[]);

const universities = ref([] as University[]);

const getRecentBooks = () => {
  axios.get("/api/v1/suggestions/recent").then((response) => {
    recentBooks.value = response.data.data;
  });
};

const getUniversities = () => {
  axios.get("/api/v1/universities").then((response) => {
    universities.value = response.data.data;
  });
};

onMounted(() => {
  getSuggestedBooks();
  getRecentBooks();
  getUniversities();
});

const handleUniversitySelected = (university: University) => {
  universityStore.setCurrentUniversityId(university["uni-id"]);
};
</script>

<template>
  <header class="page-header">
    <hgroup>
      <h1 v-if="universityStore.currentUniversity['uni-name']">
        {{
          $t("{appName} at {universityName}", {
            appName: appName,
            universityName: universityStore.currentUniversity["uni-name"],
          })
        }}
      </h1>
      <h1 v-else>{{ appName }}</h1>
      <p>{{ $t("Trade textbooks at your university") }}</p>
    </hgroup>
    <template v-if="!universityStore.currentUniversity['uni-id']">
      <UniversitySelect @selected="handleUniversitySelected" />
    </template>
    <p v-else-if="!userStore.user" class="grid">
      <BaseButton to="/login" class="contrast">{{ $t("Login") }}</BaseButton>
      <BaseButton to="/sign-up" class="contrast">{{
        $t("Sign up")
      }}</BaseButton>
    </p>
    <p v-else class="grid">
      <BaseButton to="/sell" class="contrast">{{ $t("Sell") }}</BaseButton>
      <BaseButton to="/buy" class="contrast">{{ $t("Buy") }}</BaseButton>
    </p>
    <!-- <p>
      <code><small>Less than 10 kB minified and gzipped</small></code>
    </p> -->
  </header>
  <section>
    <hgroup>
      <h2>🔥 {{ $t("Hot this semester") }}</h2>
      <p>{{ $t("Books being traded at universities right now") }}</p>
    </hgroup>

    <div class="horizontal-scroll">
      <template v-if="suggestedBooks.concat(recentBooks).length">
        <CardElement
          v-for="post in suggestedBooks.concat(recentBooks)"
          :key="post.isbn"
          @click="$router.push('/books/' + post['isbn'])"
        >
          <BookElement
            :title="post['book-title']"
            :image="post['image-url']"
            :edition="post.edition"
            :author="post.author"
          />
        </CardElement>
      </template>
    </div>
  </section>
  <section>
    <article class="grid contrast">
      <div>
        <hgroup>
          <h1>{{ $t("Find cheaper textbooks") }}</h1>
          <h2>{{ $t("Right at your university") }}</h2>
        </hgroup>
        <p>
          {{ $t("find-cheaper-books-message") }}
        </p>
      </div>

      <img
        src="https://s3-eu-west-1.amazonaws.com/justbookrbucket/images/Unis/l_c1b9484299d0870e1baa929318b02a26-2.jpg"
        alt=""
        class="full-card-image"
      />
    </article>
  </section>
  <section>
    <hgroup>
      <h2>🎓 {{ $t("Buzzing universities") }}</h2>
      <p>{{ $t("Universities active on {appName}", { appName: appName }) }}</p>
    </hgroup>

    <div class="horizontal-scroll">
      <CardElement
        v-for="university in universities"
        :key="university['uni-id']"
        @click="$router.push('/universities/' + university['uni-id'])"
        :title="university['uni-name']"
        :subtitle="university.country?.name"
        :images="[
          {
            src: university['uni-pic'] || university['uni-logo'],
            alt: university['uni-name'],
          },
        ]"
      >
      </CardElement>
    </div>
  </section>
  <section>
    <article class="grid contrast">
      <div>
        <hgroup>
          <h1>{{ $t("Post books for sale") }}</h1>
          <h2>{{ $t("Trade with students on your campus") }}</h2>
        </hgroup>
        <p>
          {{ $t("sell-books-message") }}
        </p>
        <!-- <RouterLink to="/universities">
          <BaseButton>{{ $t("Find your university") }}</BaseButton>
        </RouterLink> -->
      </div>

      <img
        src="https://s3-eu-west-1.amazonaws.com/justbookrbucket/images/Unis/l_c1b9484299d0870e1baa929318b02a26-2.jpg"
        alt=""
        class="full-card-image"
      />
    </article>
  </section>
</template>
