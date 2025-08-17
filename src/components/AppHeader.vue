<template>
  <div class="header">
    <div class="left-side">
      <div class="logo"></div>
      <div class="text"></div>
    </div>

    <div class="headings">
      <h1>{{ title }}</h1>
      <h2 v-if="subtitle">{{ subtitle }}</h2>
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
  align-items: stretch;
  justify-content: space-between;
  padding: 0 2rem;
}

.left-side,
.headings,
.right-side {
  display: flex;
  align-items: center;
}

.left-side {
  width: 25%;
  gap: 0.5rem;
}

.headings {
  width: 50%;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  min-width: 200px;
}

.right-side {
  width: 25%;
  justify-content: flex-end;
}

.logo,
.text {
  max-width: 150px;
  width: 20vw;
  aspect-ratio: 1 / 1;
  background-size: contain;
  background-repeat: no-repeat;
}

.logo {
  background-image: url('/images/logo.png');
}

.text {
  background-image: url('/images/text.png');
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .left-side,
  .headings,
  .right-side {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .headings {
    margin-bottom: 0.5rem;
  }
}
</style>