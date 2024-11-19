<template>
  <div class="flex flex-col flex-grow gap-y-10 w-1/2">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Jadwal', to: '/dashboard/jadwal' }, { label: 'Jadwal Siswa', to: '/dashboard/jadwal/siswa' }]" />

      <UCard class="w-full ml-80">
        <div>
          <UInput type="date" class="w-fit" v-model="selectedDate"></UInput>
          <div class="text-center font-semibold mb-2">Jadwal Piket</div>
        </div>
          <UCarousel 
          v-slot="{ item }" 
          :items="items" 
          :ui="{ item: 'basis-full' }" class="rounded-lg overflow-hidden"
          :prev-button="{
            color: 'gray',
            icon: 'i-heroicons-arrow-left-20-solid',
            class: '-start-12'
          }"
          :next-button="{
            color: 'gray',
            icon: 'i-heroicons-arrow-right-20-solid',
            class: '-end-12'
          }"
          arrows>
          <UCard class="p-4 w-full text-align-center">
            <div class="font-bold text-lg">{{ item.title }}</div>
            <div class="text-sm text-gray-600">{{ item.description }}</div>
            <div class="mt-2 text-sm">Siswa: <span class="font-semibold">{{ item.siswa }}</span></div>
          </UCard>
          </UCarousel>
      </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const supabase = useSupabaseClient()

const selectedDate = ref(null)
const { data: schedules } = useAsyncData('monthlySchedules', async () => {
  const { data, error } = await supabase.from('tanggal').select(`
    id, tanggal,
    siswa (
      id, nama
    )
  `).eq('tanggal', selectedDate.value)
  if (error) throw error
  return data
})


const items = ref([
  { 
    title: "Senin", 
    description: "Piket kelas X IPA 1", 
    siswa: "Ahmad, Budi, Siti"
  },
  { 
    title: "Selasa", 
    description: "Piket kelas X IPA 2", 
    siswa: "Dina, Roni, Eka"
  },
  { 
    title: "Rabu", 
    description: "Piket kelas XI IPA 1", 
    siswa: "Fahri, Lia, Tono"
  }
])

</script>

<style scoped></style>