<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/" :links="[
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Transaksi', to: '/dashboard/transaksi' },
      { label: 'Riwayat Transaksi', to: '/dashboard/transaksi/riwayat' }
    ]" />

    <div class="flex items-center gap-x-3.5 text-sm">
      <div>Dari Tanggal</div>
      <UInput type="date" v-model="fromDate" @change="refresh(); resetPage()" />
      <div>Sampai</div>
      <UInput type="date" v-model="toDate" @change="refresh(); resetPage()" />
    </div>
    <div v-if="status === 'error'" class="text-red-500">{{ error.message }}</div>
    <div v-else class="flex flex-col gap-y-5">
      <UTable :rows="paginatedTransactions" :columns="columns" :loading="status === 'pending'"
        class="w-full border rounded-lg">
        <template #no-data="{ index }">
          {{ (page - 1) * pageCount + index + 1 }}
        </template>
        <template #waktu-data="{ row: { created_at: time } }">
          {{ new Date(time).toLocaleString('id-ID') }}
        </template>
      </UTable>
      <div v-if="status === 'success' && transactions.length > 0"
        class="flex w-full px-3 py-3.5 justify-end border-t border-gray-200">
        <UPagination v-model="page" :page-count="pageCount" :total="transactions.length" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})


const supabase = useSupabaseClient()
const user = useSupabaseUser()

const fromDate = ref(new Date().toLocaleDateString('en-CA'))
const toDate = ref(new Date().toLocaleDateString('en-CA'))

const { data: userData } = await useAsyncData('userData', async () => {
  const { data, error } = await supabase.from('users').select('nama, role').eq('id', user.value.id).maybeSingle()
  if (error) throw error
  return data
})

const { data: transactions, status, error, refresh } = useLazyAsyncData('transactions', async () => {
  let query = supabase.from('transaksi').select(`
    id, created_at, jumlah,
    produk!inner (
      id, nama,
      kelompok!inner (
        id, nama,
        kelas!inner (
          id, nama
        )
      )
    )
  `).like('produk.kelompok.kelas.nama', `%${userData.value.nama.split(' ')[1]}%`).order('created_at')
  if (fromDate.value && toDate.value) {
    const start = new Date(new Date(fromDate.value).setHours(0, 0, 0, 0)).toISOString()
    const end = new Date(new Date(toDate.value).setHours(23, 59, 59, 999)).toISOString()
    query = query.gte('created_at', start).lte('created_at', end)
  }
  const { data, error } = await query
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
    label: 'Tanggal, Waktu'
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

const page = ref(1)
const pageCount = ref(10)
const resetPage = () => page.value = 1

const paginatedTransactions = computed(() => {
  return transactions.value?.slice((page.value - 1) * pageCount.value, page.value * pageCount.value)
})
</script>

<style scoped></style>