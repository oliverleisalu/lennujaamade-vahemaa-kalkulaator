<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
  ComboboxButton
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import Papa from 'papaparse'

export interface Airport {
  iata: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
}

const filteredAirports = ref<Array<Airport>>()

const props = defineProps<{
  modelValue: Airport | undefined
}>()

const emit = defineEmits(['update:modelValue', 'clear'])

const query = ref('')

const selectedAirport = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('clear')
    emit('update:modelValue', value)
  }
})

function filterAirports(data: Array<Airport>) {
  // const searchWords = query.value.split(' ')

  return data
    .filter((airport) => {
      return (
        airport.iata.toUpperCase().includes(query.value.toUpperCase().trim()) ||
        airport.name.toUpperCase().includes(query.value.toUpperCase().trim()) ||
        airport.city.toUpperCase().includes(query.value.toUpperCase().trim()) ||
        airport.country.toUpperCase().includes(query.value.toUpperCase().trim())
      )
      /* return searchWords.some(
        (word) =>
          airport.iata.toUpperCase().includes(word.toUpperCase()) ||
          airport.name.toUpperCase().includes(word.toUpperCase()) ||
          airport.city.toUpperCase().includes(word.toUpperCase()) ||
          airport.country.toUpperCase().includes(word.toUpperCase())
      ) */
    })
    .slice(0, 15)
}

async function fetchData() {
  try {
    const response = await fetch('/airport_data.csv')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const csvData = await response.text()

    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true, // Automatically parse numbers and booleans
      complete: (result: { data: any }) => {
        filteredAirports.value = filterAirports(result.data)
      },
      error: (error: { message: any }) => {
        console.error('CSV to JSON conversion error:', error.message)
      }
    })
  } catch (error: any) {
    console.error('Error fetching or parsing CSV file:', error.message)
  }
}

watch(query, () => {
  fetchData()
})

onMounted(() => fetchData())
</script>

<template>
  <Combobox v-model="selectedAirport">
    <div class="relative w-full">
      <div
        class="relative w-full cursor-default overflow-hidden font-semibold bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
      >
        <ComboboxInput
          class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
          :displayValue="(airport: any) => airport.name"
          @change="query = $event.target.value"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <div
            v-if="filteredAirports && filteredAirports.length === 0 && query !== ''"
            class="relative cursor-default select-none py-2 px-4 text-gray-700"
          >
            Tulemusi ei leitud.
          </div>

          <ComboboxOption
            v-for="(airport, index) in filteredAirports"
            as="template"
            :key="index"
            :value="airport"
            v-slot="{ selected, active }"
          >
            <li
              class="relative cursor-default select-none py-2 pl-10 pr-4"
              :class="{
                'bg-teal-600 text-white': active,
                'text-gray-900': !active
              }"
            >
              <span
                class="block truncate"
                :class="{ 'font-medium': selected, 'font-normal': !selected }"
              >
                {{ airport.name }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-teal-600': !active }"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </div>
  </Combobox>
</template>
