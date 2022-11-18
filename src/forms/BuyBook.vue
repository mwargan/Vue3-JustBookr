<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { reactive, ref } from "vue";
import BaseForm from "./BaseForm.vue";

const props = defineProps({
  postId: {
    type: [Number, String],
    required: true,
  },
});

const userStore = useUserStore();

const form = reactive({
  postId: props.postId,
  comment: null,
  meet: "cafeteria",
  date: null,
  time: null,
});

const baseForm = ref();

const emit = defineEmits(["created"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!form.date) {
    return;
  }
  axios
    .post("/api/v1/orders", {
      comment: form.comment,
      "location-meet": form.meet,
      // The location-date must be transformed to "U" format
      "location-date": Number(new Date(form.date).getTime() / 1000),
      "location-time": form.time,
      "post-id": form.postId,
    })
    .then((res) => {
      emit("created", res.data);
    })
    .catch((err) => {
      console.log("err", err);
    });
};

const now = () => {
  return new Date().toISOString().substring(0, 16);
};

const oneWeekFromNow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().substring(0, 16);
};
</script>

<template>
  <BaseForm
    ref="baseForm"
    @submit="submitForm"
    :isLoading="userStore.isLoading"
    submitText="Buy this book"
  >
    <label for="location-meet">{{ $t("Where do you want to meet?") }}</label>
    <select
      name="location-meet"
      placeholder="Example: At the library"
      v-model="form.meet"
      required
      autofocus
    >
      <option selected value="cafeteria">{{ $t("At the cafeteria") }}</option>
      <option value="library">{{ $t("At the library") }}</option>
      <option value="main-entrance">{{ $t("By the main entrance") }}</option>
      <option value="class">{{ $t("In class") }}</option>
    </select>

    <label>{{ $t("When?") }}</label>
    <input
      type="datetime-local"
      name="location-date"
      required
      placeholder="DD/MM/YYYY HH:MM"
      :min="now()"
      :max="oneWeekFromNow()"
      v-model="form.date"
      data-hj-whitelist=""
      class="form-control"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
    />

    <label>{{ $t("Message (optional)") }}</label>
    <input
      type="text"
      name="comment"
      v-model="form.comment"
      data-hj-whitelist=""
      class="form-control"
    />

    <template #submit="{ isLoading, disabled }">
      <ConfirmsGate
        :title="$t('Connect')"
        :gate="['auth']"
        @confirmed="submitForm()"
      >
        <template v-slot="{ isConfirming }">
          <BaseButton
            type="submit"
            :aria-busy="isConfirming || isLoading"
            :disabled="disabled"
            >{{ $t("Buy this book") }}
          </BaseButton>
        </template>
      </ConfirmsGate>
    </template>
  </BaseForm>
</template>
