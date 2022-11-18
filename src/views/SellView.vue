<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import SellBook from "@/forms/SellBook.vue";
import type { Post } from "@/types/post";
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToBook = (event: Post) => {
  router.push("/books/" + event.isbn);
};
</script>
<template>
  <section>
    <h1>{{ $t("Sell a book") }}</h1>
    <CardElement>
      <SellBook @success="navigateToBook" />
    </CardElement>
  </section>
</template>
