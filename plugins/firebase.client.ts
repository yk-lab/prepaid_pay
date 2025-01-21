import { defineNuxtPlugin } from "#app";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const firebaseConfig = {
		apiKey: config.public.firebase.apiKey,
		authDomain: config.public.firebase.authDomain,
		projectId: config.public.firebase.projectId,
		storageBucket: config.public.firebase.storageBucket,
		messagingSenderId: config.public.firebase.messagingSenderId,
		appId: config.public.firebase.appId,
		measurementId: config.public.firebase.measurementId,
	};

	// Initialize Firebase
	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);

	// setup emulators
	if (config.public.firebase.useEmulator === "true") {
		connectAuthEmulator(getAuth(app), "http://localhost:9099");
		connectFirestoreEmulator(getFirestore(app), "localhost", 8080);

		const functions = getFunctions(app, "asia-northeast1");
		connectFunctionsEmulator(functions, "localhost", 5001);
	}
});
