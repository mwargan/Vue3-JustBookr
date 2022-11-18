<script setup lang="ts">
import BookElement from "@/components/BookElement.vue";
import CardElement from "@/components/CardElement.vue";
import type { Book } from "@/types/book";
import type { University } from "@/types/university";
import type { User } from "@/types/user";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const posts = ref([] as Book[]);

const users = ref([] as User[]);

const route = useRoute();

const isLoading = ref(true);

const university = route.params.university as unknown as University;

const getPosts = () => {
  axios.get("/api/v1/books?university=" + route.params.id).then((response) => {
    posts.value = response.data.data;
    isLoading.value = false;
  });
};

const getUsers = () => {
  axios
    .get("/api/v1/users?order_by=user-registered&university=" + route.params.id)
    .then((response) => {
      users.value = response.data.data;
      isLoading.value = false;
    });
};

onMounted(() => {
  getPosts();
  getUsers();
});
// onUpdated(() => {
//   getPosts();
// });
</script>
<template>
  <div class="grid view">
    <section>
      <div class="grid image-and-text">
        <img
          v-fallback-img
          :src="university['uni-logo']"
          :alt="university['uni-name']"
        />
        <div>
          <h1 style="margin-bottom: 0">
            {{ university["uni-name"] }}
          </h1>
          <span>{{ university.country?.name }}</span>
        </div>
      </div>
      <br />
      <p>{{ university.description }}</p>
      <p>{{ university.url }}</p>
    </section>

    <section>
      <h2>{{ $t("Books") }}</h2>

      <CardElement :aria-busy="isLoading" v-if="isLoading" />
      <template v-else-if="posts.length > 0">
        <CardElement
          v-for="post in posts"
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
      <div v-else>
        {{
          $t("{universityName} isn't selling any books right now", {
            universityName: university["uni-name"],
          })
        }}
      </div>

      <template v-if="users.length > 0">
        <h2>{{ $t("People") }}</h2>
        <CardElement :aria-busy="isLoading" v-if="isLoading" />
        <template v-else-if="users.length > 0">
          <CardElement
            v-for="user in users"
            :key="user['user-id']"
            @click="$router.push('/users/' + user['user-id'])"
          >
            <RouterLink :to="'/users/' + user?.['user-id']" class="user">
              <img
                width="45"
                height="45"
                :alt="user.name + ' ' + user.surname"
                :src="user.profilepic || undefined"
                v-fallback-img
              />
              <div>{{ user.name }}</div></RouterLink
            >
          </CardElement>
        </template>
        <div v-else>
          {{
            $t("{universityName} doesn't have any users right now", {
              universityName: university["uni-name"],
            })
          }}
        </div>
      </template>
    </section>
  </div>
</template>
