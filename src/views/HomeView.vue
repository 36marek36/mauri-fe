<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="rules">
        <h3>pravidlá:</h3>
        <div class="rules-area">
          <p>
            Handlovská tenisová liga je organizovaná jednokolovo, čo znamená, že každý hráč sa stretne s každým súperom
            iba raz. O konečnom poradí rozhoduje umiestnenie v tabuľke. Hráč na prvom mieste automaticky postupuje do
            vyššej ligy (najmä v mužskej časti súťaže). Pre hráčov na hranici postupu je pripravený barážový systém –
            zápasy, ktoré často rozhodujú o osude hráčov a ich zaradení v nasledujúcej sezóne.
          </p>

          <p>
            Zápasy sa odohrávajú na tradičnom antukovom povrchu, ktorý je obľúbený pre svoj pomalší charakter, no
            zároveň kladie vyššie nároky na techniku aj fyzickú kondíciu. Hráči musia byť pripravení na dlhé výmeny a
            náročné pohybové nasadenie, čo prináša atraktívny zážitok aj pre divákov. Liga prebieha každoročne od mája
            do septembra, pričom na jej konci prebieha vyhodnotenie sezóny.
          </p>

          <p>
            Prví traja hráči z každej ligy sú ocenení za svoje výkony a výsledky. Okrem týchto hlavných ocenení sa
            udeľujú aj špeciálne ceny – „Skokan sezóny“, „Skokanka sezóny“ a „Obdiv sezóny“, ktoré zvýrazňujú mimoriadne
            výkony alebo výnimočné momenty.
          </p>
          <p>
            A keďže má tenis v našom meste svoje pevné miesto, radi Vás privítame v areáli Hutira Relax Club, kde si
            tenis môžete skúsiť aj zahrať a následne si oddýchnuť pri vychladenom pive Baník od lokálneho výrobcu u nás
            v Mauribare.
          </p>
        </div>
      </div>
      <LoginRegisterForm />
    </div>
  </div>
</template>

<script>
import LoginRegisterForm from '@/components/LoginRegisterForm.vue';
import { useHeaderStore } from '@/stores/header';

export default {
  name: 'Home Page',
  data() {
    return {
      header: useHeaderStore()
    }
  },
  created() {
    this.header.setTitle('Vitajte', '')
  },
  components: { LoginRegisterForm }
}

</script>

<style scoped>

.rules {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 30px;
  max-height: 500px;
}

.rules-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  font-family: 'Roboto', sans-serif;
  font-size: 1.3rem;
  color: #FFD700;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.5rem;
  border: 2px solid #ffffff40;
  box-shadow: 0 0 15px #FFD700;
  margin-top: 1rem;
}

.rules-area p {
  margin-bottom: 1rem;
  line-height: 1.6;
  text-align: justify;
  /* voliteľné pre krajšie zalomenie */
}

.rules-area::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .rules-area {
    font-size: 1.2rem;
  }
}
</style>