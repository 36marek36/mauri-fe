<template>
  <div class="header">
    <div class="top-row">
      <div class="left-side">
        <div class="logo"></div>
      </div>
      <div class="headings">
        <h1>{{ title }}</h1>
        <h2 v-if="subtitle">{{ subtitle }}</h2>
      </div>
    </div>
    <div class="right-side">
      <FlashMessage />
    </div>
  </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header'
import FlashMessage from './FlashMessage.vue';

export default {
  name: 'AppHeader',
  computed: {
    title() {
      return useHeaderStore().title
    },
    subtitle() {
      return useHeaderStore().subtitle
    }
  },
  components: { FlashMessage }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 0 2rem;
}

.top-row {
  display: flex;
  width: 75%;
  /* align-items: flex-start; */
}

.left-side {
  width: 25%;
  /* 25% z top-row → 18.75% z header */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.headings {
  width: 75%;
  /* 75% z top-row → 56.25% z header */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: center;
  min-width: 200px;
}

.right-side {
  width: 25%;
  /* 25% z header */
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.logo {
  max-width: 320px;
  width: 20vw;
  aspect-ratio: 1 / 1;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url('/images/logo.png');
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    /* alebo center, podla potreby */
  }

  .top-row {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .left-side,
  .headings {
    width: 50%;
    justify-content: center;
    text-align: center;
  }

  .right-side {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>