<template>
  <button class="app-button" :class="buttonClass" @click="handleClick" :disabled="disabled" :type="htmlType">
    <span v-if="icon" class="icon">{{ icon }}</span>
    <span>{{ label }}</span>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    label: {
      type: String
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'default' // create, delete, edit, etc.
    },
    htmlType: {  // pre HTML atribút type tlačidla
      type: String,
      default: 'button'  // 'button', 'submit', 'reset'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    preventPropagation: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClass() {
      return `app-button--${this.type}`;
    }
  },
  methods: {
    handleClick(event) {
      if (this.preventPropagation) event.stopPropagation();
      this.$emit('clicked', event);
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
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.app-button:active {
  transform: scale(0.98);
  filter: brightness(0.95);
}

/* Ikony, ak ich používaš */
.app-button .icon {
  font-weight: bold;
}

/* CREATE button – zelený */
.app-button--create {
  background-color: #4CAF50;
  color: white;
}

.app-button--create:hover {
  background-color: #45a049;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
}

/* DELETE button – červený */
.app-button--delete {
  background-color: #f44336;
  color: white;
}

.app-button--delete:hover {
  background-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.3);
}

/* EDIT button – modrý */
.app-button--edit {
  background-color: #2196F3;
  color: white;
}

.app-button--edit:hover {
  background-color: #1976D2;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}

/* DEFAULT button – sivý s jemným žltým hoverom */
.app-button--default {
  background-color: #e0e0e0;
  color: #333;
}

.app-button--default:hover {
  background-color: #ffecb3;
  /* jemná žltá */
  color: #000;
  box-shadow: 0 0 0 3px rgba(255, 204, 128, 0.4);
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .app-button {
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    gap: 0.4rem;
  }

  .app-button .icon {
    font-size: 0.8rem;
  }
}
</style>