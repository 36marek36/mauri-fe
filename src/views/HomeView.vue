<template>
  <div class="logo-wrapper">
    <img src="/images/logo.png" alt="Logo" class="logo" />
  </div>
</template>

<script>
</script>

<style scoped>
.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}

@media (max-width: 768px) {
  .logo {
    width: 80vw;
  }
}
</style>