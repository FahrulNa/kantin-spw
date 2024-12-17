<template>
  <div class="flex flex-col flex-grow gap-y-10">
    <div class="font-bold text-3xl text-center">
      Pesanan Saya
    </div>
    <div class="flex justify-between">
      <div class="flex items-center gap-x-3">
        <div class="text-medium text-lg">Status:</div>
        <UButton class="rounded-full" :variant="activeButton(selectedStatus, 'Semua')" color="black" label="Semua"
          @click="selectedStatus = 'Semua'" />
        <template v-for="{ id, status: orderStatus } in orderStatuses" :key="id">
          <UButton
            v-if="!(selectedMethod === 'Delivery' && orderStatus === 'Siap Diambil') && !(selectedMethod === 'Walk Thru' && orderStatus === 'Siap Diantar')"
            class="rounded-full" :variant="activeButton(selectedStatus, orderStatus)" color="black" :label="orderStatus"
            @click="selectedStatus = orderStatus" />
        </template>
      </div>
      <div class="flex items-center gap-x-3">
        <div class="text-medium text-lg">Metode:</div>
        <UButton class="rounded-full" :variant="activeButton(selectedMethod, 'Semua')" color="black" label="Semua"
          @click="selectedMethod = 'Semua'" />
        <UButton class="rounded-full" :variant="activeButton(selectedMethod, 'Delivery')" color="black" label="Delivery"
          @click="selectedMethod = 'Delivery'" />
        <UButton class="rounded-full" :variant="activeButton(selectedMethod, 'Walk Thru')" color="black"
          label="Walk Thru" @click="selectedMethod = 'Walk Thru'" />
      </div>
    </div>
    <div class="flex flex-col gap-y-10">
      <UCard v-for="order in filteredOrders" :key="order.id">
        <div class="flex justify-between mb-2">
          <div class="text-xs text-gray-700">{{ new Date(order.created_at).toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short'
          }) }}</div>
          <div class="flex items-center gap-x-2">
            <UIcon v-if="order.metode === 'Delivery'" name="i-tabler-truck-delivery" />
            <UIcon v-if="order.metode === 'Walk Thru'" name="i-tabler-walk" />
            <div class="text-xs text-gray-700">{{ order.metode }}</div>
          </div>
        </div>
        <div class="flex flex-col gap-y-3">
          <div v-for="({ jumlah, produk }, index) in order.pemesanan_produk" :key="index">
            <Transition name="slide-down-fade">
              <div v-if="order.showAllProducts || index === 0" class="flex gap-x-5">
                <NuxtImg :src="produk.fotoUrl" width="100" height="100" class="rounded-lg border-4 border-gray-300" />
                <div class="flex flex-grow flex-col justify-between">
                  <div class="flex flex-col">
                    <div class="text-lg font-medium">{{ produk.nama }}</div>
                    <div class="self-end text-gray-500 text-sm">x{{ jumlah }}</div>
                  </div>
                  <div class="self-end text-primary">{{ rupiah(produk.harga) }}</div>
                </div>
              </div>
            </Transition>
          </div>
          <Transition name="slide-down-fade">
            <div v-if="order.showAllProducts && order.metode === 'Delivery'"
              class="flex justify-end items-center gap-x-3">
              <div class="text-lg font-medium">Biaya Delivery :</div>
              <div class="text-primary">{{ rupiah(deliveryFee(order.metode)) }}</div>
            </div>
          </Transition>
        </div>
        <div class="flex justify-center">
          <UButton v-if="order.pemesanan_produk.length > 1"
            :trailing-icon="!order.showAllProducts ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
            color="black" variant="link" label="Lihat Semua" @click="order.showAllProducts = !order.showAllProducts" />
        </div>
        <div class="flex justify-between mt-3 border-t border-black">
          <div class="text-sm text-gray-500">{{ order.pemesanan_produk.reduce((total, { jumlah }) => total + jumlah, 0)
            }} produk</div>
          <div class="flex items-center gap-x-2">
            <div class="text-gray-700">Total Pembayaran :</div>
            <div class="text-primary text-lg font-semibold">{{ rupiah(order.pemesanan_produk.reduce((total, { jumlah,
              produk: { harga } }) => total + jumlah * harga, 0) + deliveryFee(order.metode)) }}</div>
          </div>
        </div>
        <div class="flex flex-col gap-y-2">
          <div v-for="({ waktu, status: { status: orderStatus } }, index) in [...order.status_pemesanan].reverse()"
            :key="index" class="flex">
            <Transition name="slide-down-fade">
              <div v-if="order.showAllStatuses || index === 0" class="flex gap-x-3">
                <div class="flex flex-col min-w-5 items-center">
                  <UButton v-if="orderStatus === 'Menunggu Konfirmasi' && order.status_pemesanan.length < 2" loading
                    variant="link" color="primary" :padded="false" class="cursor" disabled />
                  <UButton v-else-if="['Diterima', 'Selesai'].includes(orderStatus)"
                    icon="i-heroicons-check-badge-16-solid" variant="link" color="primary" :padded="false" disabled />
                  <UButton v-else-if="orderStatus === 'Siap Diambil'" icon="i-tabler-shopping-cart-up" variant="link"
                    color="yellow" :padded="false" disabled />
                  <UButton v-else-if="orderStatus === 'Siap Diantar'" icon="i-tabler-truck-delivery" variant="link"
                    color="yellow" :padded="false" disabled />
                  <UButton v-else-if="orderStatus === 'Dibatalkan'" icon="i-tabler-cancel" variant="link" color="red"
                    :padded="false" disabled />
                  <UButton v-else icon="i-tabler-circle-filled" variant="link" color="gray" :padded="false" disabled />
                  <div v-if="(index + 1) < order.status_pemesanan.length && order.showAllStatuses"
                    class="w-0.5 bg-gray-500 h-full" :class="{
                      'bg-primary': index === 0 && orderStatus !== 'Dibatalkan',
                      'bg-red-500': orderStatus === 'Dibatalkan',
                      'bg-yellow-500': ['Siap Diantar', 'Siap Diambil'].includes(orderStatus)
                    }">
                  </div>
                </div>
                <div class="flex flex-grow flex-col">
                  <div class="font-medium">{{ waktu.slice(0, 5) }}</div>
                  <div class="text-sm text-gray-600">{{ orderStatus }}</div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
        <div class="flex justify-center">
          <UButton v-if="order.status_pemesanan.length > 1"
            :trailing-icon="!order.showAllStatuses ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
            color="black" variant="link" label="Lihat Semua" @click="order.showAllStatuses = !order.showAllStatuses" />
        </div>
        <template #footer v-if="!(['Selesai', 'Dibatalkan'].includes(order.status_pemesanan.at(-1).status.status))">
          <div class="flex justify-end">
            <UButton color="red" icon="i-tabler-cancel" label="Batalkan" @click="openCancelModal(order.id)" />
          </div>
        </template>
      </UCard>
    </div>
    <div v-if="status === 'error'" class="text-red-500">{{ error.message }}</div>

    <UModal v-model="cancelModal">
      <UCard>
        <template #header>
          <div class="text-lg font-semibold">Konfirmasi Pembatalan</div>
        </template>
        <div>
          Apakah Anda yakin ingin membatalkan pesanan ini?
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]" @click="closeCancelModal">
              Cancel</UButton>
            <UButton :loading="cancelStatus === 'pending'" color="red" variant="outline"
              class="flex flex-grow items-center justify-center h-[38px]" @click="cancelOrder">
              Batalkan</UButton>
          </div>
          <div v-if="cancelError" class="text-red-500 flex justify-center">{{ cancelError.message }}</div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const toast = useToast()

const { data: orders, status, error, refresh } = useLazyAsyncData('orders', async () => {
  let { data, error } = await supabase.from('pemesanan').select(`
    *,
    lokasi (
      id, nama
    ),
    pemesanan_produk (
      produk (
        *
      ),
      jumlah
    ),
    status_pemesanan (
      status ( status ),
      waktu
    )
  `).order('created_at')
  if (data) {
    data.forEach(order => {
      order.showAllProducts = false
      order.showAllStatuses = false
      order.pemesanan_produk.forEach(({ produk }) => {
        const { data: { publicUrl: url } } = supabase.storage.from('produk').getPublicUrl(produk.foto)
        produk.fotoUrl = url
      })
    })
  }
  if (error) throw error
  return data
})

const { data: orderStatuses } = useAsyncData('orderStatuses', async () => {
  const { data, error } = await supabase.from('status').select().order('id')
  if (error) throw error
  return data
})

const selectedMethod = ref('Semua')
const selectedStatus = ref('Semua')
const activeButton = (selected, label) => selected === label ? 'solid' : 'outline'

const deliveryFee = metode => metode === 'Delivery' ? 1000 : 0

const filteredOrders = computed(() => {
  return orders.value?.filter(({ metode, status_pemesanan: orderStatus }) => {
    const filterStatus = selectedStatus.value === 'Semua' ? true : orderStatus.at(-1)?.status?.status === selectedStatus.value
    const filterMethod = selectedMethod.value === 'Semua' ? true : metode === selectedMethod.value

    return filterStatus && filterMethod
  })
})

const selectedId = ref(null)

const cancelModal = ref(false)
const openCancelModal = orderId => {
  selectedId.value = orderId
  cancelModal.value = true
}
const closeCancelModal = () => {
  selectedId.value = null
  cancelModal.value = false
}

const { execute: cancelOrder, status: cancelStatus, error: cancelError } = useAsyncData('cancelOrder', async () => {
  try {
    const { error } = await supabase.from('status_pemesanan').insert({
      id_pemesanan: selectedId.value,
      id_status: 6,
      waktu: new Date().toLocaleTimeString()
    })
    if (error) throw error
    closeCancelModal()
    refresh()
    toast.add({ title: 'Pesanan berhasil dibatalkan', timeout: 2000 })
  } catch (error) {
    toast.add({ title: 'Gagal membatalkan pesanan', description: error.message, timeout: 2000 })
  }
}, {
  immediate: false
})
</script>

<style scoped>
.slide-down-fade-enter-from,
.slide-down-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-fade-enter-active,
.slide-down-fade-leave-active {
  transition: all 0.2s ease-out;
}
</style>