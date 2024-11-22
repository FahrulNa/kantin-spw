<template>
  <div>
    <div>{{ userData?.nama }}</div>
    <div class="p-8 min-h-screen">
    <!-- Cards Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <!-- Card 1: Pendapatan Minggu Ini -->
      <UCard>
        <div class="bg-teal-700 text-white shadow-md p-6 rounded-lg">
          <h2 class="text-xl font-semibold">Pendapatan Minggu Ini</h2>
          <p class="mt-2 text-2xl">Rp.500.0000</p>
        </div>
      </UCard>
      
      <!-- Card 2: Riwayat Absensi -->
      <UCard>
        <div class="bg-teal-700 text-white shadow-md p-6 rounded-lg">
          <h2 class="text-center text-xl font-semibold">Riwayat Absensi</h2>
          <p class="text-center mt-6 text-2xl">20 </p>
        </div>
    </UCard>
      
      <!-- Card 3: Jumlah Produk Terjual -->
      <UCard>
        <div class="bg-teal-700 text-white shadow-md p-6 rounded-lg">
          <h2 class="text-xl font-semibold">Jumlah Produk Terjual</h2>
          <p class="mt-2 text-2xl">120</p>
        </div>
      </UCard>

      <!-- Card 4: Pendapatan Hari Ini -->
      <UCard>
        <div class="bg-teal-700 text-white shadow-md p-6 rounded-lg">
          <h2 class="text-xl font-semibold">Pendapatan Hari Ini</h2>
          <p class="mt-2 text-2xl">Rp. 100.000</p>
        </div>
      </UCard>
    </div>

    <!-- Chart Section -->
    <div class="bg-white shadow-md p-8 rounded-lg flex flex-col gap-2">
      <!-- Add filters if needed -->
      <div class="mb-3 gap-24">
        <h3 class="text-center text-xl font-semibold">Statistik Omzet</h3>
      </div>
      <div>
          <button class="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2">Seluruh Kelas</button>
          <button class="bg-gray-700 text-white px-4 py-2 rounded-lg">Per Bulan</button>
        </div>
      <!-- Replace this placeholder div with your chart implementation -->
      <div class="h-90 bg-gray-200 flex items-center justify-center">
        <!-- You can integrate a charting library here like Chart.js -->
        <Bar :data="omzetChartData" :options="omzetChartOptions" />
      </div>
      
    </div>
  </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { Bar } from 'vue-chartjs';

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data: userData } = useAsyncData('userData', async () => {
  const { data, error } = await supabase.from('users').select('nama, role').eq('id', user.value.id).maybeSingle()
  if (error) throw error
  return data
})

//Bar Chart for Products
const omzetChartData = computed(() => {
  return {
    labels: ["agustus 2024", "September 2024", "Oktober 2024", "November 2024",
    "Desember 2024","Januari 2025","Fabuari 2025","Maret 2025","april 2025","Mei 2025","Juni 2025","Juli 2025"],
    datasets: [
      {
        label: "Omzet",
        backgroundColor: "#1C3D32",
        data: [1000, 800, 400, 870, 460,700,1400,900,700,870,790,590,700],
      },
    ],
  }
});

const omzetChartOptions = ref({
  title: {
    display: true,
    text: "Omzet Kantin SPW",
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  }
})

</script>

<style scoped>

</style>