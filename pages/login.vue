<template>
<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
  <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
    <div class="mb-2 text-right text-sm/6">
      <NuxtLink :to="{name: 'signup'}" class="rounded-sm text-cyan-600 hover:text-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">アカウントを作成する</NuxtLink>
    </div>

    <div v-if="errorMessage" class="mb-2 rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
      <div class="flex">
        <div class="shrink-0">
          <XCircleIcon class="size-5 text-red-400" aria-hidden="true" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">ログインに失敗しました</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <form class="space-y-6" @submit="submit">
      <div>
        <label for="email" class="block text-sm/6 font-medium text-gray-900">メールアドレス</label>
        <div class="mt-2">
          <input type="email" name="email" id="email" autocomplete="email" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="email">
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm/6 font-medium text-gray-900">パスワード</label>
          <button type="button" @click="togglePasswordVisibility" class="text-sm text-cyan-600 hover:text-cyan-500"
            :aria-label="showPassword ? 'パスワードを非表示にする' : 'パスワードを表示する'"
            :aria-pressed="showPassword"
          >
            {{ showPassword ? '非表示' : '表示' }}
          </button>
        </div>
        <div class="mt-2">
          <input :type="showPassword ? 'text' : 'password'" name="password" id="password" autocomplete="current-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="password">
        </div>
      </div>

      <div>
        <button type="submit" :disabled="isLoading" class="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="isLoading">ログイン中...</span>
          <span v-else>ログイン</span>
        </button>
      </div>
    </form>
  </div>
</div>
</template>

<script lang="ts" setup>
import { XCircleIcon } from "@heroicons/vue/20/solid";
import { getAuthErrorMessage } from "~/utils/auth";

definePageMeta({
	middleware: ["auth-login"],
});

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

const togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
};

const submit = async (event: Event) => {
	event.preventDefault();

	if (isLoading.value) {
		return;
	}

	errorMessage.value = "";
	const auth = useAuth();
	try {
		isLoading.value = true;
		await auth.loginEmailPassword(email.value, password.value);

		email.value = "";
		password.value = "";

		const to = useRoute().redirectedFrom?.fullPath || "/";
		navigateTo(to, { redirectCode: 302 });
	} catch (e) {
		console.error(e);
		errorMessage.value =
			e instanceof Error ? getAuthErrorMessage(e) : "ログインに失敗しました。";
		isLoading.value = false;
	}
};

onUnmounted(() => {
	email.value = "";
	password.value = "";
});
</script>
