<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import BuyBook from "@/components/modals/BuyBook.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import BookElement from "./BookElement.vue";

const userStore = useUserStore();

defineProps({
  post: {
    type: Object,
    required: true,
  },
});
</script>
<template>
  <CardElement>
    <template v-if="post.user?.['user-id']" #header>
      <RouterLink :to="'/users/' + post.user?.['user-id']" class="user">
        <img
          width="45"
          height="45"
          :alt="post.user.name"
          :src="post.user.profilepic"
        />
        <div>{{ post.user.name }}</div></RouterLink
      >
      <div>{{ post.price }}</div>
    </template>
    <template v-else #header>
      {{ post["post-description"] }}
    </template>

    <p v-if="post.user?.['user-id']">
      {{ post["post-description"] }}
    </p>
    <BookElement
      v-if="post.textbook?.['book-title']"
      :title="post.textbook['book-title']"
      :image="post.textbook['image-url']"
      :edition="post.textbook.edition"
      :author="post.textbook.author"
      @click="$router.push('/books/' + post.textbook['isbn'])"
    />

    <template v-if="userStore.user?.['user-id'] !== post['user-id']" #footer>
      <BuyBook :postId="post['post-id']">
        <BaseButton>{{ $t("Buy now") }}</BaseButton>
      </BuyBook>
    </template>
    <template v-else #footer>
      <BaseButton>{{ $t("Edit") }}</BaseButton>
    </template>
    <!-- <template v-else> Your post </template> -->
  </CardElement>
</template>
