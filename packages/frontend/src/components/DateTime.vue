<script setup lang="ts">
import { ref, watch } from 'vue'
import FlatPickr from 'vue-flatpickr-component'

interface Props {
  id?: string
  label?: string
  modelValue: string | Date | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string | Date | null): void }>()

// Internal reactive value to bind Flatpickr
const internalValue = ref(props.modelValue ?? '')

// Config for Flatpickr
const fpConfig = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i', // YYYY-MM-DD HH:MM
  time_24hr: true,
}

// Keep v-model in sync
watch(internalValue, (val) => {
  emit('update:modelValue', val)
})

// Watch prop in case parent updates
watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val ?? ''
  }
)
</script>

<template>
  <div class="form-group">
    <label :for="id">{{ label }}:</label>
    <FlatPickr
      :id="id"
      v-model="internalValue"
      :config="fpConfig"
      class="form-control"
      placeholder="YYYY-MM-DD HH:MM"
    />
  </div>
</template>

<style scoped>
.form-control {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>
