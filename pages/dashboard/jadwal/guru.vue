<template>
  <div class="flex flex-col flex-grow gap-y-24">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Jadwal', to: '/dashboard/jadwal' }, { label: 'Jadwal Guru', to: '/dashboard/jadwal/guru' }]" />

    <div v-if="schedules" class="flex gap-5">
      <UCard v-for="schedule in schedules" :key="schedule.id" class="flex-1 text-center">
        <template #header>
          <div class="text-2xl font-bold text-emerald-700">{{ schedule.nama }}</div>
        </template>
        <div class="grid grid-cols-2 grid-rows-2 gap-5 text-justify">
          <UCard v-for="day in schedule.hari" :key="day.id">
            <template #header>
              <div class="text-center font-serif text-lg font-semibold">{{ day.nama }}</div>
            </template>
            <ol>
              <li v-for="teacher in day.guru" class="list-disc list-outside">{{ teacher.nama }}</li>
            </ol>
            <template #footer>
              <UButton icon="heroicons:pencil-square-20-solid" color="yellow" variant="ghost" label="Edit" @click="isOpen = true"/>
            </template>
          </UCard>
        </div>
      </UCard>
    </div>
    <div>

    <UModal v-model="isOpen">
      <UCard :ui="{ ring: 'ring-2', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="">
            <UButton icon="i-heroicons-x-mark" size="xl" :padded="false" color="black" square variant="ghost"
              class="float-end" @click="isOpen = false" />
            <h3 class="text-center font-bold">Edit Jadwal Guru</h3>

          </div>
        </template>

        <div>

        </div>

      <template #footer>
        <div class="">

        </div>
      </template>
      </UCard>
    </UModal>
  </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const supabase = useSupabaseClient()

const { data: schedules } = useAsyncData('schedules', async () => {
  try {
    const { data, error } = await supabase.from('blok').select(`
      id, nama,
      hari (
        id, nama,
        guru (
          id, nama
        )
      )
    `).order('id')
    if (error) throw error
    return data
  } catch (error) {
    console.error(error)
    return
  }
})

const editLoading = ref(false)
const editJadwalGuru = async () => {
  try {
    editLoading.value = true
    const { error } = await supabase.from('guru').update({
      nama: state.nama,
    }).eq('id')
    if (error) throw error
    closeEditModal()
    refresh()
  } catch (error) {
    console.error(error)
  } finally {
    editLoading.value = false
  }
}

const isOpen = ref(false)
</script>

<style scoped></style>