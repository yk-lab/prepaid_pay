<template>
<div v-if="auth.isAuthed">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div v-if="isLoading" class="text-center py-4">
      読み込み中...
    </div>
    <div v-else-if="error" class="text-center py-4 text-red-600">
      {{ error }}
    </div>
    <div v-if="profile" class="overflow-hidden rounded-lg bg-white shadow">
      <div class="px-4 py-5 sm:p-6 text-center">
        <div class="text-gray-900 text-sm">残高</div>
        <div class="text-gray-900 text-xl font-semibold">
          {{ profile.balance }}<span class="text-sm text-gray-600 ml-0.5">円</span>
        </div>
      </div>
    </div>

    <div class="mt-10 bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 space-y-4">
      <div v-if="profile" class="text-center">
        <div class="flex gap-x-0.5 justify-center text-gray-900 text-sm">
          ID: 
          <span class="select-all">{{ profile.uid }}</span>
          <button type="button" class="inline-block ml-1 text-cyan-600 hover:text-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" @click="copy(profile.uid)">
            <Clipboard class="size-4" />
            <span v-if="copySuccess" class="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded -mt-8 ml-2">コピーしました</span>
          </button>
        </div>
      </div>
      <button type="button" :disabled="logoutProcessing" class="block w-full rounded bg-cyan-600 px-3 py-3 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed" @click="logout">
        ログアウト
      </button>
    </div>
  </div>
</div>
</template>
  
<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { Clipboard } from "lucide-vue-next";
import type { Profile } from "~/schemas";

definePageMeta({
	middleware: ["auth"],
});

const config = useRuntimeConfig();
const auth = useAuth();
const clipboard = useClipboard();
const toast = useToast();

const profile = ref<Profile | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(true);
const copySuccess = ref(false);
const logoutProcessing = ref(false);

if (auth.isAuthed && auth.user) {
	try {
		profile.value = await $fetch<Profile>("/api/profile/", {
			baseURL: config.public.apiUrl,
			headers: {
				Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
			},
		});
	} catch (e) {
		console.error(e);
		error.value = "プロフィールの取得に失敗しました";
	} finally {
		isLoading.value = false;
	}
}

const copy = (str: string) => {
	if (str === "") {
		return;
	}

	clipboard.copy(str);

	copySuccess.value = true;
	setTimeout(() => {
		copySuccess.value = false;
	}, 2000);
};

const logout = async () => {
	logoutProcessing.value = true;
	try {
		await auth.logout();
		toast.success("ログアウトしました");
		navigateTo("/login");
	} catch (e) {
		console.error(e);
		toast.error("ログアウトに失敗しました");
		logoutProcessing.value = false;
	}
};
</script>
