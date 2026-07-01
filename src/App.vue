<template>
    <div id="app">
        <Navbar class="navbar" v-if="!$route.meta?.hideNavbar" />

        <div class="page-scroll" :class="{ 'no-scroll-mask': $route.name === 'home' }">
            <AppHeader class="header" v-if="!$route.meta?.hideHeader" />

            <main class="main-content">
                <RouterView />
            </main>

            <AppFooter v-if="!$route.meta?.hideFooter" />
        </div>
    </div>
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()

watch(
    () => route.meta.background,
    (background) => {
        document.body.classList.remove(
            'bg-home',
            'bg-tennis',
            'bg-volleyball'
        )
        document.body.classList.add(`bg-${background || 'home'}`)
    },
    // immediate: true zabezpečí, že sa správne pozadie nastaví už pri prvom načítaní stránky.
    { immediate: true }
)

</script>

<style scoped>
#app {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

/* FIXNÝ NAVBAR */
.navbar {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* SCROLL KONTAJNER */
.page-scroll {
    flex: 1;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    min-height: 0;

    /* fade efekt */
    mask-image: linear-gradient(to bottom,
            transparent 100px,
            black 180px,
            black 100%);
    -webkit-mask-image: linear-gradient(to bottom,
            transparent 100px,
            black 180px,
            black 100%);
}

.page-scroll.no-scroll-mask {
    mask-image: none;
    -webkit-mask-image: none;
}

/* HEADER */
.header {
    width: 100%;
    height: 200px;
    margin-top: 100px;
    margin-bottom: 40px;
}

/* HLAVNÝ OBSAH */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .header {
        height: 100px;
        margin-top: 11rem;
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