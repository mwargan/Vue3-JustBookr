<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { navIsLoading } from "@/router";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";

const router = useRouter();
const route = useRoute();

const searchTerm = ref(route.params.query ?? "");

const isLoading = ref(false);

const isFocusedSearch = ref(false);

const searchElement = ref();

const search = async () => {
  searchElement.value.blur();
  isLoading.value = true;
  await router.push({ name: "Search", params: { query: searchTerm.value } });
  isLoading.value = false;
};
</script>
<template>
  <BaseForm
    :show-submit-button="false"
    @submit="search"
    :isLoading="isLoading || navIsLoading"
    :autoFocus="false"
  >
    <input
      :aria-busy="isLoading"
      type="search"
      ref="searchElement"
      v-model="searchTerm"
      @focus="isFocusedSearch = true"
      @blur="isFocusedSearch = false"
      name="search"
      :placeholder="$t('Search')"
    />
  </BaseForm>
</template>
