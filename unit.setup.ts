// See also the vitest.config.ts file
import { RouterLinkStub, config } from "@vue/test-utils";
import { setupI18n } from "./src/locales/i18n";
import { createTestingPinia } from "@pinia/testing";
import { vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";

const mockRouter = createRouter({ history: createWebHistory(), routes: [] });
// fake router params
mockRouter.currentRoute.value.params = {
  userId: "12",
};

config.global.mocks = {
  navIsLoading: false,
  useRoute: () => ({
    params: {},
  }),
};

config.global.stubs = {
  RouterLink: RouterLinkStub,
  teleport: true,
};

const i18n = setupI18n();
config.global.plugins = [
  i18n,
  mockRouter,
  createTestingPinia({
    createSpy: vi.fn,
  }),
];

// Config directive fallback-img
config.global.directives = {
  fallbackImg: {},
};
