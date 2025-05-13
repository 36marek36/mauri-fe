<template>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/seasons">seasons</RouterLink>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ league.name }}</h1>

        <ul v-for="participant in league.players">
            <li>
                <span>{{ participant.firstName + ' ' + participant.lastName }}</span>
            </li>
        </ul>

        <h2>Vsetci hraci:</h2>
        <ul v-for="player in players">
            <li>
                <span>{{ player.firstName+ ' ' + player.lastName }}</span>
            </li>
        </ul>
    </div>



</template>

<script>
import axios from 'axios';


export default {
    name: 'LeagueDetail',
    data() {
        return {
            league: [],
            players: [],
            loading: true
        }
    },
    created() {
  const leagueId = this.$route.params.id;

  Promise.all([
    axios.get(`/api/rest/leagues/`+leagueId),
    axios.get(`/api/rest/players/`)
  ])
    .then(([leagueResponse, playersResponse]) => {
      this.league = leagueResponse.data;
      this.players = playersResponse.data;
    })
    .catch((error) => {
      console.error('Chyba pri načítaní údajov:', error);
    })
    .finally(() => {
      this.loading = false;
    });
}
}

</script>

<style scoped>
ul {
    list-style-type: none;
    display: flex;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}
</style>