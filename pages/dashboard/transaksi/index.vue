<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Transaksi', to: '/dashboard/transaksi' }]" />
    <div>
      <UButton icon="i-heroicons-clipboard-document-list-16-solid" color="gray" variant="link"
        to="/dashboard/transaksi/riwayat">Lihat
        Riwayat Transaksi</UButton>
    </div>
    <div v-if="status == 'error'">
      {{ error.message }}
    </div>
    <div v-else>
      <UTable :rows="products" :columns="columns" :loading="status == 'pending'">
        <template #no-data="{ index }">
          <div>{{ (page - 1) * pageCount + index + 1 }}</div>
        </template>
        <template #nama-data="{ row: { nama, fotoUrl } }">
          <div class="flex items-center gap-5">
            <NuxtImg :src="fotoUrl" width="30" height="30" />
            <div>{{ nama }}</div>
          </div>
        </template>
        <template #harga-data="{ row: { harga } }">
          {{ rupiah(harga) }}
        </template>
        <template #terjual-data="{ row: { banyak, sisa } }">
          {{ banyak - sisa }}
        </template>
        <template #actions-data="{ row: { id, buyAmount, sisa } }">
          <div class="flex items-center gap-3">
            <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-minus-20-solid"
              variant="outline" size="2xs" :ui="{ rounded: 'rounded-full' }" :disabled="buyAmount < 1"
              @click="recordTransaction(id, -1)" />
            <div class="w-4 text-center">{{ buyAmount }}</div>
            <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-plus-20-solid"
              variant="outline" size="2xs" :ui="{ rounded: 'rounded-full' }" :disabled="buyAmount >= sisa"
              @click="recordTransaction(id, 1)" />
          </div>
        </template>
      </UTable>

      <div class="flex justify-center">
        <UButton class="hover:scale-110 transition" icon="i-heroicons-pencil-solid" color="amber" label="Catat"
          :disabled="!selectedProducts.length" @click="openRecordModal" />
      </div>
    </div>

    <UModal v-model="recordModal">
      <UCard>
        <template #header>
          <h3 class="text-center font-bold">Catat Pembelian Produk Ini?</h3>
        </template>
        <div v-if="selectedProducts.length" class="px-3">
          <ol class="list-disc">
            <li v-for="product in selectedProducts" :key="product.id">{{ product.nama }} ({{ product.buyAmount }})</li>
          </ol>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]" @click="closeRecordModal">
              Cancel</UButton>
            <UButton color="amber" :loading="recordLoading" class="flex flex-grow items-center justify-center h-[38px]"
              @click="insertTransactionRecord">
              Catat</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const { data: userData } = await useAsyncData('userData', async () => {
  const { data, error } = await supabase.from('users').select('nama, role').eq('id', user.value.id).maybeSingle()
  if (error) throw error
  return data
})

const { data: products, status, error, refresh } = useLazyAsyncData('products', async () => {
  try {
    let { data, error } = await supabase.from('produk').select(`
      id, nama, banyak, sisa, harga, foto,
      kelompok!inner (
        id, nama,
        kelas!inner (
          nama
        )
      )
    `).eq('kelompok.kelas.nama', userData.value.nama).order('foto', { ascending: false })
    if (error) throw error
    if (data) {
      data = data.map(data => {
        const { data: url } = supabase.storage.from('produk').getPublicUrl(data.foto)
        return {
          ...data,
          fotoUrl: data.foto ? url.publicUrl : null,
          buyAmount: 0
        }
      })
    }
    return data
  } catch (error) {
    console.error(error)
    return
  }
})

const recordTransaction = (productId, amount) => {
  const product = products.value.find(product => product.id === productId)
  if (!product) return

  const newAmount = Math.max(0, Math.min(product.buyAmount + amount, product.sisa))
  product.buyAmount = newAmount
}

const recordModal = ref(false)
const openRecordModal = () => recordModal.value = true
const closeRecordModal = () => recordModal.value = false

const selectedProducts = computed(() => {
  return products.value.filter(product => product.buyAmount > 0)
})

const recordLoading = ref(false)
const { execute: insertTransactionRecord, status: insertStatus, error: insertError } = useAsyncData('insertTransactionRecord', async () => {
  try {
    recordLoading.value = true
    const products = selectedProducts.value.map(product => {
      return {
        produk: product.id,
        jumlah: product.buyAmount
      }
    })
    const { error } = await supabase.from('transaksi').insert(products)
    if (error) throw error
    closeRecordModal()
    refresh()
    toast.add({ title: 'Transaksi berhasil dilakukan', timeout: 2000 })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Gagal melakukan transaksi', timeout: 2000 })
  } finally {
    recordLoading.value = false
  }
}, {
  immediate: false
})

const columns = [
  {
    key: 'no',
    label: 'No'
  },
  {
    key: 'kelompok.nama',
    label: 'Kelompok'
  },
  {
    key: 'kelompok.kelas.nama',
    label: 'Kelas'
  },
  {
    key: 'nama',
    label: 'Nama Barang'
  },
  {
    key: 'banyak',
    label: 'Banyak'
  },
  {
    key: 'harga',
    label: 'Harga Jual'
  },
  {
    key: 'terjual',
    label: 'Terjual'
  },
  {
    key: 'sisa',
    label: 'Sisa Barang'
  },
  {
    key: 'actions',
    label: 'Catat'
  }
]

const page = ref(1)
const pageCount = ref(10)
</script>

<style scoped></style>