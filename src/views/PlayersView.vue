<template>

    <h1>list of players</h1>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/players">list of players</RouterLink>
    <RouterLink to="/seasons">seasons</RouterLink>
    <RouterLink to="/leagues">leagues</RouterLink>

    <ul v-if="!loading">
        <li v-for="player in players" @click="goToDetail(player.id)">
            
            {{ player.firstName + ' ' + player.lastName }}

        </li>
    </ul>

    <div v-else>... loading ...</div>

    <button @click="this.$router.push('/players/create')">Vytvorit hraca</button>

</template>

<script>
import axios from 'axios';

export default {
    name: 'PlayersView',
    data() {
        return {
            players: [],
            loading: true
        }
    },
    created() {
        this.fetchPlayers()
    },
    methods: {
        fetchPlayers() {
            axios.get('/api/rest/players/')
                .then((response) => {
                    this.players = response.data
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní hráčov:', error)
                    this.loading = false
                })
        },
        goToDetail(id) {
            this.$router.push('/players/' + id)
        },
      
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