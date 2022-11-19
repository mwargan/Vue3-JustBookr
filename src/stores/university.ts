import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import type { University } from "@/types/university";

export const useUniversityStore = defineStore("university", () => {
  const currentUniversity = ref({} as University);

  const eventBus = useEventsBus();

  const setCurrentUniversityId = (id: string | number) => {
    currentUniversity.value["uni-id"] = Number(id);
    localStorage.setItem("currentUniversityId", String(id));
    getUniversity(currentUniversity.value["uni-id"]);
    eventBus.$emit(
      eventTypes.changed_university,
      currentUniversity.value["uni-id"]
    );
  };

  const getUniversity = async (id: string | number) => {
    const response = await axios.get(`/api/v1/universities/${id}`);
    // Change the keys of the response.data object
    // to match the keys of the currentUniversity.value object
    currentUniversity.value = {
      ...response.data,
      id: response.data["uni-id"],
    };
    return response.data;
  };

  if (currentUniversity.value["uni-id"]) {
    getUniversity(currentUniversity.value["uni-id"]);
  }

  const localUniversityId = localStorage.getItem("currentUniversityId");

  if (localUniversityId && !currentUniversity.value["uni-id"]) {
    setCurrentUniversityId(localUniversityId);
  }

  return {
    currentUniversity,
    setCurrentUniversityId,
  };
});
