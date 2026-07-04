<template>
    <div id="app">

        <AppHeader class="header" v-if="!$route.meta?.hideHeader" />

        <div class="page-scroll" :class="{ 'no-scroll-mask': $route.name === 'home' }">

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

/* SCROLL KONTAJNER */
.page-scroll {
    flex: 1;
    overflow-y: auto;

    display: flex;
    flex-direction: column;

    /* fade efekt */
    mask-image: linear-gradient(to bottom,
            transparent 0px,
            black 20px,
            black 100%);
    -webkit-mask-image: linear-gradient(to bottom,
            transparent 0px,
            black 20px,
            black 100%);
}

.page-scroll.no-scroll-mask {
    mask-image: none;
    -webkit-mask-image: none;
}

/* HEADER */
.header {
    flex: 0 0 auto;
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
        margin-top: 1rem;
    }
}
</style>