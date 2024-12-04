<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <div class="grid grid-cols-4 grid-rows-2 lg:grid-cols-3 lg:grid-rows-1 gap-x-20 gap-y-10">
      <div class="col-span-full lg:col-span-2">
        <UCard :ui="{ base: 'text-black', body: { base: 'flex flex-col gap-3' } }">
          <template #header>
            <div class="flex justify-between">
              <div class="font-bold text-2xl">Keranjang<span v-if="cart.length" class="text-sm ms-2 text-gray-500"> ({{
                cart.length }} product<span v-if="cart.length > 1">s</span>)</span></div>
              <UButton icon="i-heroicons-x-mark-16-solid" color="red" variant="ghost" label="CLEAR CART"
                class="font-bold ps-1 pe-2" @click="clearCart" />
            </div>
          </template>
          <div v-if="!cart.length" class="flex flex-col gap-3 justify-center items-center">
            <div class="text-xl font-semibold">Keranjang belanjamu kosong</div>
            <UButton to="/produk" label="Mulai Belanja" color="green" size="lg" :ui="{ font: 'font-bold' }" />
          </div>
          <div v-else class="flex flex-col gap-3">
            <div class="flex justify-between items-center gap-5 font-bold text-lg">
              <div class="flex-[.33]">Products</div>
              <div class="flex-[.33]">Quantity</div>
              <div class="flex-[.33]">Price</div>
              <div></div>
            </div>
            <div v-for="product in orderedProducts"
              class="flex justify-between items-center gap-5 p-3 border-4 border-amber-300 rounded-3xl">
              <div
                class="flex flex-[.33] flex-wrap xl:flex-nowrap justify-center xl:justify-start items-center gap-x-5 gap-y-2">
                <NuxtImg v-if="product.fotoUrl" :src="product.fotoUrl" width="100" height="100"
                  class="border-4 rounded-xl" />
                <NuxtImg v-else src="img/img-placeholder.png" width="100" height="100" />
                <div class="font-bold text-lg">{{ product.nama }}</div>
              </div>
              <div class="flex flex-[.33] items-center gap-x-5">
                <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-minus-20-solid"
                  variant="outline" :ui="{ rounded: 'rounded-full' }" :disabled="product.jumlah <= 1"
                  @click="orderProduct(product.id, -1)" />
                <div>{{ product.jumlah }}</div>
                <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-plus-20-solid"
                  variant="outline" :ui="{ rounded: 'rounded-full' }" :disabled="product.jumlah >= product.sisa"
                  @click="orderProduct(product.id, 1)" />
              </div>
              <div class="flex-[.33] font-semibold">{{ rupiah(product.harga) }}</div>
              <div>
                <UButton icon="i-heroicons-x-mark-20-solid" color="red" size="xl" variant="ghost" :padded="false"
                  @click="removeOrder(product.id)" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <div class="col-start-2 col-span-2 lg:col-span-1">
        <UCard>
          <template #header>
            <div class="text-xl font-bold">Ringkasan Belanja</div>
          </template>
          <div v-if="orderedProducts?.length > 0" class="flex flex-col gap-y-10 text-lg">
            <div class="flex flex-col gap-y-3">
              <div class="flex flex-col border-b-2 border-black">
                <div v-for="product in orderedProducts" class="flex justify-between">
                  <div>{{ product.nama }}</div>
                  <div class="font-medium">{{ rupiah(product.harga * product.jumlah) }}</div>
                </div>
                <div v-if="selectedOrderMethod === 'Delivery'" class="flex justify-between">
                  <div>Biaya Delivery</div>
                  <div>{{ rupiah(deliveryFee) }}</div>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div>Total</div>
                <div class="font-bold text-xl">{{ rupiah(totalPrice + deliveryFee) }}</div>
              </div>
            </div>
            <div class="flex flex-col gap-y-3">
              <div class="font-semibold">Metode Pemesanan</div>
              <div>
                <URadioGroup v-model="selectedOrderMethod" legend="Pilih metode pemesanan yang kamu inginkan"
                  :options="orderOptions">
                  <template #label="{ option }">
                    <div class="flex items-center gap-x-1">
                      <UIcon :name="option.icon" />
                      <p>{{ option.label }}</p>
                    </div>
                  </template>
                </URadioGroup>
              </div>
              <div v-if="selectedOrderMethod === 'Delivery'" class="flex flex-col gap-y-2">
                <div class="text-sm text-gray-700">Ingin diantarkan ke mana?</div>
                <USelectMenu v-model="selectedDeliveryLocation" :options="deliveryLocations" option-attribute="nama"
                  value-attribute="id" searchable />
              </div>
            </div>
          </div>
          <template #footer>
            <div class="flex flex-col">
              <UButton color="amber"
                class="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 transition justify-center text-lg font-bold"
                label="Pesan Sekarang"
                :disabled="orderedProducts?.length < 1 || !selectedOrderMethod || (selectedOrderMethod === 'Delivery' && !selectedDeliveryLocation)"
                :loading="status === 'pending'" @click="openOrderModal" />
              <div v-if="status === 'error'">{{ error.message }}</div>
            </div>
          </template>
        </UCard>
      </div>
    </div>

    <UModal v-model="orderModal">
      <UCard>
        <template #header>
          <div class="font-bold text-lg">Konfirmasi Pemesanan</div>
        </template>
        <div>
          Apakah Anda yakin ingin melakukan pemesanan ini? Periksa pesanan Anda sebelum melanjutkan.
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="gray" class="flex flex-grow justify-center items-center h-[38px]" label="Batal"
              @click="closeOrderModal" />
            <UButton color="amber" variant="outline" label="Konfirmasi"
              class="flex flex-grow justify-center items-center h-[38px] hover:bg-amber-500 hover:text-white transition"
              @click="insertOrder" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const toast = useToast()

const { cart, addToCart, removeFromCart, clearCart } = useCart()
const { data: products } = useAsyncData('cartProducts', async () => {
  try {
    let { data, error } = await supabase.from('produk').select('id, nama, sisa, harga, foto')
    if (error) throw error
    if (data) {
      data = data.map(data => {
        const { data: url } = supabase.storage.from('produk').getPublicUrl(data.foto)
        const cartItem = cart.value.find(order => order.produk === data.id)

        return {
          ...data,
          fotoUrl: url.publicUrl ?? null,
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

const orderedProducts = computed(() => {
  return cart.value.map(order => {
    const product = products.value.find(product => product.id === order.produk)
    if (!product) return null

    return {
      ...product,
      jumlah: order.jumlah
    }
  }).filter(Boolean)
})

const totalPrice = computed(() => {
  return orderedProducts.value.reduce((total, { harga, jumlah }) => total + harga * jumlah, 0)
})

const removeOrder = (productId) => {
  removeFromCart(productId)
  refreshNuxtData('products')
}

const orderProduct = (productId, amount) => {
  const product = products.value.find(product => product.id === productId)
  if (!product) return

  const newAmount = Math.max(0, Math.min(product.order + amount, product.sisa))
  product.order = newAmount

  if (newAmount === 0) removeFromCart(productId)
  else addToCart(productId, newAmount)
}

const selectedOrderMethod = ref('')
const orderOptions = [
  {
    value: 'Walk Thru',
    label: 'Walk Thru',
    icon: 'i-tabler-walk',

  },
  {
    value: 'Delivery',
    label: 'Delivery',
    icon: 'i-tabler-truck-delivery'
  }
]

const selectedDeliveryLocation = ref(null)
const { data: deliveryLocations } = useAsyncData('deliveryLocations', async () => {
  const { data, error } = await supabase.from('lokasi').select('id, nama')
  if (error) throw error
  return data
})
const deliveryFee = computed(() => selectedOrderMethod.value === 'Delivery' ? 1000 : 0)

const orderModal = ref(false)
const openOrderModal = () => orderModal.value = true
const closeOrderModal = () => orderModal.value = false

const { execute: insertOrder, status, error } = useAsyncData('insertOrder', async () => {
  const { data: order, error: orderError } = await supabase.from('pemesanan').insert({
    metode: selectedOrderMethod.value,
    lokasi: selectedOrderMethod.value === 'Delivery' ? selectedDeliveryLocation.value : null
  }).select().maybeSingle()
  if (orderError) {
    toast.add({ title: 'Terjadi kesalahan', description: orderError.message, timeout: 2000 })
    throw orderError
  }
  const productOrders = orderedProducts.value.map((product) => {
    return {
      id_pemesanan: order.id,
      id_produk: product.id,
      jumlah: product.jumlah
    }
  })
  const { error } = await supabase.from('pemesanan_produk').insert(productOrders)
  if (error) {
    toast.add({ title: 'Terjadi kesalahan', description: error.message, timeout: 2000 })
    throw error
  }
  clearCart()
  toast.add({ title: 'Pemesanan berhasil dilakukan', timeout: 2000 })
}, {
  immediate: false
})

watch(selectedOrderMethod, (newMethod) => {
  if (newMethod === 'Walk Thru') selectedDeliveryLocation.value = null
})
</script>

<style scoped></style>