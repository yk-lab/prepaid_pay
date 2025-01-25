<template>
<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
  <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
    <form class="grid grid-cols-1 gap-6" @submit="submit">
      <div v-if="validationError" class="rounded-md bg-yellow-50 p-4">
        <div class="flex">
          <div class="shrink-0">
            <ExclamationTriangleIcon class="size-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">アカウントの作成に失敗しました</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>{{ validationError }}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">メールアドレス</label>
        <div class="mt-2">
          <input type="email" name="email" id="email" autocomplete="email" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="email">
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm/6 font-medium text-gray-900">パスワード</label>
          <p class="text-sm text-gray-500" id="password-requirements" aria-live="polite">※8文字以上</p>
        </div>
        <div class="mt-2">
          <input type="password" name="password" id="password" autocomplete="new-password" required aria-describedby="password-requirements" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="password">
        </div>
      </div>

      <div>
        <label for="passwordConfirm" class="block text-sm/6 font-medium text-gray-900">パスワード（確認）</label>
        <div class="mt-2">
          <input type="password" name="passwordConfirm" id="passwordConfirm" autocomplete="new-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="passwordConfirm">
        </div>
      </div>

      <div>
        <button type="submit" :disabled="isLoading" class="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="isLoading">アカウントを作成中...</span>
          <span v-else>アカウントを作成</span>
        </button>
      </div>
    </form>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { getAuthErrorMessage } from "~/utils/auth";

definePageMeta({
	middleware: ["auth-login"],
});

const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const validationError = ref("");
const isLoading = ref(false);

const submit = async (event: Event) => {
	event.preventDefault();

	if (isLoading.value) {
		return;
	}

	validationError.value = "";

	if (password.value !== passwordConfirm.value) {
		validationError.value = "パスワードが一致しません";
		return;
	}

	if (password.value.length < 8) {
		validationError.value = "パスワードは8文字以上である必要があります";
		return;
	}

	const auth = useAuth();
	try {
		isLoading.value = true;
		await auth.registerEmailPassword(email.value, password.value);

		const to = useRoute().redirectedFrom?.fullPath || "/";
		navigateTo(to, { redirectCode: 302 });
	} catch (e) {
		console.error(e);
		validationError.value =
			e instanceof Error
				? getAuthErrorMessage(e)
				: "アカウントの作成に失敗しました";
		isLoading.value = false;
	}
};

onUnmounted(() => {
	validationError.value = "";
	email.value = "";
	password.value = "";
	passwordConfirm.value = "";
});
</script>
