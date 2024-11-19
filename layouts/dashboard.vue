<template>
  <div class="flex h-screen">
    <div class="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader />
      <div class="flex h-full">
        <DashboardSidebar />
        <div class="flex-1 overflow-x-hidden overflow-y-auto">
          <div class="container min-h-full flex mx-auto px-4 pt-10 pb-20">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped></style>