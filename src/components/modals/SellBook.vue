<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import SellBook from "@/forms/SellBook.vue";

const props = defineProps({
  isbn: {
    type: Number,
    required: false,
  },
  showIsbn: {
    type: Boolean,
    default: true,
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
      :title="$t('Sell a copy')"
      :showTrigger="false"
      :showFooter="false"
      @closed="isConfirming = false"
    >
      <SellBook
        v-if="modal?.isModalOpen"
        @success="handleConfirmed"
        :isbn="props.isbn"
        :showIsbn="props.showIsbn"
      />
    </BaseModal>
  </span>
</template>
