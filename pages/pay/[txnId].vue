<template>
<div v-if="txn">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <div class="px-4 py-5 sm:p-6 text-center">
        <div class="text-gray-900 text-sm">金額</div>
        <div class="text-gray-900 text-xl font-semibold" :aria-label="`支払い金額 ${txn.amount}円`">
          {{ txn.amount }}<span class="text-sm text-gray-600 ml-0.5">円</span>
        </div>
        <div v-if="txn.status === 'pending'" class="mt-2">
          <template v-if="checkBalance !== null">
            <button
              v-if="checkBalance"
              type="button"
              :disabled="isProcessing"
			  :aria-busy="isProcessing"
              class="block w-full rounded bg-cyan-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="pay"
			  aria-label="支払いを実行する"
			  role="button"
			>
              {{ isProcessing ? '処理中...' : '支払う' }}
            </button>
            <p v-else class="text-center text-red-600 font-semibold" role="alert">残高が不足しています</p>
          </template>
        </div>
        <div v-else-if="txn.status === 'completed'" class="mt-2">
          <p class="text-center text-green-600 font-semibold">支払いが完了しました</p>
          <NuxtLink :to="{'name': 'index'}" class="mt-2 block w-full rounded bg-cyan-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">トップページへ戻る</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</div>
<div v-else class="sm:mx-auto sm:w-full sm:max-w-sm">
  <div class="animate-pulse space-y-4">
    <div class="h-20 bg-gray-200 rounded"></div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { asyncComputed } from "@vueuse/core";
import { FetchError } from "ofetch";
import type { Profile, Transaction } from "~/schemas";

definePageMeta({
	middleware: ["auth"],
});

const MAX_RETRIES = 3;

const config = useRuntimeConfig();
const auth = useAuth();
const route = useRoute();
const toast = useToast();

const txnId = ref<string>(route.params.txnId as string);
const txn = ref<Transaction | null>(null);
const isProcessing = ref(false);

const fetchTransaction = async (retryCount = 0) => {
	try {
		return await $fetch<Transaction>(`/api/prepaid/pay/${txnId.value}/`, {
			baseURL: config.public.apiUrl,
			method: "GET",
			headers: {
				Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
			},
		});
	} catch (error) {
		if (retryCount < MAX_RETRIES) {
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 * (retryCount + 1)),
			);
			return fetchTransaction(retryCount + 1);
		}
		throw error;
	}
};

txn.value = await fetchTransaction().catch((e) => {
	console.error(e);

	const message =
		e.status === 404
			? "取引が見つかりませんでした。URLを確認してください。"
			: e.status === 401
				? "認証の有効期限が切れています。再度ログインしてください。"
				: "取引情報の取得に失敗しました。時間をおいて再度お試しください。";
	toast.error(message);

	return null;
});

// 残高が不足していないか確認
const checkBalance = asyncComputed(async () => {
	if (!txn.value) return false;

	try {
		const profile = await $fetch<Profile>("/api/profile/", {
			baseURL: config.public.apiUrl,
			headers: {
				Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
			},
		});
		return profile.balance >= txn.value.amount;
	} catch (e) {
		console.error("Profile fetch failed:", e);
		if (e instanceof FetchError) {
			if (e.status === 401) {
				toast.error("認証の有効期限が切れています。再度ログインしてください。");
				await navigateTo("/login");
			} else {
				toast.error(
					"残高の確認に失敗しました。時間をおいて再度お試しください。",
				);
			}
		}
		return false;
	}
});

const pay = async () => {
	if (isProcessing.value) return;
	isProcessing.value = true;

	try {
		const _txn = await $fetch<Transaction>(`/api/prepaid/pay/${txnId.value}/`, {
			baseURL: config.public.apiUrl,
			method: "POST",
			headers: {
				Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
			},
		});
		if (_txn.status === "completed") {
			toast.success("支払いが完了しました");
		} else {
			toast.error(
				"支払い処理が完了できませんでした。繰り返し表示される場合は、お問い合わせください。",
			);
		}
		txn.value = _txn;
	} catch (e) {
		console.error(e);
		const baseMessage =
			"支払い処理中にエラーが発生しました。時間をおいて再度お試しください。";

		const getMessage = (e: unknown): string => {
			if (e instanceof FetchError) {
				const statusMessages = {
					400: "残高が不足しています。",
					401: "認証の有効期限が切れています。再度ログインしてください。",
					404: "取引情報が見つかりません。",
					500: "サーバーエラーが発生しました。",
				} as Record<number, string>;
				return (e.status && statusMessages?.[e.status]) || baseMessage;
			}

			if (e instanceof Error) {
				return `${baseMessage} (${e.message})`;
			}

			if (typeof e === "string") {
				return e;
			}

			return baseMessage;
		};

		toast.error(e instanceof Error ? getMessage(e) : baseMessage);
	} finally {
		isProcessing.value = false;
	}
};
</script>
