<template>
  <button
    class="app-button"
    :class="buttonClass"
    @click.stop="handleClick"
    :disabled="disabled"
    type="button"
  >
    <span v-if="icon" class="icon">{{ icon }}</span>
    <span>{{ label }}</span>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'default' // create, delete, edit, etc.
    },
    disabled: {
      type: Boolean,
      default: false
    },
    onClick: {
      type: Function,
      default: null
    }
  },
  computed: {
    buttonClass() {
      return `app-button--${this.type}`;
    }
  },
  methods: {
    handleClick(event) {
      if (this.onClick) {
        this.onClick(event);
      }
    }
  }
}
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.app-button .icon {
  font-weight: bold;
}

.app-button--create {
  background-color: #4CAF50;
  color: white;
}
.app-button--delete {
  background-color: #f44336;
  color: white;
}
.app-button--edit {
  background-color: #2196F3;
  color: white;
}
.app-button--default {
  background-color: #e0e0e0;
  color: #333;
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>