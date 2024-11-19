<template>
  <div class="flex flex-col flex-grow gap-y-5">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Kelola Siswa', to: '/dashboard/siswa' }]" />
    <div class="flex justify-center">
      <UButton @click="navigateTo('/dashboard/siswa/tambah')">Tambah siswa</UButton>
    </div>

    <div v-if="status == 'pending' || status == 'error'">
      <div v-if="status == 'pending'">
        Loading...
      </div>

      <div v-if="status == 'error'">
        {{ error.message }}
      </div>
    </div>
    <div v-else class="flex justify-center">
      <div class="flex flex-col gap-y-5 w-full xl:w-1/2">
        <div class="w-full flex items-center gap-1.5">
          <span class="text-sm leading-5">Students per page:</span>
          <USelect v-model="pageCount" :options="[5, 10, 20, 30, 36]" size="xs" @change="resetPage" />
        </div>
        <div class="w-full flex justify-between gap-x-3">
          <div class="flex-1">
            <UInput v-model="searchQuery" placeholder="Cari Siswa..." icon="heroicons:magnifying-glass-20-solid"
              @input="resetPage" />
          </div>
          <div class="flex-1 flex items-center gap-1.5">
            <span class="text-sm leading-5">Kelas:</span>
            <USelectMenu v-model="selectedClass" :options="classes" option-attribute="nama" value-attribute="id" class="flex-grow" @change="resetPage" />
          </div>
          <div class="flex-0 flex items-center">
            <UButton icon="i-heroicons-x-mark" variant="link" color="red" size="xl" :padded="false" @click="() => selectedClass = null" />
          </div>
        </div>
        <UTable :rows="paginatedRows" :columns="columns" class="w-full border rounded-lg ">
          <template #no-data="{ index }">
            <div>{{ (page - 1) * pageCount + index + 1 }}</div>
          </template>
          <template #actions-data="{ row }">
            <UButton icon="heroicons:pencil-square-20-solid" color="yellow" variant="ghost"
              @click="openEditModal(row.id)" />
            <UButton icon="heroicons:trash-20-solid" color="red" variant="ghost" @click="openDeleteModal(row.id)" />
          </template>
        </UTable>
        <div class="flex w-full px-3 py-3.5 justify-end border-t border-gray-200 dark:border-gray-700">
          <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
        </div>
      </div>
    </div>

    <UModal v-model="editModal">
      <UCard>
        <template #header>
          <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
            class="float-end" @click="closeEditModal" />
          <h3 class="text-center font-bold">Edit Siswa</h3>
        </template>
        <UForm class="px-10 space-y-4 flex flex-col" :validate="validate" :state="state"
          @submit="editSiswa(selectedItem.id)">
          <UFormGroup label="Nama Siswa" name="nama">
            <UInput v-model="state.nama" placeholder="Nama Lengkap" />
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
          <div class="font-semibold">Apakah Anda Yakin Ingin Menghapus Ini?</div>
        </template>
        <div v-if="selectedItem">
          <p>Nama Siswa: {{ selectedItem.nama }}</p>
          <p v-if="selectedItem.kelas">Kelas: {{ selectedItem.kelas.nama }}</p>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]"
              @click="closeDeleteModal">Cancel</UButton>
            <UButton :loading="deleteLoading" color="red" class="flex flex-grow items-center justify-center h-[38px]"
              @click="deleteSiswa(selectedItem.id)">Delete</UButton>
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


const { data: classes } = await useAsyncData('classes', async () => {
  try {
    const { data, error } = await supabase.from('kelas').select()
    if (error) throw error
    return data
  } catch (error) {
    console.error(error)
  }
})

const { data: students, status, error, refresh } = await useAsyncData('students', async () => {
  try {
    const { data, error } = await supabase.from('siswa').select(`
    id, nama,
    kelas (
      id, nama
      ),
      token_siswa (
        token
        )
        `).order('kelas').order('nama')
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
  return students.value.find(student => student.id === selectedId.value)
})

const closeModal = () => {
  selectedId.value = null
  state.nama = ''
  state.kelas = null
}

const openEditModal = (studentId) => {
  selectedId.value = studentId
  if (selectedItem.value) {
    state.nama = selectedItem.value.nama
    state.kelas = selectedItem.value.kelas?.id
  }
  editModal.value = true
}
const closeEditModal = () => {
  closeModal()
  editModal.value = false
}

const validate = (state) => {
  const errors = []
  if (!state.nama) errors.push({ path: 'nama', message: 'Required' })
  if (!state.kelas) errors.push({ path: 'kelas', message: 'Required' })
  return errors
}

const editLoading = ref(false)
const editSiswa = async (studentId) => {
  try {
    editLoading.value = true
    const { error } = await supabase.from('siswa').update({
      nama: state.nama,
      kelas: Number(state.kelas)
    }).eq('id', studentId)
    if (error) throw error
    closeEditModal()
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    editLoading.value = false
  }
}

const deleteModal = ref(false)

const openDeleteModal = (studentId) => {
  selectedId.value = studentId
  deleteModal.value = true
}
const closeDeleteModal = () => {
  closeModal()
  deleteModal.value = false
}

const deleteLoading = ref(false)
const deleteSiswa = async (studentId) => {
  try {
    deleteLoading.value = true
    const { error } = await supabase.from('siswa').delete().eq('id', studentId)
    if (error) throw error
    closeDeleteModal()
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    deleteLoading.value = true
  }
}
const columns = [
  {
    key: 'no',
    label: 'No'
  },
  {
    key: 'nama',
    label: 'Nama'
  },
  {
    key: 'kelas.nama',
    label: 'Kelas'
  },
  {
    key: 'token_siswa.token',
    label: 'Token'
  },
  {
    key: 'actions',
    class: 'w-20'
  }
]

const searchQuery = ref('')
const selectedClass = ref(null)
const page = ref(1)
const pageCount = ref(10)

const resetPage = () => page.value = 1

const filteredRows = computed(() => {
  const filtered = students.value.filter((student) => {
    const filterNama = student.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    const filterKelas = selectedClass.value ? student.kelas.id == selectedClass.value : true

    return filterNama && filterKelas;
  })

  return filtered
})

const paginatedRows = computed(() => {
  return filteredRows.value.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})
</script>


<style scoped></style>