<template>
    <div class="page">

        <!-- =====================================================
             INTRO
        ====================================================== -->

        <div v-if="showIntro" class="intro" :class="{ 'intro-exit': introExit }">

            <!-- obsah intra -->
            <div class="intro-content">

                <div>
                    <img src="/images/lg_mauri.png" alt="Malá mestská liga" class="intro-logo" />
                </div>

                <div class="intro-title">
                    <span>MAURI.SK</span>
                </div>

                <div class="intro-line"></div>

            </div>

        </div>


        <!-- =====================================================
             SPORT SELECTION
        ====================================================== -->

        <main class="split-screen">

            <!-- VOLEJBAL -->
            <div class="panel panel-volleyball" @click="goToVolleyball">

                <img src="/images/volley.jpg" alt="Volejbal" />

                <div class="overlay">

                    <div class="sport-name">
                        VOLEJBAL
                    </div>

                    <div class="sport-action">
                        <span>VSTÚPIŤ</span>
                        <span class="arrow">→</span>
                    </div>

                </div>
            </div>


            <!-- TENIS -->
            <div class="panel panel-tennis" @click="goToTennis">

                <img src="/images/tennis.jpg" alt="Tenis" />

                <div class="overlay">

                    <div class="sport-name">
                        TENIS
                    </div>

                    <div class="sport-action">
                        <span>VSTÚPIŤ</span>
                        <span class="arrow">→</span>
                    </div>

                </div>
            </div>

        </main>

    </div>
</template>


<script>
export default {

    data() {
        return {
            showIntro: true,
            introExit: false
        }
    },

    mounted() {

        /*
         * 0.0s  - logo
         * 0.4s  - názov
         * 0.7s  - čiara
         * 2.2s  - začiatok odchodu
         * 4.0s  - intro úplne preč
         */

        setTimeout(() => {
            this.introExit = true
        }, 2200)

        setTimeout(() => {
            this.showIntro = false
        }, 4000)
    },

    methods: {

        goToTennis() {
            this.$router.push({
                name: 'TennisHome'
            })
        },

        goToVolleyball() {
            this.$router.push({
                name: 'VolleyballHome'
            })
        }

    }
}
</script>


<style scoped>
/* =========================================================
   PAGE
========================================================= */

.page {
    min-height: 100vh;
    background: #0b0b0b;
}


/* =========================================================
   INTRO
========================================================= */

.intro {
    position: fixed;
    inset: 0;

    z-index: 9999;

    overflow: hidden;

    background: #0b0b0b;
}


/* =========================================================
   INTRO CONTENT
========================================================= */

.intro-content {
    position: absolute;

    inset: 0;

    z-index: 5;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    color: white;

    pointer-events: none;
}


/* =========================================================
   LOGO
========================================================= */

.intro-logo {
    width: min(400px, 65vw);
    height: auto;

    opacity: 0;

    animation:
        logoAppear .7s .1s ease forwards;
}


@keyframes logoAppear {

    0% {
        opacity: 0;
        transform: scale(.75);
    }

    60% {
        opacity: 1;
        transform: scale(1.04);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}


/* =========================================================
   TITLE
========================================================= */

.intro-title {
    display: flex;

    gap: .45rem;

    margin-top: 1.4rem;

    color: rgba(255, 255, 255, .9);

    font-size: clamp(.7rem, 1.5vw, 1rem);

    font-weight: 600;

    letter-spacing: 5px;

    opacity: 0;

    transform: translateY(12px);

    animation:
        titleIntro .7s .45s ease forwards;
}


.intro-title span {
    display: inline-block;
}


@keyframes titleIntro {

    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}


/* =========================================================
   LINE
========================================================= */

.intro-line {
    width: 0;
    height: 2px;

    margin-top: 1rem;

    background: white;

    opacity: .8;

    animation:
        lineIntro 1.8s .75s ease forwards;
}


@keyframes lineIntro {

    from {
        width: 0;
    }

    to {
        width: 120px;
    }
}


/* =========================================================
   INTRO CONTENT EXIT
========================================================= */

.intro-exit {
    animation:
        contentExit 1.5s ease forwards;
}


@keyframes contentExit {

    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(3.0);
    }
}


/* =========================================================
   MAIN SPLIT SCREEN
========================================================= */

.split-screen {
    width: min(1400px, calc(100% - 4rem));
    height: calc(100vh - 4rem);

    margin: 2rem auto;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    /*
     * Panely sú na stránke od začiatku,
     * ale intro ich prekryje.
     */

    animation:
        screenAppear .9s .2s ease both;
}


@keyframes screenAppear {

    from {
        opacity: 0;
        transform: scale(.97);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}


/* =========================================================
   PANEL
========================================================= */

.panel {
    position: relative;

    flex: 1;

    overflow: hidden;

    cursor: pointer;

    border-radius: 20px;

    transform: translateZ(0);
}


.panel img {
    width: 100%;
    height: 100%;

    object-fit: cover;

    border-radius: 20px;

    filter: brightness(.85);

    transition:
        transform .7s cubic-bezier(.2, .8, .2, 1),
        filter .45s ease;
}


/* =========================================================
   HOVER
========================================================= */

.panel:hover img {
    transform: scale(1.06);

    filter: brightness(1.1);
}


/*
 * Ak hoverneš jeden šport,
 * druhý sa stmaví.
 */

.split-screen:has(.panel-volleyball:hover) .panel-tennis img {
    filter: brightness(.32);
}


.split-screen:has(.panel-tennis:hover) .panel-volleyball img {
    filter: brightness(.32);
}


/* =========================================================
   OVERLAY
========================================================= */

.overlay {
    position: absolute;

    inset: 0;

    z-index: 10;

    display: flex;
    flex-direction: column;

    justify-content: flex-end;

    padding: 1.5rem 2rem;

    background:
        linear-gradient(to top,
            rgba(0, 0, 0, .85),
            rgba(0, 0, 0, .25) 55%,
            transparent);
}


/* =========================================================
   SPORT NAME
========================================================= */

.sport-name {
    color: white;

    font-size: clamp(2rem, 4vw, 3.5rem);

    font-weight: 800;

    letter-spacing: 4px;

    line-height: 1;

    transition:
        transform .45s ease,
        letter-spacing .45s ease;
}


.panel:hover .sport-name {
    transform: translateX(6px);

    letter-spacing: 6px;
}


/* =========================================================
   ACTION
========================================================= */

.sport-action {
    display: flex;
    align-items: center;

    gap: .7rem;

    margin-top: .7rem;

    color: rgba(255, 255, 255, .75);

    font-size: .65rem;

    letter-spacing: 3px;

    opacity: .75;

    transition:
        opacity .3s ease,
        transform .3s ease;
}


.arrow {
    font-size: 1rem;

    transition:
        transform .3s ease;
}


.panel:hover .sport-action {
    opacity: 1;

    transform: translateX(5px);
}


.panel:hover .arrow {
    transform: translateX(5px);
}


/* =========================================================
   MOBILE
========================================================= */

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

    .panel-tennis img {
        object-position: 15% center;
    }


    .overlay {
        padding: 1rem;
    }


    .sport-name {
        font-size: 2rem;
        letter-spacing: 2px;
    }

    .intro-title {
        gap: .3rem;

        font-size: 1rem;

        letter-spacing: 3px;
    }


    /*
     * Na mobile vypneme stmavenie
     * druhého obrázka.
     */

    .split-screen:has(.panel-volleyball:hover) .panel-tennis img,
    .split-screen:has(.panel-tennis:hover) .panel-volleyball img {
        filter: brightness(.85);
    }

}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
    }

}
</style>