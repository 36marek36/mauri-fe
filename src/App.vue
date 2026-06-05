<template>
    <div id="app">
        <Navbar class="navbar" />

        <div class="page-scroll">
            <AppHeader class="header" v-if="!$route.meta?.hideHeader" />

            <main class="main-content">
                <RouterView />
            </main>

            <AppFooter />

        </div>

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

.page-scroll {
    height: 100vh;
    overflow-y: auto;

    mask-image: linear-gradient(to bottom,
            transparent 100px,
            black 150px,
            black 100%);

    -webkit-mask-image: linear-gradient(to bottom,
            transparent 100px,
            black 150px,
            black 100%);
}

.header {
    width: 100%;
    height: 200px;
    margin-top: 100px;
}

.main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

@media (max-width: 768px) {
    .header {
        height: 100px;
        margin-top: 175px;
    }

    .page-scroll {
        mask-image: linear-gradient(to bottom,
                transparent 160px,
                black 210px,
                black 100%);

        -webkit-mask-image: linear-gradient(to bottom,
                transparent 160px,
                black 210px,
                black 100%);
    }
}
</style>