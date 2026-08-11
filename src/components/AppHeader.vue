<template>
  <div class="header" :class="headerTheme">
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
import { useRoute } from 'vue-router';

export default {
  name: 'AppHeader',
  computed: {
    title() {
      return useHeaderStore().title
    },
    subtitle() {
      return useHeaderStore().subtitle
    },
    headerTheme() {
      const path = this.$route.path

      if (path.startsWith('/tennis')) {
        return 'tennis-header'
      }

      if (path.startsWith('/volleyball')) {
        return 'volleyball-header'
      }

      return ''
    }
  },
  components: { Navbar }
}
</script>

<style scoped>
.header {
  display: flex;
}

/* TENIS */
.tennis-header h1 {
  color: #ffffff;
  text-shadow: 4px 4px 3px #002E2C;
  font-weight: 300;
}

/* VOLEJBAL */
.volleyball-header h1 {
  color: #020100;
  text-shadow: 3px 3px 4px #ffd700;
}

.right-side {
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
  height: 65px;
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