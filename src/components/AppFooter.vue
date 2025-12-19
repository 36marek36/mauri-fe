<template>
  <div class="footer">
    <div class="logo" v-for="(logo, index) in logos" :key="index" :style="{ backgroundImage: `url(${logo})` }"></div>
  </div>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      logos: [
        '/images/logo.png',
        '/images/lg_mauri.png'
      ]
    }
  }
}
</script>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px 0;
}

.logo {
  display: flex;
  max-width: 250px;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-size: contain;
  background-repeat: no-repeat;
  filter: drop-shadow(0 4px 20px rgba(238, 128, 3, 0.922));
}
</style>