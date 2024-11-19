<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/" :links="[
      { label: 'Dashboard', to: '/dashboard' }, 
      { label: 'Transaksi', to: '/dashboard/transaksi' }, 
      { label: 'Riwayat Transaksi', to: '/dashboard/transaksi/riwayat' }
      ]" />

    <div v-if="status === 'pending' || status === 'error'">
      <div v-if="status === 'pending'">Loading...</div>
      <div v-if="status === 'error'">{{ error }}</div>
    </div>
    <div v-else>
      <UTable :rows="transactions" :columns="columns" class="w-full border rounded-lg">
        <template #no-data="{ index }">
          {{ index + 1 }}
        </template>
        <template #waktu-data="{ row: { created_at: time } }">
          {{ new Date(time).toISOString().replace('T', ' ').slice(0, 19) }}
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const { data: transactions, status, error } = useLazyAsyncData('transactions', async () => {
  const { data, error } = await supabase.from('transaksi').select(`
    id, created_at, jumlah,
    produk (
      id, nama,
      kelompok (
        id, nama,
        kelas (
          id, nama
        )
      )
    )
  `)
  if (error) throw error
  return data
})

const columns = [
  {
    key: 'no',
    label: 'No'
  },
  {
    key: 'waktu',
    label: 'Tanggal / Waktu'
  },
  {
    key: 'produk.kelompok.nama',
    label: 'Kelompok'
  },
  {
    key: 'produk.kelompok.kelas.nama',
    label: 'Kelas'
  },
  {
    key: 'produk.nama',
    label: 'Nama Barang'
  },
  {
    key: 'jumlah',
    label: 'Jumlah'
  }
]
</script>

<style scoped></style>