<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import DatePicker from 'primevue/datepicker'

interface Props {
  id?: string
  label?: string
  modelValue: Date | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const internalValue = ref<Date | null>(props.modelValue ?? null)
const valueProxy = computed<Date | null>({
  get: () => internalValue.value,
  set: (val) => {
    internalValue.value = val
    emit('update:modelValue', val)
  },
})

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val ?? null
  }
)
</script>

<template>
  <DatePicker
    :id="id"
    ref="calendarRef"
    v-model="valueProxy"
    dateFormat="yy-mm-dd"
    showIcon
    placeholder="YYYY-MM-DD"
    class="small-datepicker"
    updateModelType="string"
    size="small"
    closeOnSelection
  />
</template>

<style scoped>
.small-datepicker {
  width: 15rem;
}
</style>
