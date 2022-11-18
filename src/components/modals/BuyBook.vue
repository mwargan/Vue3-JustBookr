<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import BuyBook from "@/forms/BuyBook.vue";

defineProps({
  postId: {
    type: Number,
    required: true,
  },
});

const emits = defineEmits(["confirmed"]);

const modal = ref();

const isConfirming = ref(false);

const startConfirming = async () => {
  isConfirming.value = true;
  modal.value.openModal();
};

const handleConfirmed = () => {
  emits("confirmed");
  modal.value.closeModal();
};
</script>
<template>
  <span>
    <span @click.prevent="startConfirming">
      <slot :isConfirming="isConfirming" />
    </span>

    <BaseModal
      ref="modal"
      :title="$t('Buy this book')"
      :showTrigger="false"
      :showFooter="false"
      @closed="isConfirming = false"
    >
      <BuyBook
        v-if="modal?.isModalOpen"
        @success="handleConfirmed"
        :postId="postId"
      />
    </BaseModal>
  </span>
</template>
