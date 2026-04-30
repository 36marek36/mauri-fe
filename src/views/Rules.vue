<template>
  <div class="main-layout">
    <div class="left-side">

    </div>
    <div class="right-side">
      <div class="list-or-nothing">
        <div class="hero-title">Pravidlá tenisovej ligy</div>
        <ul class="hero-list">
          <li>Povinnosť domáceho hráča je dohodnúť tenisový zápas.</li>
          <li>Po ukončení zápasu je nutné výsledok zapísať do rozpisu zápasov, ktorý je vyvesený v exteriérovom bare.
          </li>
          <li><strong>Výsledok je pre archiváciu nutné nahlásiť SMS správou alebo obsluhe v bare:</strong><br>
            <div class="text-center">
              <div class="sub-text">
                <strong>0905 878 476</strong>
              </div>
            </div>

          </li>
          <li>Poplatok za prenájom tenisového ihriska hradia súperi spoločne:
            <br>
            <div class="text-center">
              <div class="sub-text">
                <strong> 6€ / 1h </strong>pondelok - piatok do 12:00<br>
                <strong> 7€ / 1h </strong>pondelok - piatok po 12:00, víkendy a sviatky
              </div>

            </div>

          </li>
          <li>Zápasy sa odohrajú s tenisovými loptičkami (odporúčame DUNLOP), ktoré si súperi navzájom odsúhlasia.</li>
          <li>V prípade dlhodobého zranenia hráča sa anulujú výsledky všetkých jeho stretnutí.</li>
          <li>V prípade, že sa hráč zraní krátkodobo, zápas aj s výsledkom sa prekladá na nový termín.</li>
          <li>Ak rozohratý zápas ovplyvní počasie, hráči si dohodnú nový termín. Výsledok stretnutia bude pokračovať.
          </li>
          <li><strong>TIEBREAK</strong> je skrátená hra v tenise. Hrá sa za stavu 6:6. Na podaní je hráč, ktorý mal túto
            výhodu v
            predošlej hre (za stavu 6:5 resp. 5:6) a má k dispozícii 1 podanie. Ďalej sa pokračuje po 2 podaniach.
            Víťazom je ten hráč, ktorý sa svojmu súperovi vzdiali aspoň na 2 body a zároveň dosiahne 7 alebo viac bodov.
          </li>
          <li><strong>Platí len pre muži dvojhra: </strong>hráči umiestnení na prvej priečke 2. a 3. ligy postupujú o
            ligu vyššie. Hráči
            umiestnení na poslednom mieste 1. a 2. ligy zostupujú o ligu nižšie.</li>
          <li><strong>2. liga muži</strong>: každý hráč je povinný odohrať za jeden mesiac minimálne 3 zápasy, inak bude
            vyradený z
            ligy a jeho zápasy anulované.</li>
          <li>Po skončení každého zápasu sú hráči povinní upraviť tenisový kurt podľa predlohy zavesenej na tenisovom
            kurte.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'Rules'
}

</script>

<style scoped>
.right-side {
  display: flex;
  flex-direction: column;
  padding-top: 5rem;
}

.list-or-nothing {
  color: white;
}


.hero-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  width: 100%;
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

.sub-text {
  display: inline-block;
  margin: 0 auto;
  font-size: 0.95rem;
  border: 2px solid blanchedalmond;
  border-radius: 8px;
  padding: 4px 8px;
}

strong {
  font-weight: 700;
}


@media (max-width: 768px) {

  .hero-title {
    font-size: 1.2rem;
  }

  .hero-list {
    font-size: 0.9rem;
    padding: 10px;
  }

}
</style>