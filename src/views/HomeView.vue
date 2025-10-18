<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="rules">
        <h3>pravidlá:</h3>
        <div class="rules-area">
          <p ref="rulesText"></p>
        </div>
      </div>
      <LoginRegisterForm />
    </div>
  </div>
</template>

<script>
import LoginRegisterForm from '@/components/LoginRegisterForm.vue';
import { useHeaderStore } from '@/stores/header';
import { typeText } from '@/utils/typingEffect';
import { text } from '@/assets/rulesText';

export default {
  name: 'Home Page',
  data() {
    return {
      header: useHeaderStore()
    }
  },
  created() {
    this.header.setTitle('Vitajte', '')
  },
  mounted() {
    typeText(text, this.$refs.rulesText, 50); // môžeš upraviť rýchlosť
  },
  components: { LoginRegisterForm }
}

</script>

<style scoped>
.rules {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 30px;
  max-height: 500px;
}

.rules-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  font-family: 'Roboto', sans-serif;
  font-size: 1.3rem;
  color: #FFD700;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.5rem;
  border: 2px solid #ffffff40;
  box-shadow: 0 0 15px #FFD700;
  margin-top: 1rem;
}

.rules-area p {
  margin-bottom: 1rem;
  line-height: 1.6;
  /* text-align: justify; */
}

.rules-area::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .rules-area {
    font-size: 1.2rem;
  }
}
</style>