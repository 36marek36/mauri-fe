<template>
  <div class="header" :class="headerTheme">
    <div class="left-side">
    </div>
    <div class="right-side">

      <!-- Header + Navbar -->
      <div class="header-content">

        <Navbar class="navbar" />

        <div class="header-wrapper">
          <div class="headings">
            <h1>{{ title }}</h1>
            <h1 v-if="subtitle">{{ subtitle }}</h1>
          </div>
        </div>

      </div>
      <div class="message">
        <FlashMessage v-if="hasFlashMessage" />
      </div>
    </div>
  </div>

</template>


<script>
import { useHeaderStore } from '@/stores/header'
import Navbar from './Navbar.vue';
import FlashMessage from './FlashMessage.vue';
import { useFlashMessageStore } from '@/stores/flashMessage.js';
// import { useRoute } from 'vue-router';

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
    },
    hasFlashMessage() {
      const flashStore = useFlashMessageStore()
      return flashStore.message.trim() !== ''
    },
  },
  components: { Navbar, FlashMessage }
}
</script>

<style scoped>
.header {
  display: flex;
}
.right-side{
  flex-direction: column;
}

.header-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.header-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.headings {
  width: 100%;
  line-height: 1.3;
}

.navbar {
  z-index: 1000;
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message {
  display: flex;
  justify-content: center;
  z-index: 3000;
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

/* .second {
  width: 40%;
} */


@media (max-width: 768px) {

  .header-content {
    flex-direction: row;
    align-items: stretch;
  }


  .header-wrapper {
    order: 1;
    width: 80%;
  }

  .navbar {
    order: 2;
    width: 20%;
  }

  .headings {
    width: 100%;
  }
}
</style>