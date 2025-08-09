<template>
  <!-- <p v-if="message" class="flash-message">{{ message }}</p> -->
  <p v-if="message" :class="['flash-message', messageType]">{{ message }}</p>
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
  opacity: 1;
  transition: opacity 0.5s ease;
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

/* .flash-message {
  background-color: #fef3c7;
  color: #92400e; 
  padding: 12px 16px;
  margin: 1rem 0;
  border: 1px solid #facc15;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  transition: all 0.3s ease;
} */
</style>