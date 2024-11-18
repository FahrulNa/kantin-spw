<template>
  <div class="flex px-6 py-3">
    <header class="bg-[#1E1E1E] text-white flex justify-between items-center flex-1 px-3 py-1 rounded-full">
      <div class="flex items-center gap-3">
        <UButton icon="i-tabler-menu-2" color="black" variant="ghost" @click="$emit('openNavbar')" />
        <NuxtLink to="/">
          <div class="font-bold text-lg">Kantin SPW</div>
        </NuxtLink>
      </div>
      <div class="flex gap-3 items-end">
        <slot />
      </div>
    </header>
  </div>
</template>

<script setup>

</script>

<style scoped>

</style>