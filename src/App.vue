<template>
    <div class="app-layout">
        <Navbar />
        
        <Header />

        <main class="main-content">
            <RouterView />
        </main>

        <Footer />
    </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex-grow: 1;
    padding: 20px;
}
</style>