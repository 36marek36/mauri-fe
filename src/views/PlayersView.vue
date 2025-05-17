<template>

    <h1>list of players</h1>

    <ul v-if="!loading">
        <li v-for="player in players" @click="goToDetail(player.id)">

            {{ player.firstName + ' ' + player.lastName }}

            <DeleteButton :onDelete="()=> deletePlayer(player.id)"/>

        </li>
    </ul>

    <div v-else>... loading ...</div>

    <button @click="this.$router.push('/players/create')">Vytvorit hraca</button>

</template>

<script>
import DeleteButton from '@/components/DeleteButton.vue';
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
        deletePlayer(id) {
            console.log('Mažem hráča s ID:', id)
            axios.delete('/api/rest/players/' + id)
                .then(() => {
                    this.fetchPlayers()
                    console.log('Hráč bol úspešne zmazaný.')
                })
                .catch(err=>{
                    console.error('Chyba pri mazaní hráča:', err)
                })

        }
    },
    components: { DeleteButton }
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