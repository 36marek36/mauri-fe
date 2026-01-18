<template>
    <div id="app">
        <Navbar class="navbar" />

        <AppHeader class="header" v-if="!$route.meta?.hideHeader" />

        <main class="main-content">
            <RouterView />
        </main>

        <AppFooter />

    </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
</script>

<style scoped>
#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.navbar {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.header {
    width: 100%;
    height: 200px;
    margin-top: 100px;
}

.main-content {
    flex-grow: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
}
</style>