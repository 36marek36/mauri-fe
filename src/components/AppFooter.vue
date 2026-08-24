<template>
  <div class="footer">
    <span class="text">© 2026 Mauri.sk</span>
    <span @click.prevent="showMyDetails = true" class="myDetails">Web vytvoril a prevádzkuje Marek Krnčok</span>


    <div v-if="showMyDetails" class="modal-overlay" @click.self="showMyDetails = false">
      <div class="modal my-details-modal">

        <p class="developer-name">
          Marek Krnčok
        </p>

        <p class="developer-description">
          Tento web som navrhol a vytvoril s cieľom priniesť
          jednoduchý a prehľadný spôsob sledovania výsledkov.
        </p>

        <p class="developer-description">
          V prípade akýchkoľvek otázok, podnetov alebo nejasností
          ma môžete kontaktovať:
        </p>

        <div class="developer-contact">

          <a href="https://wa.me/421918351969" target="_blank" rel="noopener noreferrer" class="contact-link">
            <span>💬</span>
            WhatsApp
          </a>

          <a href="mailto:krncok36@gmail.com" class="contact-link">
            <span>✉️</span>
            E-mail
          </a>

          <a href="https://www.facebook.com/marek.krncok" target="_blank" rel="noopener noreferrer" class="contact-link">
            Facebook
          </a>

        </div>

        <AppButton label="Zavrieť" @clicked="showMyDetails = false" />

      </div>
    </div>
  </div>
</template>

<script>
import AppButton from './AppButton.vue';

export default {
  name: 'AppFooter',
  data() {
    return {
      showMyDetails: false
    }
  },
  components: { AppButton }
}
</script>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  height: 60px;
  padding: 5px 20px;
}

.text {
  color: #cae5ff;
  /* font-size: 14px; */
}

.myDetails {
  color: #cae5ff;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: #002E2C;
  border: 2px solid gold;
  border-radius: 10px;
  padding: 20px;
  min-width: 260px;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-details-modal {
  position: relative;
  width: min(90%, 420px);
  padding: 30px;
  text-align: center;
  border-radius: 18px;
}

.developer-name {
  margin: 0 0 10px;
  font-size: 25px;
  font-weight: 600;
  color: #ffd700;
}

.developer-description {
  margin: 0;
  color: #c5c5c5;
  line-height: 1.5;
}

.developer-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0 15px;
}

.contact-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 9px 12px;

  color: white;
  text-decoration: none;

  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.03);

  transition: all 0.2s ease;
}

.contact-link:hover {
  color: gold;
  border-color: gold;
  background: rgba(255, 215, 0, 0.08);
}

.contact-link span {
  font-size: 18px;
}


@media (max-width: 768px) {
  .text {
    font-size: 0.8rem;
  }

  .myDetails {
    font-size: 0.8rem;
  }

}
</style>