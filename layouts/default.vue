<template>
  <div class="flex flex-col h-screen overflow-x-hidden overflow-y-scroll">
    <MainHeader @open-navbar="navbar = true">
      <ClientOnly>
        <CartPopover />
      </ClientOnly>
      <UButton v-if="user" to="/dashboard" icon="i-heroicons-user-circle" variant="ghost" color="black" size="xl"
        :padded="false" />
      <UButton v-else to="/login" color="white" :ui="{ rounded: 'rounded-full' }" class="px-10 py-2 font-bold">Login
      </UButton>
    </MainHeader>
    <div class="container h-full mx-auto px-4 py-5">
      <slot />
    </div>
    <USlideover v-model="navbar" side="left" :ui="{ background: 'bg-[#3F3F3F]' }">
      <div class="p-4 flex-1 text-white">
        <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="navbar = false" />
        <UVerticalNavigation :links="links" :ui="{
          width: 'w-fit',
          active: '',
          inactive: ''
        }">
          <template #default="{ link }">
            <span class="group text-white font-bold text-xl relative flex flex-wrap items-center gap-x-2">
              <span class="flex-grow flex flex-col">
                <span>{{ link.label }}</span>
                <span
                  class="flex-grow max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white"></span>
              </span>
              <UIcon name="i-heroicons-chevron-right"
                class="transition-transform group-hover:translate-x-7 duration-500 ease-out flex-grow" />
            </span>
          </template>
        </UVerticalNavigation>
      </div>
    </USlideover>
  </div>
</template>

<script setup>
const user = useSupabaseUser()

const navbar = ref(false)

const links = [
  {
    label: 'Home',
    to: '/',
    click: () => navbar.value = false
  },
  {
    label: 'Katalog',
    to: '/produk',
    click: () => navbar.value = false
  },
  {
    label: 'Keranjang',
    to: '/cart',
    click: () => navbar.value = false
  },
  {
    label: 'Pesanan Saya',
    to: '/order',
    click: () => navbar.value = false
  }
]
</script>

<style scoped></style>