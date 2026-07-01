<template>
    <div class="split-screen">
        <div class="panel top" @click="goToVolleyball">
            <img src="/images/volley.jpg" alt="Volleyball">

            <div class="overlay">
                <h2>VOLEJBAL</h2>
            </div>
        </div>

        <div class="panel bottom" @click="goToTennis">
            <img src="/images/tennis.jpg" alt="Tennis">

            <div class="overlay">
                <h2>TENIS</h2>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    methods: {
        goToTennis() {
            this.$router.push({ name: 'TennisHome' })
        },
        goToVolleyball() {
            alert('Volleyball stránka sa pripravuje ⚡')
        },
    }
}


</script>

<style scoped>
.split-screen {
    width: min(1400px, calc(100% - 4rem));
    height: calc(100vh - 4rem);

    margin: 2rem auto;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.panel {
    flex: 1;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    border-radius: 20px;
}

.panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    border-radius: 20px;

    filter: brightness(.8);
    transition: transform .5s ease, filter .3s ease;
}

.panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(.8);
    transition: transform .5s ease, filter .3s ease;
}

.panel:hover img {
    transform: scale(1.05);
    filter: brightness(1);
}

.split-screen:has(.bottom:hover) .top img {
    filter: brightness(.35);
}

.split-screen:has(.top:hover) .bottom img {
    filter: brightness(.35);
}

.overlay {
    position: absolute;
    inset: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    padding: 1rem;

    background: linear-gradient(to top,
            rgba(0, 0, 0, .75),
            rgba(0, 0, 0, .25),
            transparent);

    z-index: 20;
}

.overlay h2 {
    margin: 0;

    color: white;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: 3px;
}

@media (max-width: 768px) {
    .split-screen {
        width: calc(100% - 2rem);
        height: calc(100vh - 2rem);

        margin: 1rem auto;
        gap: .5rem;
    }

    .panel,
    .panel img {
        border-radius: 12px;
    }

    .bottom img {
        object-position: 15% center;
    }
}
</style>