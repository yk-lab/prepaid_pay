import { handleAuthCheck } from "~/utils/auth";

export default defineNuxtRouteMiddleware(async () => {
	const isAuthenticated = await handleAuthCheck();

	if (isAuthenticated === null) {
		return await navigateTo("/error", { replace: true });
	}

	if (isAuthenticated) {
		return await navigateTo("/", { replace: true });
	}
});
