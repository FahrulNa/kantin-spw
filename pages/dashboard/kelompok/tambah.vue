<template>
  <div class="flex flex-col flex-grow">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Produk', to: '/dashboard/produk' }, { label: 'Simpan Produk', to: '/dashboard/tambah' }]" />
    <div class="w-auto flex flex-grow justify-center items-center">
      <div class="w-fit relative border rounded-2xl">
        <UForm class="p-10 space-y-4 flex flex-col" :validate="validate" :state="state" @submit="addKelompok">
          <UFormGroup label="Nama Kelompok" name="nama">
            <UInput v-model="state.nama" placeholder="contoh: Kelompok 1" />
          </UFormGroup>
          <UFormGroup label="Kelas" name="kelas">
            <USelect :loading="!classes" :options="classes" option-attribute="nama" value-attribute="id"
              v-model="state.kelas" />
          </UFormGroup>
          <UButton :loading="status == 'pending'" class="justify-center" type="submit">
            Tambah
          </UButton>
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

const { data: userData } = await useAsyncData('userData', async () => {
  const { data, error } = await supabase.from('users').select('nama, role').eq('id', user.value.id).maybeSingle()
  if (error) throw error
  return data
})

const state = reactive({
  nama: '',
  kelas: null
})

const validate = (state) => {
  const errors = []
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.kelas && userData.value.role !== 'kelas') errors.push({ path: 'kelas', message: 'Required' })
  return errors
}

const { execute: addKelompok, status, error } = useAsyncData('addKelompok', async () => {
  const { error } = await supabase.from('kelompok').insert([{
    nama: state.nama,
    kelas: Number(state.kelas) || userData.value.nama
  }])
  if (error) throw error
  navigateTo('/dashboard/kelompok')
}, {
  immediate: false
})

const { data: classes } = await useAsyncData('classes', async () => {
  try {
    let query = supabase.from('kelas').select()
    if (userData.value.role === 'kelas') query = query.eq('nama', userData.value.nama)
    const { data, error } = await query
    if (error) throw error
    if (userData.value.role === 'kelas') state.kelas = data[0].id
    return data
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped></style>