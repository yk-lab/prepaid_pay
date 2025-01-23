<template>
<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
  <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
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
          <p class="text-sm text-gray-500">※8文字以上</p>
        </div>
        <div class="mt-2">
          <input type="password" name="password" id="password" autocomplete="new-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="password">
        </div>
      </div>

      <div>
        <label for="passwordConfirm" class="block text-sm/6 font-medium text-gray-900">パスワード（確認）</label>
        <div class="mt-2">
          <input type="password" name="passwordConfirm" id="passwordConfirm" autocomplete="new-password" required class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6" v-model="passwordConfirm">
        </div>
      </div>

      <div>
        <button type="submit" class="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">アカウントを作成</button>
      </div>
    </form>
  </div>
</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: ["auth-login"],
});

const email = ref("");
const password = ref("");
const passwordConfirm = ref("");

const submit = async (event: Event) => {
	event.preventDefault();

	if (password.value !== passwordConfirm.value) {
		alert("パスワードが一致しません");
		return;
	}

	if (password.value.length < 8) {
		alert("パスワードは8文字以上である必要があります");
		return;
	}

	const auth = useAuth();
	try {
		await auth.registerEmailPassword(email.value, password.value);

		const to = useRoute().redirectedFrom?.fullPath || "/";
		navigateTo(to, { redirectCode: 302 });
	} catch (e) {
		console.error(e);
		alert("アカウントの作成に失敗しました");
	}
};
</script>
