export default defineNuxtRouteMiddleware(async () => {
	if (!process.client) return;

	const { isAuthed, checkAuthState } = useAuth();
	await checkAuthState();
	if (isAuthed.value) {
		return await navigateTo("/", { replace: true });
	}
});
