import type { eventTypes } from "../events";
import axios from "axios";

export default {
  viewed_page: (to: any) => {
    if (to.params.book) {
      axios.post(`/api/v1/textbooks/${to.params.book.isbn}/views`);
    }
  },
} as Record<eventTypes, any>;
