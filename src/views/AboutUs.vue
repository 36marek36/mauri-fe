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
    </div>
  </div>
  <div class="bottom-text">
    <div class="contact-info">
      <p>
        Nájdete nás na adrese:
        <a href="https://www.google.com/maps/search/?api=1&query=29.augusta+92+Handlová" target="_blank"
          class="address-link">
          29.augusta 92, Handlová
        </a>
      </p>

      <p>
        Pre viac informácií sledujte náš
        <a href="https://www.facebook.com/profile.php?id=100034650532111" target="_blank" rel="noopener noreferrer"
          class="facebook-link">
          <img src="/images/facebook.png" alt="Facebook" />
        </a>
        acebook
      </p>
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
  height: 50vh;
  background: url('/images/aboutus.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  -webkit-mask-image: radial-gradient(ellipse at 50% 50%,
      black 40%,
      transparent 70%);

  mask-image: radial-gradient(ellipse at 50% 50%,
      black 40%,
      transparent 70%);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-size: 30px;
  /* line-height: 1.5; */
  padding-right: 50px;
}

.contact-info p {
  margin: 0;
  color: #f5eeee;
}

.address-link {
  text-decoration: none;
  color: inherit;
  font-size: 2rem;
    filter: drop-shadow(0 4px 5px rgb(255, 0, 0));
}

.bottom-text {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  filter: drop-shadow(0 4px 5px rgb(255, 0, 0));
  padding: 10px 20px;

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
  filter: drop-shadow(0 4px 5px rgb(0, 26, 255));
}

.facebook-link img:hover {
  transform: scale(1.5);
}

@media (max-width: 768px) {
  .right-side {
    -webkit-mask-image: radial-gradient(ellipse at 50% 50%,
        black 50%,
        transparent 75%);

    mask-image: radial-gradient(ellipse at 50% 50%,
        black 50%,
        transparent 75%);
  }

  .contact-info {
    font-size: 20px;
    text-align: right;
    align-items: flex-end; 
    padding-right: 1px;
  }

  .bottom-text {
    flex-direction: column;
    padding-top: 2rem;
  }

  .address-link {
    font-size: 1em;
  }
}
</style>