import { isIntegrationAvailable } from "../status";

export const algoliaAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("algolia");
  },

  getSearchCredentials() {
    if (!this.isAvailable()) return null;
    return {
      appId: import.meta.env.VITE_ALGOLIA_APP_ID || import.meta.env.ALGOLIA_APP_ID || null,
      searchKey:
        import.meta.env.VITE_ALGOLIA_SEARCH_KEY || import.meta.env.ALGOLIA_SEARCH_KEY || null,
    };
  },
};
