<template>
  <div class="custom-select" :class="{ open: isOpen, disabled: disabled }" ref="selectRef">
    <div class="select-trigger" @click="toggle">
      <span class="select-value" :class="{ placeholder: !modelValue }">
        <span v-if="selectedOption?.icon" class="option-icon" v-html="selectedOption.icon"></span>
        {{ displayValue }}
      </span>
      <svg class="select-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <Transition name="dropdown">
      <div class="select-dropdown" v-if="isOpen">
        <div class="select-options">
          <div
            v-for="option in options"
            :key="option.value"
            class="select-option"
            :class="{ 
              selected: option.value === modelValue,
              disabled: option.disabled 
            }"
            @click="selectOption(option)"
          >
            <span v-if="option.icon" class="option-icon" v-html="option.icon"></span>
            {{ option.label }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  options: {
    type: Array,
    required: true,
    // [{ value: '', label: '', disabled?: boolean }]
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const selectRef = ref(null);

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return props.placeholder;
  }
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue);
});

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  if (option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (e) => {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-size: 14px;
  user-select: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-primary, #1e1f22);
  border: 1px solid var(--border-primary, #3d3f43);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
}

.custom-select:hover .select-trigger {
  border-color: var(--accent-color, #4a9eff);
}

.custom-select.open .select-trigger {
  border-color: var(--accent-color, #4a9eff);
  box-shadow: 0 0 0 2px var(--accent-light, rgba(74, 158, 255, 0.15));
}

.custom-select.disabled .select-trigger {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-select.disabled:hover .select-trigger {
  border-color: var(--border-primary, #3d3f43);
}

.select-value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary, #ffffff);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.placeholder {
  color: var(--text-placeholder, #6c6e73);
}

.select-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-secondary, #afb1b3);
  flex-shrink: 0;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.custom-select.open .select-arrow {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-secondary, #2b2d30);
  border: 1px solid var(--border-primary, #3d3f43);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
}

.select-options {
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
}

.select-options::-webkit-scrollbar {
  width: 6px;
}

.select-options::-webkit-scrollbar-track {
  background: transparent;
}

.select-options::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary, #3d3f43);
  border-radius: 3px;
}

.select-options::-webkit-scrollbar-thumb:hover {
  background: var(--border-secondary, #4a4c50);
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--text-secondary, #d4d4d4);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.option-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.select-option:hover {
  background: var(--bg-tertiary, #3d3f43);
  color: var(--text-primary, #ffffff);
}

.select-option.selected {
  background: var(--accent-color, #4a9eff);
  color: #ffffff;
}

.select-option.selected:hover {
  background: var(--accent-hover, #3d8fe8);
}

.select-option.disabled {
  color: var(--text-tertiary, #6c6e73);
  cursor: not-allowed;
}

.select-option.disabled:hover {
  background: transparent;
  color: var(--text-tertiary, #6c6e73);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
