<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">

      <!-- LOADING -->
      <p v-if="loading">
        Načítavam posledné výsledky...
      </p>

      <!-- ERROR -->
      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div class="second">

      </div>

    </div>
  </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import api from '@/axios-interceptor';

export default {
  name: 'VolleyHomePage',
  data() {
    return {
      loading: false,
      errorMessage: '',
      header: useHeaderStore(),
      userStore: useUserStore()
    }
  },
  async created() {
    await this.userStore.fetchCurrentUser();

    this.initHeader();
  },

  methods: {

    initHeader() {
      if (!this.isLoggedIn) {
        this.header.setTitle('Handlovská', ' Beachvolejbalová liga');
        return;
      }

      const fullName = this.userStore.user?.playerName || '';

      const firstName = fullName.split(' ')[0];

      this.header.setTitle(
        'Handlovská beachvolejbalová liga','Vitaj '+
        firstName
      );
    }
  },

  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    }
  }
}

</script>

<style scoped>
.right-side {
  justify-content: center;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .right-side {
    flex-direction: column-reverse;
  }

  .second {
    width: 100%;
  }
}
</style>