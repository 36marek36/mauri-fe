<template>
  <!-- <p v-if="message" class="flash-message">{{ message }}</p> -->

  <!-- <p v-if="message" :class="['flash-message', messageType]">{{ message }}</p> -->

  <!-- <div v-if="message" :class="['flash-message', messageType]">
    {{ message }}
  </div> -->

  <transition name="flash">
    <div v-if="message" :class="['flash-message', messageType]">
      {{ message }}
    </div>
  </transition>

</template>

<script>
export default {
  props: {
    message: String,
    messageType: {
      type: String,
      default: 'info'
    }
  }
};
</script>

<style scoped>
.flash-message {
  padding: 12px 16px;
  border-radius: 5px;
  font-weight: 500;
  margin: 1rem auto;
  border: 1px solid transparent;
  max-width: 600px;
  width: fit-content;
  text-align: center;
  display: block;
}

.flash-message.success {
  background-color: #d1fae5;
  color: #065f46;
  border-color: #10b981;
}

.flash-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #ef4444;
}

.flash-message.warning {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #facc15;
}

.flash-message.info {
  background-color: #e0f2fe;
  color: #0369a1;
  border-color: #38bdf8;
}

/* === Animácie === */
.flash-enter-active {
  animation: slideInFromLeft 0.6s ease-out forwards;
}

.flash-leave-active {
  animation: slideOutToRight 0.6s ease-in forwards;
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100vw);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100vw);
    opacity: 0;
  }
}
</style>