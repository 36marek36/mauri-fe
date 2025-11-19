<template>
    <div id="app">
        <!-- <Navbar /> -->

        <AppHeader v-if="!$route.meta?.hideHeader" />

        <main class="main-content">
            <RouterView />
        </main>

        <AppFooter/>

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

.main-content {
    flex-grow: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
}
</style>