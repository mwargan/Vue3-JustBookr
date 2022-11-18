<script setup lang="ts">
import type { University } from "@/types/university";
import axios from "axios";
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  defaultId: {
    type: Number,
    required: false,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  autofocus: {
    type: Boolean,
    default: true,
  },
});

const searchTerm = ref("");

onMounted(() => {
  if (props.defaultId) {
    getUniversityById(props.defaultId);
  }
});

const input = ref();

const results = ref([] as University[]);

const selectedIndex = ref(null as number | null);

const isLoading = ref(false);

const getUniversities = async () => {
  isLoading.value = true;
  axios
    .get("/api/v1/universities/search/" + searchTerm.value)
    .then((response) => {
      results.value = response.data.data;
      isLoading.value = false;
      if (results.value.length === 1) {
        handleClick(0);
      }
    });
};

const getUniversityById = async (id: string | number) => {
  isLoading.value = true;
  axios.get("/api/v1/universities/" + id).then((response) => {
    results.value = [response.data];
    selectedIndex.value = 0;
    searchTerm.value = response.data["uni-name"];
    isLoading.value = false;
  });
};

const emits = defineEmits(["selected"]);

const handleClick = (id: number) => {
  input.value.blur();
  selectedIndex.value = id;
  searchTerm.value = results.value[selectedIndex.value]["uni-name"];
  emits("selected", results.value[selectedIndex.value]);
  //   router.push("/universities/" + universityId);
};

const termExistsInResults = (term: string) => {
  return results.value.some((result) => {
    return result["uni-name"].toLowerCase() === term.toLowerCase();
  });
};

const isValid = ref(false);

const checkIsValid = () => {
  return results.value.length > 0 && termExistsInResults(searchTerm.value);
};

// Watch for changes to the search term, and update the results
watch(searchTerm, () => {
  if (searchTerm.value.length > 2 && !termExistsInResults(searchTerm.value)) {
    getUniversities();
  }
  isValid.value = checkIsValid();
  if (!isValid.value) {
    selectedIndex.value = null;
  }
});
</script>
<template>
  <label for="university" v-if="showLabel">{{
    $t("Choose your university")
  }}</label>
  <input
    ref="input"
    name="university"
    v-model.lazy="searchTerm"
    v-debounce="500"
    :aria-invalid="!isValid"
    :aria-busy="isLoading"
    :placeholder="$t('University')"
    :autofocus="autofocus"
  />
  <ul
    v-if="results.length > 0 && searchTerm.length > 2 && !isValid"
    role="listbox"
    :aria-busy="isLoading"
  >
    <li
      v-for="(result, index) in results"
      :key="result['uni-id']"
      @click="handleClick(index)"
    >
      {{ result["uni-name"] }}
    </li>
  </ul>
</template>
