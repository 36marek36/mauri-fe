<template>
    <h1>Všetky tými:</h1>

 <ul v-if="!loading">
  <li v-for="team in teams" :key="team.id">
    <strong>Hráč 1:</strong> {{ team.player1.firstName }} {{ team.player1.lastName }}<br>
    <strong>Hráč 2:</strong> {{ team.player2.firstName }} {{ team.player2.lastName }}
  </li>
</ul>

    <div v-else>... loading ...</div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'TeamsView',

    data() {
        return {
            teams: [],
            loading: true
        }
    },

    created() {
        this.fetchTeams()
    },

    methods: {
        fetchTeams() {
            axios.get('/api/rest/teams/')
                .then((response) => {
                    this.teams = response.data
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní týmov', error)
                    this.loading = false
                })
        }
    }
}

</script>

<style scoped>
ul {
    list-style-type: none;
    border: 1px solid #cdcdcd;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}

li:not(:last-child) {
    border-bottom: 1px solid #cdcdcd;
}

</style>