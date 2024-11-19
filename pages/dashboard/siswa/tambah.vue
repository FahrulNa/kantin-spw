<template>
  <div class="flex flex-col flex-grow">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Produk', to: '/dashboard/produk' }, { label: 'Tambah Siswa', to: '/dashboard/siswa/tambah' }]" />
    <div class="w-auto flex flex-grow justify-center items-center">
      <div class="w-fit relative border rounded-2xl">
        <UForm class="p-10 space-y-4 flex flex-col" :validate="validate" :state="state" @submit="addSiswa">
          <UFormGroup label="Nama Siswa" name="nama">
            <UInput v-model="state.nama" placeholder="Nama lengkap" />
          </UFormGroup>
          <UFormGroup label="Kelas" name="kelas">
            <USelect :options="classes" option-attribute="nama" value-attribute="id" v-model="state.kelas" />
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

const state = reactive({
  nama: '',
  kelas: null
})

const validate = (state) => {
  const errors = []
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.kelas) errors.push({ path: 'kelas', message: 'Required' })
  return errors
}

const { execute: addSiswa, status, error } = await useAsyncData('addSiswa', async () => {
  const { error } = await supabase.from('siswa').insert([{
    nama: state.nama,
    kelas: Number(state.kelas),
  }])
  if (error) throw new Error('Gagal menambahkan data')
  navigateTo('/dashboard/siswa')
}, {
  immediate: false
})

const { data: classes } = await useAsyncData('classes', async () => {
  const { data, error } = await supabase.from('kelas').select()
  if (error) throw error
  return data
})
</script>

<style scoped></style>