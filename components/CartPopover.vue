<template>
  <UPopover mode="hover" :popper="{ placement: 'bottom-end' }">
    <UChip color="red" size="xl" :text="cart.length" :show="cart.length > 0">
      <UButton icon="i-heroicons-shopping-cart" variant="ghost" color="black" :padded="false" />
    </UChip>

    <template #panel>
      <UCard :ui="{ base: 'text-black', body: { base: 'flex flex-col gap-3' } }">
        <template #header>
          <div class="font-bold text-lg">Keranjang<span v-if="cart.length"> ({{ cart.length }})</span></div>
        </template>
        <div v-if="!cart.length" class="text-xl font-semibold">Keranjang belanjamu kosong</div>
        <div v-for="product in orderedProducts" class="flex justify-between items-center gap-5">
          <NuxtImg v-if="product.fotoUrl" :src="product.fotoUrl" width="100" height="100" />
          <NuxtImg v-else src="img/img-placeholder.png" width="100" height="100" />
          <div>{{ product.nama }}</div>
          <div class="font-semibold">{{ product.jumlah }} x {{ rupiah(product.harga) }}</div>
          <UButton icon="i-heroicons-x-mark-20-solid" color="red" size="xl" variant="ghost" :padded="false" @click="removeOrder(product.id)" />
        </div>
      </UCard>
    </template>
  </UPopover>
</template>

<script setup>
const supabase = useSupabaseClient()

const { cart, removeFromCart } = useCart()
const { data: products } = useAsyncData('cartProducts', async () => {
  try {
    let { data, error } = await supabase.from('produk').select('id, nama, harga, foto')
    if (error) throw error
    if (data) {
      data = data.map(data => {
        const { data: url } = supabase.storage.from('produk').getPublicUrl(data.foto)
  
        return {
          ...data,
          fotoUrl: url.publicUrl ?? null
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
</script>

<style scoped></style>