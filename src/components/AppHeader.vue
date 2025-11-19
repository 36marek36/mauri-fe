<!-- <template>
  <div class="header">
    <div class="top-row">
      <div class="left"></div>

      <div class="headings">
        <h1>{{ title }}</h1>
        <h2 v-if="subtitle">{{ subtitle }}</h2>
      </div>
    </div>

    <div class="right">
      <FlashMessage v-if="hasFlashMessage" />
      <div v-else class="logo"></div>
    </div>
  </div>
</template> -->
<template>
  <div class="header">
    <Navbar />
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="header-wrapper">

        <div class="headings">
          <h1>{{ title }}</h1>
          <h2 v-if="subtitle">{{ subtitle }}</h2>
        </div>

        <div class="message">
          <FlashMessage v-if="hasFlashMessage" />
        </div>


      </div>

    </div>
  </div>

</template>


<script>
import { useHeaderStore } from '@/stores/header'
import { useFlashMessageStore } from '@/stores/flashMessage'
import FlashMessage from './FlashMessage.vue'
import Navbar from './Navbar.vue'

export default {
  name: 'AppHeader',
  components: { FlashMessage, Navbar },
  computed: {
    title() {
      return useHeaderStore().title
    },
    subtitle() {
      return useHeaderStore().subtitle
    },
    hasFlashMessage() {
      const flashStore = useFlashMessageStore()
      return flashStore.message.trim() !== ''
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  height: 250px;
}

.header-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

.headings {
  width: 60%;
  padding-top: 80px;
}

.message {
  width: 40%;
}


@media (max-width: 768px) {}
</style>

<!-- <template>
  <div class="header">
    <div class="top-row">
      <div class="left-side">
        <FlashMessage />
      </div>
      <div class="headings">
        <h1>{{ title }}</h1>
        <h2 v-if="subtitle">{{ subtitle }}</h2>
      </div>
    </div>
    <div class="right-side">
      <div class="logo"></div>
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
  padding: 100px 0 0 0;
}

.right-side {
  width: 25%;
  /* 25% z header */
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.logo {
  max-width: 250px;
  width: 40vw;
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
     padding: 70px 0 0 0;
  }

  .right-side {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style> -->