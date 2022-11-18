<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: "div",
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  titleLevel: {
    type: Number,
    default: 3,
  },
  edition: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: false,
  },
  isbn: {
    type: Number,
    required: false,
  },
});
</script>
<template>
  <component class="grid image-and-text" :is="type">
    <img v-fallback-img class="book" :src="image" :alt="title" />
    <hgroup>
      <component :is="'h' + titleLevel">{{ title }}</component>
      <p v-if="edition">
        {{ $t("{edition} edition", { edition: edition }) }}
      </p>
      <RouterLink v-if="author" :to="'/find/' + author">{{
        author
      }}</RouterLink>
    </hgroup>
  </component>
</template>
