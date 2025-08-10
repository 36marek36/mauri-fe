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
      <div class="spacer"></div>
      <div class="spacer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      default: '',
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  /* padding: 1rem; */
  /* gap: 1rem; */
}

.left-side,
.right-side {
  display: flex;
  gap: 0.5rem;
}

.logo,
.text,
.spacer {
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

.spacer {
  background-color: transparent;
  /* alebo napr. rgba(0,0,0,0.2) ak chceš niečo vidieť */
}

.headings {
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  /* zaber zvyšný priestor */
  min-width: 0;
  /* dôležité pre zalamovanie */
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .headings {
    align-items: center;
    text-align: center;
  }

  .right-side {
    display: none;
  }
}
</style>