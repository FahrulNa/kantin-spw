<template>
  <div class="flex flex-col gap-y-5">
    <div class="flex justify-center">
      <UButton @click="navigateTo('/dashboard/guru/tambah')">Tambah Guru</UButton>
    </div>
    <div v-if="status == 'error'" class="text-red-500">
      {{ error.message }}
    </div>
    <div v-else class="flex flex-col gap-y-5 items-center">
      <div class="w-1/2">
        <UInput v-model="searchQuery" placeholder="Cari Nama..." class="w-full"
          icon="heroicons:magnifying-glass-20-solid" @input="() => page = 1" />
      </div>
      <UTable :rows="filteredRows" :columns="columns" :loading="status == 'pending'" class="border rounded-lg w-1/2">
        <template #no-data="{ index }">
          <div>{{ (page - 1) * pageCount + index + 1 }}</div>
        </template>
        <template #actions-data="{ row }">
          <UButton color="yellow" variant="ghost" icon="heroicons:pencil-square-20-solid"
            @click="openEditModal(row.id)" />
          <UButton color="red" variant="ghost" icon="heroicons:trash-20-solid" @click="openDeleteModal(row.id)" />
        </template>
      </UTable>
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination v-model="page" :page-count="pageCount" :total="teachers.length" />
      </div>

      <UModal v-model="editModal">
        <UCard>
          <template #header>
            <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
              class="float-end" @click="closeEditModal" />
            <h3 class="text-center font-bold">Edit Guru</h3>
          </template>
          <UForm class="px-10 space-y-4 flex flex-col" :validate="validate" :state="state"
            @submit="editGuru(selectedItem.id)">
            <UFormGroup label="Nama Guru" name="nama">
              <UInput v-model="state.nama" placeholder="Nama Lengkap" />
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
            <div class="font-semibold text-center">Apakah Anda Yakin Ingin Menghapus Ini?</div>
          </template>
          <div v-if="selectedItem">
            <p>Nama Guru: {{ selectedItem.nama }}</p>
          </div>
          <template #footer>
            <div class="flex gap-2">
              <UButton color="gray" class="flex flex-grow items-center justify-center h-[38px]"
                @click="closeDeleteModal">Cancel</UButton>
              <UButton :loading="deleteLoading" color="red" class="flex flex-grow items-center justify-center h-[38px]"
                @click="deleteGuru(selectedItem.id)">Delete</UButton>
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

const searchQuery = ref('')

const { data: teachers, status, error, refresh } = useLazyAsyncData('teachers', async () => {
  try {
    const { data, error } = await supabase.from('guru').select('id, nama').order('id')
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
  nama: ''
})

const selectedItem = computed(() => {
  return teachers.value.find(teacher => teacher.id === selectedId.value)
})

const closeModal = () => {
  selectedId.value = null
  state.nama = ''
}

const openEditModal = (teacherId) => {
  selectedId.value = teacherId
  if (selectedItem.value) {
    state.nama = selectedItem.value.nama

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

  return errors
}

const editLoading = ref(false)
const editGuru = async (teacherId) => {
  try {
    editLoading.value = true
    const { error } = await supabase.from('guru').update({
      nama: state.nama,
    }).eq('id', teacherId)
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

const openDeleteModal = (teacherId) => {
  selectedId.value = teacherId
  deleteModal.value = true
}
const closeDeleteModal = () => {
  closeModal()
  deleteModal.value = false
}

const deleteLoading = ref(false)
const deleteGuru = async (teacherId) => {
  try {
    deleteLoading.value = true
    const { error } = await supabase.from('guru').delete().eq('id', teacherId)
    if (error) throw error
    closeDeleteModal()
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    deleteLoading.value = false
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
  }, {
    key: 'actions',
    class: 'w-20'
  }
]

const page = ref(1)
const pageCount = 8

const filteredRows = computed(() => {
  if (!searchQuery.value) {
    return teachers.value?.slice((page.value - 1) * pageCount, (page.value) * pageCount)
  }

  const filtered = teachers.value?.filter((teacher) => {
    return teacher.nama.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
  })

  return filtered.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})
</script>


<style scoped></style>