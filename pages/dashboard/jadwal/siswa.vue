<template>
  <div class="flex flex-col flex-grow gap-y-5 w-1/2">
    <UBreadcrumb divider="/"
      :links="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Jadwal', to: '/dashboard/jadwal' }, { label: 'Jadwal Siswa', to: '/dashboard/jadwal/siswa' }]" />

    <div class="text-center font-semibold mb-2">Jadwal Piket</div>
    <div>
      <UInput type="date" class="w-fit" v-model="selectedDate"></UInput>
    </div>
    <div class="flex justify-center">
      <UCarousel v-slot="{ item }" :items="items" :ui="{ item: 'basis-full', container: 'rounded-lg' }"
        class="" :prev-button="{
          color: 'gray',
          icon: 'i-heroicons-arrow-left-20-solid',
          class: '-start-1'
        }" :next-button="{
          color: 'gray',
          icon: 'i-heroicons-arrow-right-20-solid',
          class: '-end-1'
        }" arrows>
        <UCard class="basis-full" :ui="{rounded: 'rounded-none', ring: 'ring-0', shadow: 'shadow-none' }">
          <div class="flex flex-col items-center">
            <div class="font-bold text-lg">{{ item.title }}</div>
            <div class="text-sm text-gray-600">{{ item.description }}</div>
            <div class="mt-2 text-sm">Siswa: <span class="font-semibold">{{ item.siswa }}</span></div>
          </div>
        </UCard>
        <!-- <img src="" alt="ini gambar" class="basis-full"> -->
      </UCarousel>
    </div>
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