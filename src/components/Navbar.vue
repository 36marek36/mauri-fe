<template>
  <nav class="navbar">
    <ul>
      <li>
        <RouterLink to="/">Domov</RouterLink>
      </li>
      <li>
        <RouterLink to="/players">Hráči</RouterLink>
      </li>
      <li>
        <RouterLink to="/teams">Tými</RouterLink>
      </li>
      <li>
        <RouterLink to="/users">Users</RouterLink>
      </li>
      <li>
        <RouterLink to="/participants">Hráči/Tými</RouterLink>
      </li>
      <li>
        <RouterLink to="/leagues">Ligy</RouterLink>
      </li>
      <li>
        <RouterLink to="/seasons">Sezóny</RouterLink>
      </li>
      <li>
        <RouterLink to="/login">Prihlásenie</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script>
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 10px;
}

.navbar ul {
  list-style: none;
  display: flex;
  gap: 15px;
  margin: 0;
  padding: 0;
  padding-left: 1.5rem;
}
</style>
