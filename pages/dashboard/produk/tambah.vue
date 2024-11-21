<template>
  <div class="flex flex-col flex-grow">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Produk', to: '/dashboard/produk' }, { label: 'Simpan Produk', to: '/dashboard/produk/tambah' }]" />
    <div class="w-auto flex flex-grow justify-center items-center">
      <div class="w-fit relative border rounded-2xl">
        <UForm class="p-10 space-y-4 flex flex-col" :state="state" :validate="validate" @submit="addProduct">
          <h3 class="text-xl text-center font-bold">Simpan Produk</h3>
          <UFormGroup label="Kelompok" name="kelompok">
            <USelect :loading="!groups" :options="groups" option-attribute="nama" value-attribute="id" v-model="state.kelompok" />
          </UFormGroup>
          <UFormGroup label="Nama Produk" name="nama">
            <UInput v-model="state.nama" />
          </UFormGroup>
          <UFormGroup label="Jumlah Produk" name="jumlah">
            <UInput type="number" size="sm" min="0" v-model="state.jumlah" />
          </UFormGroup>
          <UFormGroup label="Harga Produk" name="harga">
            <UInput type="number" size="sm" min="0" step="500" v-model="state.harga">
              <template #leading>
                <span class="text-gray-500 text-xs">Rp.</span>
              </template>
            </UInput>
          </UFormGroup>
          <UFormGroup label="Foto Produk" name="foto">
            <UInput :disabled="!state.kelompok" type="file" accept="image/*" @change="photoPicked" />
          </UFormGroup>
          <div class="flex justify-center">
            <UButton :loading="status == 'pending'" class="w-fit px-12" type="submit">Simpan</UButton>
          </div>
          <div class="text-red-500" v-if="status == 'error'">{{ error.message }}</div>
        </UForm>
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

const state = reactive({
  kelompok: null,
  nama: '',
  jumlah: 0,
  harga: 0,
  foto: '',
})
const photoImage = ref(null)

const validate = (state) => {
  const errors = []
  if (!state.kelompok) errors.push({ path: 'kelompok', message: 'Required' })
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.jumlah) errors.push({ path: 'jumlah', message: 'Required' })
  if (!state.harga) errors.push({ path: 'harga', message: 'Required' })
  return errors
}

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

async function photoPicked(event) {
  const file = event[0]
  const { data: group, error } = await supabase.from('kelompok').select(`
    id, nama,
    kelas ( nama )
  `).eq('id', state.kelompok).maybeSingle()
  if (error) throw error
  photoImage.value = file
  state.foto = `${group.kelas.nama}/${group.nama}/${file.name}`
}

const { execute: addProduct, status, error } = useAsyncData('addProduct', async () => {
  if (photoImage.value) {
    const { error } = await supabase.storage.from('produk').upload(state.foto, photoImage.value)
    if (error) throw error
  }
  const { error } = await supabase.from('produk').insert({
    kelompok: Number(state.kelompok),
    nama: state.nama,
    banyak: state.jumlah,
    sisa: state.jumlah,
    harga: state.harga,
    foto: state.foto ?? null
  })
  if (error) throw error
  navigateTo('/dashboard/produk')
}, {
  immediate: false
})
</script>

<style scoped>

</style>