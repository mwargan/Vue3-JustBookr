import { event, optIn, optOut, pageview, set } from "vue-gtag";
import type { eventTypes } from "../events";

export default {
  enabled_analytics: () => {
    optIn();
    event("analytics_opt_in");
  },
  disabled_analytics: () => {
    event("analytics_opt_out");
    optOut();
  },
  viewed_page: (to: any) => {
    pageview(to);
  },
  logged_in: () => {
    event("login");
  },
  registered: () => {
    event("sign_up");
  },
  added_payment_method: () => {
    event("add_payment_info", {
      payment_type: "card",
    });
  },
  changed_locale: (locale: string) => {
    set({ locale: locale });
    event("change_locale", {
      locale: locale,
    });
  },
  changed_theme: (theme: string) => {
    set({ theme: theme });
    event("change_theme", {
      theme: theme,
    });
  },
  changed_university: (universityId: string | number) => {
    set({ university_id: universityId });
    event("change_university", {
      university_id: universityId,
    });
  },
  subscribed_to_post_notifications: (data: {
    isbn: Number;
    uni_id: Number;
  }) => {
    event("subscribe_to_post_notifications", data);
  },
  unsubscribed_from_post_notifications: (data: {
    isbn: Number;
    uni_id: Number;
  }) => {
    event("unsubscribe_from_post_notifications", data);
  },
  posted_offer: (data: {
    isbn: Number;
    price: Number;
    uni_id: Number;
    created_new_book: Boolean;
  }) => {
    event("post_offer", data);
  },
  created_personal_access_token: () => {
    event("create_personal_access_token");
  },
} as Record<eventTypes, any>;
