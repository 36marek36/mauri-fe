<template>
  <div v-if="flash.message" :class="['flash-message', flash.messageType]">
    {{ flash.message }}
  </div>
</template>

<script>
import { useFlashMessageStore } from '@/stores/flashMessage';

export default {
  name: 'FlashMessage',
  computed: {
    flash() {
      return useFlashMessageStore();
    }
  }
};
</script>

<style scoped>
.flash-message {
  padding: 12px 48px;
  border-radius: 5px;
  font-weight: 500;
  margin: 1rem auto;
  border: 1px solid transparent;
  max-width: 600px;
  width: fit-content;
  text-align: center;
  display: block;
  position: relative;
}

/* Ikona pred textom */
.flash-message::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background-image: url('/images/icon-ball.png');
  background-size: contain;
  background-repeat: no-repeat;
}

/* Ikona za textom */
.flash-message::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background-image: url('/images/icon-ball.png');
  background-size: contain;
  background-repeat: no-repeat;
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
</style>