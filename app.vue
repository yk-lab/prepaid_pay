<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
import "notyf/notyf.min.css";

useHead({
	bodyAttrs: {
		class: "bg-gray-50 font-sans antialiased text-gray-900",
	},
});
</script>
