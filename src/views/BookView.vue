<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import BookElement from "@/components/BookElement.vue";
import BookNotifications from "@/forms/BookNotifications.vue";
import SellBook from "@/components/modals/SellBook.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useUniversityStore } from "@/stores/university";
import axios from "axios";
import { onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import PostOffer from "@/components/PostOffer.vue";
import CardElement from "@/components/CardElement.vue";
import type { Book } from "@/types/book";
import type { Post } from "@/types/post";

const posts = ref([] as Post[]);

const eventBus = useEventsBus();

const route = useRoute();

const university = useUniversityStore();

const isLoading = ref(true);

const relatedBooks = ref([] as Book[]);

const isbn = ref(Number(route.params.isbn));

const book = route.params.book as unknown as Book;

const getPosts = () => {
  axios
    .get(
      "/api/v1/posts?isbn=" +
        isbn.value +
        "&paginate=false" +
        (university.currentUniversity["uni-id"]
          ? "&university=" + university.currentUniversity["uni-id"]
          : "")
    )
    .then((response) => {
      posts.value = response.data;
      isLoading.value = false;
    });
};

const getRelatedBooks = () => {
  axios
    .get(
      `api/v1/suggestions/other-editions/${isbn.value}` +
        (university.currentUniversity["uni-id"]
          ? "?university=" + university.currentUniversity["uni-id"]
          : "")
    )
    .then((response) => {
      relatedBooks.value = response.data.data;
    });
};

onMounted(() => {
  getPosts();
  getRelatedBooks();
});

eventBus.$on(eventTypes.changed_university, () => {
  getPosts();
});

const getBook = async () => {
  const response = await axios.get("/api/v1/books/" + isbn.value);
  return response.data;
};

onBeforeRouteUpdate(async (to) => {
  isbn.value = Number(to.params.isbn);
  await getBook().then((response) => {
    to.params.book = response;
    getPosts();
    getRelatedBooks();
  });
});
</script>
<template>
  <div class="grid view">
    <section>
      <BookElement
        :title="book['book-title']"
        :titleLevel="1"
        :image="book['image-url']"
        :edition="book.edition"
        :author="book.author"
      />

      <BookNotifications :isbn="isbn" />

      <SellBook :isbn="Number(isbn)" :showIsbn="false" @confirmed="getPosts()">
        <BaseButton class="secondary" data-cy="sell-button">{{
          $t("Make {amount} by selling your copy", {
            count: Number(book.average_price.substring(1)) + 1, // One is equivalent to the "singular" version
            amount: book.average_price,
          })
        }}</BaseButton>
      </SellBook>
    </section>

    <!-- <nav>
      <ul style="margin: 0 auto">
        <li>
          <a href="/textbook/9781471129391/posts" aria-current="page">
            Posts
          </a>
        </li>
        <li>
          <a href="/textbook/9781471129391/info"> Info </a>
        </li>
      </ul>
    </nav> -->

    <section>
      <h2>
        {{
          university.currentUniversity["uni-id"]
            ? $t("At {universityAbbreviation}", {
                universityAbbreviation:
                  university.currentUniversity.abr ||
                  university.currentUniversity["uni-name"],
              })
            : $t("For sale")
        }}
      </h2>

      <CardElement :aria-busy="isLoading" v-if="isLoading" />
      <template v-else-if="posts.length > 0">
        <PostOffer
          v-for="post in posts"
          :key="post['post-id']"
          :post="post"
          :showUniversity="false"
        />
      </template>
      <div v-else>
        <p>
          {{
            $t(
              "There are no offers for this book at {universityAbbreviation} right now",
              {
                universityAbbreviation:
                  university.currentUniversity.abr ||
                  university.currentUniversity["uni-name"],
              }
            )
          }}
        </p>
        <!-- Turn on notifications or post your own -->
        <p>
          {{
            $t(
              "Turn on notifications to be notified when there are new offers or post your own book for sale"
            )
          }}
        </p>
      </div>
      <h2>{{ $t("Delivered to your door") }}</h2>
      <CardElement title="Amazon">
        <template #header>
          <div class="user">
            <img
              width="45"
              height="45"
              v-fallback-img
              alt="Amazon"
              src="https://lh3.googleusercontent.com/mIeBLLu8xOi-1bPbtRO_HYb5d1VchJDLDH4hebMO7R-GNOfueGDtHCKgPWFjwyCAORQ=w90"
            />

            <div>Amazon</div>
          </div>
        </template>
        {{
          $t("{company} may have a copy of this book", { company: "Amazon" })
        }}
        <template #footer>
          <BaseButton
            :href="
              'https://www.amazon.com/s//ref=as_li_ss_tl?field-keywords=' +
              book.isbn +
              '&linkCode=ll2&tag=justbookr01-20'
            "
            >{{ $t("Check on {company}", { company: "Amazon" }) }}</BaseButton
          >
        </template>
      </CardElement>

      <template v-if="relatedBooks.length > 0">
        <h2>{{ $t("Other editions") }}</h2>
        <CardElement
          v-for="post in relatedBooks"
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
    </section>
  </div>
</template>
