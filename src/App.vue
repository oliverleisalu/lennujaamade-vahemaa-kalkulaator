<script setup lang="ts">
import { computed, ref } from 'vue'
import AirportSelect from './components/AirportSelect.vue'

interface Airport {
  iata: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
}

const airportA = ref<Airport>()
const airportB = ref<Airport>()
const distance = ref<number | undefined>()

function calculateDistance() {
  const locationA =
    airportA.value?.lat && airportA.value?.lon
      ? { lat: airportA.value?.lat, lon: airportA.value?.lon }
      : undefined
  const locationB =
    airportB.value?.lat && airportB.value?.lon
      ? { lat: airportB.value?.lat, lon: airportB.value?.lon }
      : undefined

  const calculatedDistance = calculateDistanceHaversine(locationA, locationB)

  if (calculatedDistance !== undefined) {
    distance.value = calculatedDistance
  }
}

function calculateDistanceHaversine(
  locationA: { lat: number; lon: number } | undefined,
  locationB: { lat: number; lon: number } | undefined
) {
  if (locationA === undefined || locationB === undefined) return

  const earthRadiusKm = 6371
  const lat1 = locationA.lat
  const lon1 = locationA.lon
  const lat2 = locationB.lat
  const lon2 = locationB.lon

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = Number((earthRadiusKm * c).toFixed(1))

  return distance
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const airportAString = computed(() => airportA.value?.name)
const airportBString = computed(() => airportB.value?.name)
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 px-4 space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">Lennujaamade vahemaa kalkulaator</h1>
    <div class="flex gap-2">
      <AirportSelect
        :modelValue="airportA"
        @update:modelValue="(value) => (airportA = value)"
        @clear="() => (distance = 0)"
      />
      <AirportSelect
        :modelValue="airportB"
        @update:modelValue="(value) => (airportB = value)"
        @clear="() => (distance = 0)"
      />
      <button
        @click="() => calculateDistance()"
        class="bg-teal-600 text-white whitespace-nowrap px-6 font-semibold shadow-md hover:bg-teal-700 transition-colors text-sm"
      >
        Arvuta vahemaa
      </button>
    </div>
    <div class="text-lg">
      <div v-if="airportAString && airportBString && distance">
        Vahemaa {{ airportAString }} ja {{ airportBString }} vahel on {{ distance }} kilomeetrit.
      </div>
    </div>
  </div>
</template>
