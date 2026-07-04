<template>
  <div class="header">
    <div class="left-side">
    </div>
    <div class="right-side">

      <Navbar class="navbar" />
      
      <div class="header-wrapper">

        <div class="headings">
          <h1>{{ title }}</h1>
          <h1 v-if="subtitle">{{ subtitle }}</h1>
        </div>

      </div>

    </div>
  </div>

</template>


<script>
import { useHeaderStore } from '@/stores/header'
import Navbar from './Navbar.vue';

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
  components: { Navbar }
}
</script>

<style scoped>
.header {
  display: flex;
}
.right-side{
  flex-direction: column;
}

.header-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.headings {
  width: 100%;
}

.navbar {
  z-index: 1000;
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* .second {
  width: 40%;
} */


@media (max-width: 768px) {
  .headings {
    width: 100%;
  }
}
</style>