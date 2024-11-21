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
              <div class="text-center font-semibold text-gray-700">{{ day.nama }}</div>
            </template>
            <ol>
              <li v-for="teacher in day.guru">{{ teacher.nama }}</li>
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
            <h3 class="text-center font-bold">Edit Guru</h3>
            <div>

            </div>
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

const isOpen = ref(false)
</script>

<style scoped></style>