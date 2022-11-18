<script setup lang="ts">
import BookElement from "@/components/BookElement.vue";
import CardElement from "@/components/CardElement.vue";
import { navIsLoading } from "@/router";
import type { Book } from "@/types/book";
import axios from "axios";
import { ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";

const route = useRoute();

const books = ref(route.params.books as unknown as Book[]);

const query = ref(route.params.query);

const getBooks = () => {
  navIsLoading.value = true;
  axios.get("/api/v1/books/search/" + query.value).then((response) => {
    navIsLoading.value = false;
    books.value = response.data.data;
  });
};

// onUpdated(() => {
//   getBooks();
// });
onBeforeRouteUpdate((to) => {
  query.value = to.params.query;
  getBooks();
});
</script>
<template>
  <div class="grid view">
    <section>
      <h1>{{ books.length }} {{ $t("Books") }}: {{ query }}</h1>
    </section>
    <section>
      <h2>{{ $t("Books") }}</h2>

      <template v-if="books.length">
        <CardElement
          v-for="post in books"
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
      <div v-else>No results</div>
    </section>
  </div>
</template>
