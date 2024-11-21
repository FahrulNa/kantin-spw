<template>
  <div class="flex flex-col flex-grow gap-y-10">
    <div class="w-full flex justify-between gap-3">
      <div class="flex-[.5]">
        <UInput v-model="searchQuery" placeholder="Cari nama produk..." icon="heroicons:magnifying-glass-20-solid" />
      </div>
      <div class="flex justify-center gap-x-5">
        <UButton :variant="activeButtonJurusan('PPLG')" color="green" class="rounded-full"
          @click="selectJurusan('PPLG')" label="PPLG" />
        <UButton :variant="activeButtonJurusan('TJKT')" color="blue" class="rounded-full" @click="selectJurusan('TJKT')"
          label="TJKT" />
        <UButton :variant="activeButtonJurusan('TSM')" color="red" class="rounded-full" @click="selectJurusan('TSM')"
          label="TSM" />
        <UButton :variant="activeButtonJurusan('DKV')" color="orange" class="rounded-full" @click="selectJurusan('DKV')"
          label="DKV" />
        <UButton :variant="activeButtonJurusan('TOI')" color="gray" class="rounded-full" @click="selectJurusan('TOI')"
          label="TOI" />
      </div>
    </div>
    <div v-if="status == 'pending' || status == 'error'">
      <div v-if="status == 'pending'">
        Loading...
      </div>

      <div v-if="status == 'error'">
        {{ error.message }}
      </div>
    </div>
    <div v-else class="min-h-full grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
      <div v-for="product in filteredProducts" :key="product.id">
        <UCard class="h-full shadow-lg hover:scale-105 duration-300" :class="borderClass(product.kelompok.kelas.nama)"
          :ui="{ body: { base: 'h-full grid grid-flow-col grid-cols-2 grid-rows-2 gap-5 relative' } }">
          <div class="flex flex-col">
            <div class="font-bold text-xl">{{ product.nama }}</div>
            <div class="font-semibold text-lg text-green-500">{{ rupiah(product.harga) }}</div>
            <div class="text-sm">Stok: {{ product.sisa }}</div>
          </div>
          <div v-if="product.order > 0" class="flex items-end me-5">
            <div class="flex items-center gap-x-5">
              <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-minus-20-solid"
                variant="outline" :ui="{ rounded: 'rounded-full' }" @click="orderProduct(product.id, -1)" />
              <div>{{ product.order }}</div>
              <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-plus-20-solid"
                variant="outline" :ui="{ rounded: 'rounded-full' }" :disabled="product.order >= product.sisa"
                @click="orderProduct(product.id, 1)" />
            </div>
          </div>
          <div v-else class="flex items-end me-5">
            <UButton class="w-full justify-center rounded-full active:bg-green-700 active:text-white transition"
              variant="outline" color="emerald" label="+ Keranjang" @click="orderProduct(product.id, 1)" />
          </div>
          <div class="row-span-2 flex justify-center items-center">
            <NuxtImg v-if="product.fotoUrl" :src="product.fotoUrl" width="300" height="300" />
            <NuxtImg v-else src="img/img-placeholder.png" width="300" height="300" />
          </div>
          <UTooltip class="absolute top-1 end-1" :ui="{}" :popper="{ arrow: true, placement: 'top-end' }">
            <UIcon name="i-tabler-info-circle" class="w-5 h-5" />
            <template #text>
              <div v-if="product.kelompok" class="text-sm">
                <span class="text-gray-400">{{ product.kelompok.nama }}</span> / <span class="text-gray-600">{{
                  product.kelompok.kelas.nama }}</span>
              </div>
            </template>
          </UTooltip>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

const { cart, addToCart, removeFromCart } = useCart()

const borderClass = (kelas) => {
  return {
    'border border-green-500 shadow-green-500': (kelas.includes('PPLG')),
    'border border-blue-500 shadow-blue-500': (kelas.includes('TJKT')),
    'border border-red-500 shadow-red-500': (kelas.includes('TSM')),
    'border border-orange-500 shadow-orange-500': (kelas.includes('DKV')),
    'border border-gray-500 shadow-gray-500': (kelas.includes('TOI'))
  }
}

const { data: products, status, error, refresh } = useLazyAsyncData('products', async () => {
  try {
    let { data, error } = await supabase.from('produk').select(`
      *,
      kelompok (
        id, nama,
        kelas (
          id, nama
        )
      )
    `).order('foto')
    if (error) throw error
    if (data) {
      data = data.map(data => {
        const { data: url } = supabase.storage.from('produk').getPublicUrl(data.foto)
        const cartItem = cart.value.find(order => order.produk === data.id)

        return {
          ...data,
          fotoUrl: data.foto ? url.publicUrl : null,
          order: cartItem ? cartItem.jumlah : 0
        }
      })
    }
    return data
  } catch (error) {
    console.error(error)
    return
  }
})


const channel = supabase.channel('product-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'produk' },
    async (payload) => {
      console.log('Change received!', payload.new)
      switch (payload.eventType) {
        case 'INSERT':
          const { data: newProduct, error } = await supabase.from('produk').select(`
            *,
            kelompok (
              id, nama,
              kelas (
                id, nama
              )
            )
          `).eq('id', payload.new.id).maybeSingle()
          if (error) throw error
          console.log(newProduct)
          products.value.push(newProduct)
          console.log(products.value)
          break
        case 'UPDATE':
          const product = products.value.find(product => product.id === payload.new.id)
          if (product) {
            const { data: newProduct, error } = await supabase.from('produk').select(`
              *,
              kelompok (
                id, nama,
                kelas (
                  id, nama
                )
              )
            `).eq('id', payload.new.id).maybeSingle()
            if (error) throw error
            Object.assign(product, newProduct)
          }
          break
        case 'DELETE':
          const index = products.value.findIndex(product => product.id === payload.old.id)
          if (index !== -1) products.value.splice(index, 1)
          break
      }
    }
  )
  .subscribe()

const availableProducts = computed(() => products.value.filter(product => product.is_available))

const searchQuery = ref('')
const selectedJurusan = ref('')
const selectJurusan = jurusan => selectedJurusan.value === jurusan ? selectedJurusan.value = '' : selectedJurusan.value = jurusan
const activeButtonJurusan = jurusan => selectedJurusan.value === jurusan ? 'solid' : 'outline'

const filteredProducts = computed(() => {
  const filtered = availableProducts.value.filter((product) => {
    const filterName = product.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    const filterMajor = selectedJurusan.value ? product.kelompok.kelas.nama.includes(selectedJurusan.value) : true

    return filterName && filterMajor
  })

  return filtered
})

const orderProduct = (productId, amount) => {
  const product = products.value.find(product => product.id === productId)
  if (!product) return

  const newAmount = Math.max(0, Math.min(product.order + amount, product.sisa))
  product.order = newAmount

  if (newAmount === 0) removeFromCart(productId)
  else addToCart(productId, newAmount)
}

onUnmounted(() => {
  channel?.unsubscribe()
})
</script>

<style scoped></style>