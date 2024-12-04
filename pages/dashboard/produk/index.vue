<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Produk', to: '/dashboard/produk' }]" />

    <div class="flex justify-center">
      <UButton @click="navigateTo('/dashboard/produk/tambah')">Tambah Produk</UButton>
    </div>

    <div v-if="status == 'pending' || status == 'error'">
      <div v-if="status == 'pending'">
        Loading...
      </div>

      <div v-if="status == 'error'">
        {{ error.message }}
      </div>
    </div>
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-5">
      <div v-for="product in products" :key="product.id" class="flex">
        <UCard class="flex flex-col" :ui="{ header: { base: 'flex-grow flex items-center' } }">
          <template #header>
            <NuxtImg v-if="product.fotoUrl" :src="product.fotoUrl" width="300" height="300" />
            <NuxtImg v-else src="img/img-placeholder.png" width="300" height="300" />
          </template>
          <div class="flex flex-col gap-y-4">
            <div class="flex flex-col items-center">
              <div class="font-bold text-lg">{{ product.nama }}</div>
              <div v-if="product.kelompok" class="text-gray-500 text-sm">{{ product.kelompok.nama }} / {{
                product.kelompok.kelas.nama }}</div>
            </div>
            <div class="flex flex-col text-sm">
              <div>Jumlah Tersimpan: {{ product.banyak }}</div>
              <div>Sisa Produk: {{ product.sisa }}</div>
              <div>Harga: {{ rupiah(product.harga) }}</div>
            </div>
            <div class="flex justify-center">
              <UButton variant="outline" color="lime" icon="i-heroicons-archive-box-arrow-down" label="Simpan" @click="openStoreModal(product.id)" />
            </div>
          </div>
          <template #footer>
            <UButton icon="i-heroicons-pencil-square-20-solid" size="sm" color="yellow" square variant="ghost"
              @click="openEditModal(product.id)" />
            <UButton icon="i-heroicons-trash-20-solid" size="sm" color="red" square variant="ghost"
              @click="openDeleteModal(product.id)" />
          </template>
        </UCard>
      </div>
    </div>

    <UModal v-model="storeModal">
      <UCard>
        <template #header>
          <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
            class="float-end" @click="closeStoreModal" />
          <h3 class="text-center font-">Simpan Produk</h3>
        </template>
        <UForm class="px-10 space-y-4 flex flex-col" :validate="storeValidate" :state="storeState" @submit="storeProduct(selectedItem.id)">
          <div v-if="selectedItem" class="flex flex-col text-sm font-light">
            <div>Nama: {{ selectedItem.nama }}</div>
            <div>Kelompok: {{ selectedItem.kelompok.nama }}</div>
            <div>Kelas: {{ selectedItem.kelompok.kelas.nama }}</div>
          </div>
          <UFormGroup label="Jumlah yang ingin disimpan" name="banyak">
            <UInput type="number" min="0" v-model="storeState.banyak" />
          </UFormGroup>
          <div class="flex justify-center">
            <UButton :loading="storeLoading" class="w-fit px-12" color="lime" type="submit">Simpan</UButton>
          </div>
          <div v-if="storeError" class="text-red-500 text-center">{{ storeError }}</div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="editModal">
      <UCard>
        <template #header>
          <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
            class="float-end" @click="closeEditModal" />
          <h3 class="text-center font-bold">Edit Produk</h3>
        </template>
        <UForm class="px-10 space-y-4 flex flex-col" :validate="validate" :state="state"
          @submit="editProduct(selectedItem.id)">
          <UFormGroup label="Kelompok" name="kelompok">
            <USelect :loading="!groups" :options="groups" option-attribute="nama" value-attribute="id"
              v-model="state.kelompok" @change="groupPicked" />
          </UFormGroup>
          <UFormGroup label="Nama Produk" name="nama">
            <UInput v-model="state.nama" />
          </UFormGroup>
          <UFormGroup label="Jumlah Produk" name="banyak">
            <UInput type="number" size="sm" min="0" v-model="state.banyak" />
          </UFormGroup>
          <UFormGroup label="Sisa Produk" name="sisa">
            <UInput type="number" size="sm" min="0" :max="state.banyak" v-model="state.sisa" />
          </UFormGroup>
          <UFormGroup label="Harga Produk" name="harga">
            <UInput type="number" size="sm" min="0" step="500" v-model="state.harga">
              <template #leading>
                <span class="text-gray-500 text-xs">Rp.</span>
              </template>
            </UInput>
          </UFormGroup>
          <UFormGroup label="Foto Produk" name="foto">
            <UInput type="file" accept="image/*" @change="photoPicked" />
          </UFormGroup>
          <div class="flex justify-center">
            <div class="relative" v-if="newPhotoImage || oldPhotoImageUrl">
              <NuxtImg v-if="newPhotoImage" :src="newPhotoImage" width="100" height="100" />
              <NuxtImg v-else-if="oldPhotoImageUrl" :src="oldPhotoImageUrl" width="100" height="100" />
              <UButton icon="i-heroicons-x-mark-20-solid" color="red" :padded="false" class="absolute -top-2 -end-2" @click="removePhotoImage" />
            </div>
          </div>
          <div class="flex justify-center">
            <UButton :loading="editLoading" class="w-fit px-12" color="yellow" type="submit">Edit</UButton>
          </div>
          <div v-if="editError" class="text-red-500 text-center">{{ editError }}</div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="deleteModal">
      <UCard>
        <template #header>
          <div class="font-semibold">Apakah Anda Yakin Ingin Menghapus Produk Ini?</div>
        </template>
        <div v-if="selectedItem" class="flex flex-col gap-y-2">
          <p>Nama Produk: {{ selectedItem.nama }}</p>
          <p v-if="selectedItem.kelompok">Kelompok: {{ selectedItem.kelompok.nama }} / {{
            selectedItem.kelompok.kelas.nama
          }}</p>
          <UAlert icon="i-heroicons-exclamation-circle" color="red" variant="outline" title="Peringatan" description="Menghapus produk ini akan menghapus semua transaksi dan pemesanan yang berkaitan dengan produk ini." class="text-sm" />
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]" @click="closeDeleteModal">
              Cancel</UButton>
            <UButton :loading="deleteLoading" color="red" class="flex flex-grow items-center justify-center h-[38px]"
              @click="deleteProduct(selectedItem.id)">Delete</UButton>
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

const { data: userData } = await useAsyncData('userData', async () => {
  const { data, error } = await supabase.from('users').select('nama, role').eq('id', user.value.id).maybeSingle()
  if (error) throw error
  return data
})

const { data: groups } = await useAsyncData('groups', async () => {
  try {
    const { data, error } = await supabase.from('kelompok').select(`
      id, nama,
      kelas!inner (
        nama
      )
    `).eq('kelas.nama', userData.value.nama)
    if (error) throw error
    return data
  } catch (error) {
    console.error(error)
  }
})

const { data: products, status, error, refresh } = useLazyAsyncData('products', async () => {
  try {
    let { data, error } = await supabase.from('produk').select(`
      *,
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
          fotoUrl: data.foto ? url.publicUrl : null
        }
      })
    }
    return data
  } catch (error) {
    console.error(error)
    return
  }
})

const selectedId = ref(null)

const selectedItem = computed(() => {
  return products.value.find(product => product.id === selectedId.value)
})

const state = reactive({
  kelompok: null,
  nama: '',
  banyak: 0,
  sisa: 0,
  harga: 0,
  foto: '',
})
const photoImage = ref(null)
const oldPhotoImageUrl = ref('')
const newPhotoImage = ref(null)

const validate = (state) => {
  const errors = []
  if (!state.kelompok) errors.push({ path: 'kelompok', message: 'Required' })
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.banyak) errors.push({ path: 'banyak', message: 'Required' })
  if (!state.harga) errors.push({ path: 'harga', message: 'Required' })
  return errors
}

const getGroup = async () => {
  const { data: group, error } = await supabase.from('kelompok').select(`
    id, nama,
    kelas ( nama )
  `).eq('id', state.kelompok).maybeSingle()
  if (error) throw error
  return group
}

async function photoPicked(event) {
  const file = event[0]
  photoImage.value = file
  const group = await getGroup()
  state.foto = `${group.kelas.nama}/${group.nama}/${file.name}`
  let fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = () => newPhotoImage.value = fr.result
}

const removePhotoImage = () => {
  state.foto = ''
  newPhotoImage.value = null
  oldPhotoImageUrl.value = ''
}

async function groupPicked() {
  const group = await getGroup()
  if (group && state.foto) state.foto = state.foto.replace(/\/[^\/]+\//, `/${group.nama}/`)
}

const resetState = () => {
  selectedId.value = null
  state.kelompok = null
  state.nama = ''
  state.banyak = 0
  state.sisa = 0
  state.harga = 0
  state.foto = ''
  photoImage.value = null
  storeState.banyak = 0
}

const storeState = reactive({
  banyak: 0
})
const storeValidate = (state) => {
  const errors = []
  if (!state.banyak) errors.push({ path: 'banyak', message: 'Required' })
  return errors
}

const storeModal = ref(false)
const openStoreModal = (productId) => {
  selectedId.value = productId
  storeModal.value = true
}
const closeStoreModal = () => storeModal.value = false

const storeLoading = ref(false)
const storeError = ref('')
const storeProduct = async (productId) => {
  try {
    storeLoading.value = true
    const { error } = await supabase.from('produk').update({
      banyak: storeState.banyak,
      sisa: storeState.banyak
    }).eq('id', productId)
    if (error) throw error
    closeStoreModal()
    refresh()
  } catch (error) {
    console.error(error)
    storeError.value = error.message
    setTimeout(() => {
      storeError.value = ''
    }, 3000)
  } finally {
    storeLoading.value = false
  }
}

const editModal = ref(false)
const openEditModal = (productId) => {
  selectedId.value = productId
  if (selectedItem.value) {
    state.kelompok = selectedItem.value.kelompok?.id
    state.nama = selectedItem.value.nama
    state.banyak = selectedItem.value.banyak
    state.sisa = selectedItem.value.sisa
    state.harga = selectedItem.value.harga
    state.foto = selectedItem.value.foto
    oldPhotoImageUrl.value = selectedItem.value.fotoUrl
  }
  editModal.value = true
}
const closeEditModal = () => editModal.value = false

async function getProductPhoto(productId) {
  const { data, error } = await supabase.from('produk').select('foto').eq('id', productId).maybeSingle()
  if (error) throw error
  return data
}

const editLoading = ref(false)
const editError = ref('')
const editProduct = async (productId) => {
  try {
    editLoading.value = true
    if (photoImage.value) {
      const { foto } = await getProductPhoto(productId)
      if (foto) {
        const { error } = await supabase.storage.from('produk').update(foto, photoImage.value)
        if (error) throw error
      } else {
        const { error } = await supabase.storage.from('produk').upload(state.foto, photoImage.value)
        if (error) throw error
        if (selectedItem.value.foto) {
          const { error } = await supabase.storage.from('produk').remove(selectedItem.value.foto)
          if (error) throw error
        }
      }
    }
    const { error } = await supabase.from('produk').update({
      kelompok: Number(state.kelompok),
      nama: state.nama,
      banyak: state.banyak,
      sisa: state.sisa,
      harga: state.harga,
      foto: state.foto ?? null
    }).eq('id', productId)
    if (error) throw error
    closeEditModal()
    refresh()
  } catch (error) {
    console.error(error)
    editError.value = error.message
    setTimeout(() => {
      editError.value = ''
    }, 3000)
  } finally {
    editLoading.value = false
  }
}

const deleteModal = ref(false)
const openDeleteModal = (productId) => {
  selectedId.value = productId
  deleteModal.value = true
}
const closeDeleteModal = () => deleteModal.value = false

const deleteLoading = ref(false)
const deleteProduct = async (productId) => {
  try {
    deleteLoading.value = true
    const { data: url } = await getProductPhoto(productId)
    if (url) {
      const { error } = await supabase.storage.from('produk').remove(url)
      if (error) throw error
    }
    const { error } = await supabase.from('produk').delete().eq('id', productId)
    if (error) throw error
    closeDeleteModal()
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    deleteLoading.value = false
  }
}

watch([storeModal, editModal, deleteModal], ([newStoreModal, newEditModal, newDeleteModal], [oldStoreModal, oldEditModal, oldDeleteModal]) => {
  if ((oldStoreModal && !newStoreModal) || (oldEditModal && !newEditModal) || (oldDeleteModal && !newDeleteModal)) {
    setTimeout(() => resetState(), 250)
  }
})
</script>

<style scoped></style>