<template>
    <div class="app-layout">
        <Navbar />

        <main class="main-content">
            <RouterView />
        </main>

    </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}


.main-content {
    flex-grow: 1;
    padding: 0 20px; /* 0 hore/dole, 20px vľavo/vpravo */
}

</style>