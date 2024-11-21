<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <div class="font-bold text-2xl">Keranjang<span v-if="cart.length" class="text-sm ms-2 text-gray-500"> ({{
      cart.length }} product<span v-if="cart.length > 1">s</span>)</span></div>
    <div class="grid grid-cols-3 gap-20">
      <div class="col-span-2">
        <UCard :ui="{ base: 'text-black', body: { base: 'flex flex-col gap-3' } }">
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
              <div class="flex flex-[.33] items-center gap-x-5">
                <NuxtImg v-if="product.fotoUrl" :src="product.fotoUrl" width="100" height="100"
                  class="border-4 rounded-xl" />
                <NuxtImg v-else src="img/img-placeholder.png" width="100" height="100" />
                <div class="font-bold text-xl">{{ product.nama }}</div>
              </div>
              <div class="flex flex-[.33] items-center gap-x-5">
                <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-minus-20-solid"
                  variant="outline" :ui="{ rounded: 'rounded-full' }" :disabled="product.order <= 1"
                  @click="orderProduct(product.id, -1)" />
                <div>{{ product.order }}</div>
                <UButton class="active:bg-green-700 active:text-white transition" icon="i-heroicons-plus-20-solid"
                  variant="outline" :ui="{ rounded: 'rounded-full' }" :disabled="product.order >= product.sisa"
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
      <div class="col-span-1">
        <UCard>
          <div>Total Belanja</div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

const { cart, addToCart, removeFromCart } = useCart()
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
</script>

<style scoped></style>