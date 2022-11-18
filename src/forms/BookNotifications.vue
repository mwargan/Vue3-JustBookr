<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { useUniversityStore } from "@/stores/university";
import ConfirmsGate from "@/components/modals/ConfirmsGate.vue";
import { onMounted, ref } from "vue";
import BaseForm from "./BaseForm.vue";
import axios from "axios";
import { eventTypes, useEventsBus } from "@/eventBus/events";

const props = defineProps({
  isbn: {
    type: [Number, String],
    required: false,
  },
  universityId: {
    type: Number,
    required: false,
  },
});

const userStore = useUserStore();
const universityStore = useUniversityStore();

const isLoading = ref(true);

const $bus = useEventsBus();

const isSubscribed = ref();

const subscriptionId = ref();

// Email, password, and remember me
const isbn = ref(props.isbn);

const universityId = ref(
  props.universityId ??
    universityStore.currentUniversity["uni-id"] ??
    userStore.user?.["uni-id"]
);

const baseForm = ref();

const emit = defineEmits(["subscribed", "unsubscribed"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!isbn.value) {
    return;
  }

  if (isSubscribed.value) {
    return unsubscribe();
  }

  return subscribe();
};

const cannotSubmit = () => {
  return !userStore.user?.["user-id"] || !universityId.value || !isbn.value;
};

const getSubscribedStatus = () => {
  if (cannotSubmit()) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  axios
    .get(
      `/api/v1/book-notifications?user=${userStore.user?.["user-id"]}&university=${universityId.value}&isbn=${isbn.value}`
    )
    .then(({ data }) => {
      isSubscribed.value = data.total > 0;
      subscriptionId.value = data.data[0]?.id;
      isLoading.value = false;
    });
};

onMounted(() => {
  getSubscribedStatus();
});

const subscribe = () => {
  if (cannotSubmit()) {
    isLoading.value = false;
    return;
  }
  axios
    .post("/api/v1/book-notifications", {
      isbn: isbn.value,
      uni_id: universityId.value,
    })
    .then((response) => {
      isSubscribed.value = true;
      subscriptionId.value = response.data.id;
      emit("subscribed");
      $bus.$emit(eventTypes.subscribed_to_post_notifications, {
        isbn: isbn.value,
        uni_id: universityId.value,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const unsubscribe = () => {
  if (cannotSubmit()) {
    isLoading.value = false;
    return;
  }
  axios
    .delete("/api/v1/book-notifications/" + subscriptionId.value)
    .then(() => {
      isSubscribed.value = false;
      emit("unsubscribed");
      $bus.$emit(eventTypes.unsubscribed_from_post_notifications, {
        isbn: isbn.value,
        uni_id: universityId.value,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>

<template>
  <BaseForm
    ref="baseForm"
    @submit="submitForm()"
    :isLoading="userStore.isLoading || isLoading"
    submitText="Buy this book"
    :showSubmitButton="false"
  >
    <ConfirmsGate
      :title="$t('Connect')"
      :gate="['auth']"
      @confirmed="submitForm()"
    >
      <label for="switch" :aria-busy="isLoading">
        <input
          type="checkbox"
          id="switch"
          :checked="isSubscribed"
          name="switch"
          role="switch"
          v-if="!isLoading"
        />
        {{ $t("Get notified when there are new offers") }}
      </label>
    </ConfirmsGate>
  </BaseForm>
</template>
