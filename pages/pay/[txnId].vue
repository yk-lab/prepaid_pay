<template>
<div v-if="txn">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <div class="px-4 py-5 sm:p-6 text-center">
        <div class="text-gray-900 text-sm">金額</div>
        <div class="text-gray-900 text-xl font-semibold">
          {{ txn.amount }}<span class="text-sm text-gray-600 ml-0.5">円</span>
        </div>
        <div v-if="txn.status === 'pending'" class="mt-2">
          <button v-if="checkBalance" type="button" class="block w-full rounded bg-cyan-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600" @click="pay">支払う</button>
          <p v-else class="text-center text-red-600 font-semibold">残高が不足しています</p>
        </div>
        <div v-else-if="txn.status === 'completed'" class="mt-2">
          <p class="text-center text-green-600 font-semibold">支払いが完了しました</p>
		  <NuxtLink :to="{'name': 'index'}" class="mt-2 block w-full rounded bg-cyan-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">トップページへ戻る</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { asyncComputed } from "@vueuse/core";
import type { Profile, Transaction } from "~/schemas";

definePageMeta({
	middleware: ["auth"],
});

const config = useRuntimeConfig();
const auth = useAuth();
const route = useRoute();

const txnId = ref(route.params.txnId);
const txn = ref<Transaction | null>(null);
const isProcessing = ref(false);

txn.value = await $fetch<Transaction>(`/api/prepaid/pay/${txnId.value}/`, {
	baseURL: config.public.apiUrl,
	method: "GET",
	headers: {
		Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
	},
}).catch((error) => {
	console.error("トランザクション情報の取得に失敗しました:", error);
	alert("トランザクション情報の取得に失敗しました");
	navigateTo("/");
	return null;
});

// 残高が不足していないか確認
const checkBalance = asyncComputed(async () => {
	if (!txn.value) return false;

	const profile = await $fetch<Profile>("/api/profile/", {
		baseURL: config.public.apiUrl,
		headers: {
			Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
		},
	});
	return profile.balance >= txn.value.amount;
});

const pay = async () => {
	if (isProcessing.value) return;
	isProcessing.value = true;

	try {
		const txn = await $fetch<Transaction>(`/api/prepaid/pay/${txnId.value}/`, {
			baseURL: config.public.apiUrl,
			method: "POST",
			headers: {
				Authorization: `Bearer ${await auth.user.value?.getIdToken()}`,
			},
		});
		if (txn.status === "completed") {
			alert("支払いが完了しました");
		} else {
			alert("支払いに失敗しました");
		}
		location.reload();
	} catch (e) {
		console.error(e);
		alert(
			"支払い処理中にエラーが発生しました。時間をおいて再度お試しください。",
		);
	} finally {
		isProcessing.value = false;
	}
};
</script>
