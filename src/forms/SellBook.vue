<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useUniversityStore } from "@/stores/university";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { reactive, ref } from "vue";
import BaseForm from "./BaseForm.vue";

const props = defineProps({
  isbn: {
    type: Number,
    required: false,
  },
  showIsbn: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const userStore = useUserStore();
const universityStore = useUniversityStore();
const $bus = useEventsBus();

const form = reactive({
  isbn: props.isbn,
  price: null,
  condition: null,
  description: "",
  universityId:
    universityStore.currentUniversity["uni-id"] ?? userStore.user?.["uni-id"],

  needsToFillInBookDetails: false,

  // Required if book does not exist
  bookTitle: "",
  bookAuthor: "",
  bookImage: null,
});

const baseForm = ref();

const emit = defineEmits(["success"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  const data = {
    isbn: form.isbn,
    price: form.price,
    condition: form.condition,
    "post-description": form.description,
    "uni-id": form.universityId ?? universityStore.currentUniversity["uni-id"],

    // Required if book does not exist
    "book-title": form.bookTitle,
    "book-des": form.bookTitle,
    author: form.bookAuthor,
  };

  const formData = new FormData();
  for (const key in data) {
    formData.append(key, String(data[key as keyof typeof data]));
  }

  if (form.bookImage) {
    formData.append("image", form.bookImage);
  }

  axios
    .post("api/v1/posts", formData)
    .then((response) => {
      emit("success", response.data);
      $bus.$emit(eventTypes.posted_offer, {
        isbn: form.isbn,
        price: form.price,
        uni_id: form.universityId,
        created_new_book: form.needsToFillInBookDetails,
      });
    })
    .catch((error) => {
      baseForm.value.setInputErrors(error.response.data.errors);
      if (error.response.data.errors?.["book-title"]) {
        form.needsToFillInBookDetails = true;
      }
      console.log(error);
    });
};

const onFileChange = (event: any) => {
  form.bookImage = event.target.files[0];
};
</script>

<template>
  <BaseForm
    ref="baseForm"
    @submit="submitForm"
    :isLoading="userStore.isLoading"
    submitText="Post this book for sale"
  >
    <template v-if="showIsbn">
      <label>ISBN 13</label>
      <input
        type="text"
        placeholder="Example: 978-3-16-148410-0"
        pattern="[0-9]{13}"
        size="13"
        step="1"
        required
        inputmode="numeric"
        v-model="form.isbn"
      />
    </template>

    <label>{{ $t("Price") }}</label>
    <input
      type="number"
      :placeholder="$t('Your selling price in EUR')"
      min="0"
      step="1"
      name="price"
      v-model="form.price"
      required
      inputmode="numeric"
    />

    <label>Description</label>
    <textarea
      placeholder="Example: I need this book for my class. I will pay"
      v-model="form.description"
      name="description"
      required
      minlength="10"
    >
    </textarea>

    <fieldset v-if="form.needsToFillInBookDetails">
      <!-- Book title -->
      <label>{{ $t("Book title") }}</label>
      <input
        type="text"
        placeholder="Example: The Lord of the Rings"
        v-model="form.bookTitle"
        required
      />

      <!-- Book author -->
      <label>{{ $t("Book author") }}</label>
      <input
        type="text"
        placeholder="Example: J. R. R. Tolkien"
        v-model="form.bookAuthor"
        required
      />

      <!-- Book image -->
      <label>{{ $t("Book image") }}</label>
      <input type="file" accept="image/*" @change="onFileChange" required />
    </fieldset>

    <template #submit="{ submit, isLoading, disabled }">
      <ConfirmsGate
        :title="$t('Connect')"
        :gate="['auth']"
        @confirmed="submit()"
      >
        <template v-slot="{ isConfirming }">
          <BaseButton
            type="submit"
            :aria-busy="isConfirming || isLoading"
            :disabled="disabled"
            >{{ $t("Post this book for sale") }}
          </BaseButton>
        </template>
      </ConfirmsGate>
    </template>
  </BaseForm>
</template>
