<!-- <template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
    </div>
  </div>
  <div class="bottom-text">
    <a href="https://www.facebook.com/profile.php?id=100034650532111" target="_blank" class="facebook-link">
      <img src="/images/facebook.png" alt="Facebook" />
    </a>
    <h3>29.augusta 92, Handlová</h3>
  </div>
</template> -->

<template>
  <div class="main-layout">
    <div class="left-side">

    </div>
    <div class="right-side">
      <div class="list-or-nothing">
        <div class="hero-title">Handlovská tenisová liga</div>
        <div class="hero-subtitle">Tenis, ktorý spája ľudí, mestá a príbehy</div>

        <div class="hero-list">
          <p>Handlovská tenisová liga vznikla v roku 2020 ako sen niekoľkých tenisových nadšencov v Handlovej. To, čo sa
            spočiatku zdalo len ako odvážna myšlienka, sa vďaka vôli, nadšeniu a priateľstvu rýchlo zmenilo na realitu.
            Už
            v máji 2020 odštartoval prvý ročník a začal sa písať príbeh ligy, ktorá dnes patrí medzi stabilné a
            rešpektované amatérske tenisové súťaže v regióne.</p>
          <p>
            Prvé ročníky sa odohrávali na kurtoch s tenisovým kobercom, no v roku 2022 prišla veľká výzva –
            <strong>kompletná rekonštrukcia troch tenisových kurtov.</strong> Všetko vlastnými silami. Tenisti sami
            odstránili staré povrchy, vyrovnali podklad a naviezli takmer <strong> 40 ton antuky.</strong> Výsledkom sú
            kurty, ktoré dnes patria medzi <strong>
              najkvalitnejšie a najkrajšie v okrese.
            </strong>
          </p>
          <p>Každým rokom liga rastie – počtom hráčov, kvalitou aj športovou úrovňou. <strong>Aktuálne má Handlovská
              tenisová liga už viac ako 60 aktívnych hráčov.</strong>
          </p>
          <p>
            V roku 2026 odštartuje už <strong>7. ročník,</strong>do ktorého sa okrem Handlovej pravidelne zapájajú aj
            tenisti z <strong>Prievidze, Novák, Žiaru nad Hronom, Žarnovice, Kremnice či Ráztočna.</strong>
          </p>
          <p>
            Naša vášeň pre tenis presahuje bežné hranice. Dôkazom je aj <strong>certifikát za organizáciu Handlovského
              tenisového maratónu,</strong> ktorý sa 12. septembra 2021 hral neuveriteľných <strong>24 hodín bez
              prerušenia.</strong>
          </p>
          <p>Ak miluješ tenis, fair play a komunitu skvelých ľudí, <strong>budeme radi, ak sa staneš súčasťou našej
              tenisovej rodiny.</strong></p>
        </div>
      </div>
      <div class="list-or-nothing">
        <div class="contact-info">
          <p>
            Nájdete nás na adrese:
            <a href="https://www.google.com/maps/search/?api=1&query=29.augusta+92+Handlová" target="_blank"
              class="address-link">
              29.augusta 92, Handlová
            </a>
          </p>
          <p> Kontakty 📞 </p>
          <div class="phones">
            <a href="tel:0905542596" class="phone-link">
              <span>Tenisová liga: p.Uríček</span>
              <span>0905 542 596</span></a>
            <a href="tel:0905878476" class="phone-link">
              <span>Objednávky športovísk:</span>
              <span>0905 878 476</span></a>
          </div>


          <p>
            Pre viac informácií sledujte náš
            <a href="https://www.facebook.com/profile.php?id=100034650532111" target="_blank" rel="noopener noreferrer"
              class="facebook-link">
              <img src="/images/facebook.png" alt="Facebook" />
            </a>
            acebook
          </p>
          <br>
          <div class="credits">
            © 2026 – Vytvoril a prevádzkuje Marek Krnčok
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'About Us'
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

.contact-info {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  color: #f5eeee;
  font-size: 1.3rem;
  width: 100%;
  text-align: center;
  justify-content: center;
}

.address-link {
  text-decoration: none;
  color: inherit;
  font-size: 1.4rem;
  filter: drop-shadow(0 4px 5px rgb(255, 0, 0));
}

.credits {
  font-size: 0.75rem;
  opacity: 0.8;
}

.credits a {
  font-size: 0.8rem;
  color: #f5eeee;
}

.facebook-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.facebook-link img {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.2s ease;
  filter:
    drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))
    /* biele halo */
    drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
    /* širšie halo */
    drop-shadow(0 2px 4px rgba(0, 26, 255, 0.5));
  /* modrý tieň */
}

.facebook-link img:hover {
  transform: scale(1.5);
  filter:
    drop-shadow(0 0 6px rgba(255, 255, 255, 1)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) drop-shadow(0 4px 8px rgba(0, 26, 255, 0.7));
}

.hero-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  width: 100%;
}

.hero-subtitle {
  text-align: center;
  font-size: 1.3rem;
  opacity: 0.8;
  width: 100%;
}

.hero-list {
  text-align: center;
  list-style: none;
  padding: 30px 5%;
}

.phones {
  display: flex;
  flex-direction: column;
}

.phone-link {
  display: flex;
  flex-direction: column;
}

strong {
  font-weight: 700;
}

@media (max-width: 768px) {

  .hero-title {
    font-size: 1.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-list {
    font-size: 0.9rem;
    padding: 10px;
  }

  .contact-info {
    font-size: 20px;
    padding-right: 1px;
  }

  .address-link {
    font-size: 1em;
  }
}
</style>