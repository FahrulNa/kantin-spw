<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Pesanan', to: '/dashboard/order' }]" />

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-5">
      <UCard>

      </UCard>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})


</script>

<style scoped>

</style>