<template>
  <div class="header">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="header-wrapper">

        <div class="headings">
          <h1 class="text">{{ title }}</h1>
          <h2 class="text" v-if="subtitle">{{ subtitle }}</h2>
        </div>

        <div class="second">

        </div>


      </div>

    </div>
  </div>

</template>


<script>
import { useHeaderStore } from '@/stores/header'

export default {
  name: 'AppHeader',
  computed: {
    title() {
      return useHeaderStore().title
    },
    subtitle() {
      return useHeaderStore().subtitle
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
}

.header-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.headings {
  width: 60%;
}

.second {
  width: 40%;
}


@media (max-width: 768px) {
  .headings{
    width: 100%;
  }
  .text {
    text-align: right;
    padding-right: 2rem;
  }
  .second{
    display: none;
  }
}
</style>