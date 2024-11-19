<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Kelompok', to: '/dashboard/kelompok' }]" />

    <div class="flex justify-center">
      <UButton @click="navigateTo('/dashboard/kelompok/tambah')">Tambah Kelompok</UButton>
    </div>

    <div v-if="status == 'pending' || status == 'error'">
      <div v-if="status == 'pending'">
        Loading...
      </div>

      <div v-if="status == 'error'">
        {{ error.message }}
      </div>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-5">
      <div v-for="group in groups" :key="group.id">
        <UCard>
          <template #header>
            <div class="">{{ group.nama }}</div>
            <div>{{ group.kelas?.nama }}</div>
          </template>
          <ul v-if="group.siswa?.length" class="list-disc ms-4">
            <li v-for="student in group?.siswa">{{ student?.nama }}</li>
          </ul>
          <div v-else class="opacity-50">Kelompok ini belum ada siswa</div>
          <template #footer>
            <UButton icon="i-heroicons-pencil-square-20-solid" size="sm" color="yellow" square variant="ghost"
              @click="openEditModal(group.id)" />
            <UButton icon="i-heroicons-trash-20-solid" size="sm" color="red" square variant="ghost"
              @click="openDeleteModal(group.id)" />
            <UButton icon="i-heroicons-eye-20-solid" size="sm" color="blue" square variant="ghost"
              @click="navigateTo(`/dashboard/kelompok/${group.id}`)" />
          </template>
        </UCard>
      </div>

      <UModal v-model="editModal">
        <UCard>
          <template #header>
            <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
              class="float-end" @click="editModal = false" />
            <h3 class="text-center font-bold">Edit Kelomopok</h3>
          </template>
          <UForm class="px-10 space-y-4 flex flex-col" :validate="validate" :state="state"
            @submit="editKelompok(selectedItem.id)">
            <UFormGroup label="Nama Kelompok" name="nama">
              <UInput v-model="state.nama" placeholder="contoh: Kelompok 1" />
            </UFormGroup>
            <UFormGroup label="Kelas" name="kelas">
              <USelect :loading="!classes" :options="classes" option-attribute="nama" value-attribute="id"
                v-model="state.kelas" />
            </UFormGroup>
            <UButton :loading="editLoading" color="yellow" class="justify-center" type="submit">
              Edit
            </UButton>
          </UForm>
        </UCard>
      </UModal>

      <UModal v-model="deleteModal">
        <UCard>
          <template #header>
            <div class="font-semibold">Apakah Anda Yakin Ingin Menghapus Kelompok Ini?</div>
          </template>
          <div v-if="selectedItem">
            <p>Kelompok: {{ selectedItem.nama }}</p>
            <p v-if="selectedItem.kelas">Kelas: {{ selectedItem.kelas.nama }}</p>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]"
                @click="deleteModal = false">Cancel</UButton>
              <UButton :loading="deleteLoading" color="red" class="flex flex-grow items-center justify-center h-[38px]"
                @click="deleteKelompok(selectedItem.id)">Delete</UButton>
            </div>
          </template>
        </UCard>
      </UModal>
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

const { data: classes } = useAsyncData('classes', async () => {
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

const { data: groups, status, error, refresh } = useLazyAsyncData('groups', async () => {
  try {
    let query = supabase.from('kelompok').select(`
      *,
      kelas!inner (
        id, nama
      ),
      siswa ( * )
    `)
    if (userData.value?.role === 'kelas') query = query.eq('kelas.nama', userData.value?.nama)
    else query = query.order('kelas')
    query = query.order('nama')
    const { data, error } = await query
    if (error) throw error
    return data
  } catch (error) {
    console.error(error)
    return
  }
})

const editModal = ref(false)
const selectedId = ref(null)

const state = reactive({
  nama: '',
  kelas: null
})

const selectedItem = computed(() => {
  return groups.value.find(group => group.id === selectedId.value)
})

const openEditModal = (groupId) => {
  selectedId.value = groupId
  if (selectedItem.value) {
    state.nama = selectedItem.value.nama
    state.kelas = selectedItem.value.kelas?.id
  }
  editModal.value = true
}

const validate = (state) => {
  const errors = []
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.kelas) errors.push({ path: 'kelas', message: 'Required' })
  return errors
}

const editLoading = ref(false)
const editKelompok = async (groupId) => {
  try {
    editLoading.value = true
    const { error } = await supabase.from('kelompok').update({
      nama: state.nama,
      kelas: Number(state.kelas)
    }).eq('id', groupId)
    if (error) throw error
    editModal.value = false
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    editLoading.value = false
  }
}

const deleteModal = ref(false)

const openDeleteModal = (groupId) => {
  selectedId.value = groupId
  deleteModal.value = true
}

const deleteLoading = ref(false)
const deleteKelompok = async (groupId) => {
  try {
    deleteLoading.value = true
    const { error } = await supabase.from('kelompok').delete().eq('id', groupId)
    if (error) throw error
    deleteModal.value = false
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    deleteLoading.value = false
  }
}
</script>


<style scoped></style>