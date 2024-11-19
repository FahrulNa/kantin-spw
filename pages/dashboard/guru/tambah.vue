<template>
  <div class="flex flex-col flex-grow">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Guru', to: '/dashboard/guru' }, { label: 'Tambah Guru', to: '/dashboard/guru/tambah' }]" />
    <div class="w-auto flex flex-grow justify-center items-center">
      <div class="w-fit relative border rounded-2xl">
        <UForm class="p-10 space-y-4 flex flex-col" :validate="validate" :state="state" @submit="addGuru">
          <UFormGroup label="Nama Guru" name="nama">
            <UInput v-model="state.nama" placeholder="Nama lengkap" />
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
  nama: ''
})

const validate = (state) => {
  const errors = []
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  return errors
}

const { execute: addGuru, status, error } = await useAsyncData('addGuru', async () => {
  const { error } = await supabase.from('guru').insert([{
    nama: state.nama
  }])
  if (error) throw new Error('Gagal menambahkan data')
  navigateTo('/dashboard/guru')
}, {
  immediate: false
})
</script>

<style scoped></style>