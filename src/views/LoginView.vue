<template>
  <div class="login-page">
    <LoginRegisterForm @mode-changed="updateHeaderTitle" />
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
    this.updateHeaderTitle(true);
  },
  methods: {  
    updateHeaderTitle(isLogin) {
        if (isLogin) {
            this.header.setTitle('Prihlásenie', '')
        } else {
            this.header.setTitle('Registrácia', '')
        }
    },
  },
  components: {
    LoginRegisterForm
  }
}
</script>
