<template>
  <div class="login-page">
    <LoginRegisterForm />
  </div>
</template>

<script>
import LoginRegisterForm from '@/components/LoginRegisterForm.vue'
import { useHeaderStore } from '@/stores/header';

export default {
  name: 'LoginView',
  data() {
    return {
      header: useHeaderStore()
    }
  },
  created() {
    this.header.setTitle('Prihlásenie','');
  },
  components: {
    LoginRegisterForm
  }
}
</script>
