<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Jadwal', to: '/dashboard/jadwal' }]" />

    <div class="flex h-40 w-2/3 ml-60 mt-12">
      <UCard
        class="flex-1 flex justify-center items-center cursor-pointer hover:scale-105 duration-200 bg-gradient-to-br from-white to-gray-100 shadow-lg"
        @click="navigateTo('/dashboard/jadwal/siswa')">
        <div class="text-green-800 text-2xl font-bold">Jadwal Siswa</div>
      </UCard>
    </div>

    <div class="flex h-40 w-2/3 ml-60 mt-16">
      <UCard
        class="flex-1 flex justify-center items-center cursor-pointer hover:scale-105 duration-200 bg-gradient-to-br from-white to-gray-100 shadow-lg"
        @click="navigateTo('/dashboard/jadwal/guru')">
        <div class="text-green-800 text-2xl font-bold">Jadwal Guru</div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>


<style scoped></style>