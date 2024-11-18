<template>
  <div class="flex flex-col flex-grow gap-y-24">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Jadwal', to: '/dashboard/jadwal' }, { label: 'Jadwal Siswa', to: '/dashboard/jadwal/siswa' }]" />

    <div v-if="schedules" class="flex gap-5 w-1/2 items-center ml-80">
      <UCard class="flex-1 text-center">
        <template #header>
          <div> Piket </div>
        </template>
        <div class="grid grid-cols-2 grid-rows-2 gap-5 text-justify">
          <UCard v-for="schedule in schedules" :key="schedule.id" >
            <template #header>
              <div class="text-center font-semibold">{{ schedule.nama }}</div>
            </template>
            <ol>
              <li v-for="student in schedule.siswa" :key="student.id"> {{ student.nama }} </li>
            </ol>
            <template #footer>
              <UButton icon="heroicons:pencil-square-20-solid" color="yellow" label="Edit" variant="ghost" @click="isOpen = true"/>
            </template>
          </UCard>
        </div>
      </UCard>
    </div>
    <UModal v-model="isOpen" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="  font-semibold leading-6 text-gray-900 dark:text-white">
              Edit Jadwal
            </h3>
            <div>

            </div>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>
      </UCard>
    </UModal>
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
    const { data, error } = await supabase.from('hari').select(`
      id, nama,
      siswa!jadwal_siswa (
        id, nama
        )
      )
    `).order('id').range(0,3)
    if (error) throw error
    return data
  } catch (error) {
    console.error(error)
    return
  }
})

const isOpen = ref(false)
</script>

<style scoped></style>