// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	compatibilityDate: "2024-11-01",
	devtools: { enabled: process.env.NODE_ENV === "development" },
	runtimeConfig: {
		public: {
			apiUrl: "http://localhost:8787",
			firebase: {
				apiKey: "",
				authDomain: "",
				projectId: "",
				storageBucket: "",
				messagingSenderId: "",
				appId: "",
				measurementId: "",
				useEmulator: "false",
			},
		},
	},
	plugins: ["~/plugins/firebase.client"],
	css: ["~/assets/css/main.css"],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
});
