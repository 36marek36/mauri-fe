<template>
    <div class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="list-or-nothing">
                <ul class="hero-list">
                    <li>Hrá sa 3x3.</li>
                    <li>Striedanie je povolené po každom sete.</li>
                    <li>Hrá sa na 3 víťazné sety. Každý sa hrá do 21 bodov.</li>
                    <li>V každom sete musí mužstvo vyhrať rozdielom 2 bodov.</li>
                    <li>Systém bodovania:
                        <div class="text-center">
                                <strong>bod získava tím pri každom podaní bez ohľadu na to, kto podáva.</strong>
                        </div>
                    </li>
                    <li>Blok sa počíta ako jeden dotyk (teda po úspešnom bloku zostávajú dva dotyky).</li>
                    <li>Príjem podania je povolený aj prstami.</li>
                    <li>Prehodenie cez sieť NESMIE byť prstami.</li>
                    <li>Hráči na ihrisku sa musia striedať pri podaní.</li>
                    <li>Hráči môžu hrať celý zápas na tom istom poste.</li>
                    <li>Príjem z podania môže byť prehodený prvým dotykom cez sieť (nesmie ho však blokovať hráč na sieti). </li>
                    <li>Tím môže urobiť maximálne 3 dotyky.</li>
                    <li>Dotyk siete počas hry je chyba.</li>
                    <li>Bodovanie do tabuľky:
                        <div class="text-center">
                            <strong>Pri výhre 3:0 alebo 3:1 získava víťazný tím 3 body a porazený tím 0 bodov.</strong><br>
                            <strong>Pri výhre 3:2 sa body delia: 2 body pre víťazný tím a 1 bod pre porazený.</strong>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'VolleyRules',
    data() {
        return {
            header: useHeaderStore()
        }
    },
    created() {
        this.header.setTitle('Pravidlá', 'Beachvolejbalovej ligy')
    }
}

</script>

<style scoped>
.right-side {
    display: flex;
    flex-direction: column;
    /* padding-top: 12rem; */
}

.list-or-nothing {
    color: white;
}


.hero-list {
    list-style: none;
    padding: 10px;
    margin-top: 10px;
}

.hero-list li {
    position: relative;
    padding-left: 22px;
    margin-bottom: 8px;
}

.hero-list li::before {
    content: "✔";
    position: absolute;
    left: 0;
    color: #d9ff00;
}

.text-center {
    text-align: center;
    padding: 10px
}

@media (max-width: 768px) {

    .hero-list {
        font-size: 0.9rem;
        padding: 10px;
    }

}
</style>