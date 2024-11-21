<template>
  <aside class="h-full bg-[#3E3E3E] text-white flex-[0.12] flex-col">
    <UVerticalNavigation :links="links" :ui="{ inactive: 'text-white' }">
      <template #icon="{ link }">
        <UIcon v-if="link.type" :name="types[link.type].icon" :class="types[link.type].color" class="size-5" />
      </template>
    </UVerticalNavigation>
    <div v-if="status == 'error'" class="text-red-500">{{ error.message }}</div>
  </aside>
</template>

<script setup>
const supabase = useSupabaseClient()

const { execute: logout, status, error } = useAsyncData('logout', async () => {
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw 'Logout gagal'
  else {
    navigateTo('/')
  }
}, {
  immediate: false
})

const types = {
  logout: {
    icon: 'i-tabler-logout-2',
    color: 'text-red-500'
  }
}
const links = [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      to: '/dashboard'
    },
    {
      label: 'Kelola Siswa',
      to: '/dashboard/siswa'
    },
    {
      label: 'Kelola Kelompok',
      to: '/dashboard/kelompok'
    }, 
    {
      label: 'Kelola Guru',
      to: '/dashboard/guru'
    },
    {
      label: 'Kelola Produk',
      to: '/dashboard/produk'
    },
    {
      label: 'Jadwal',
      to: '/dashboard/jadwal'
    },
    {
      label: 'Pesanan',
      to: '/dashboard/order'
    },
    {
      label: 'Transaksi',
      to: '/dashboard/transaksi'
    }
  ],
  [
    {
      label: 'Logout',
      type: 'logout',
      click: () => logout(),
      disabled: status == 'pending'
    }
  ]
]
</script>

<style scoped></style>