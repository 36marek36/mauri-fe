<template>
  <div class="footer">
     <span class="text">© 2026 Mauri.sk</span>
     <span class="text">Web vytvoril a prevádzkuje Marek Krnčok</span>
  </div>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  height: 60px;
  padding: 5px 20px;
}
.text{
color: #cae5ff;
/* font-size: 14px; */
}

@media (max-width: 768px){
  .text{
    font-size: 0.8rem;
  }
}

</style>