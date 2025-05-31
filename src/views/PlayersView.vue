<template>

    <h1>Všetci hráči:</h1>

    <AppButton label="Vytvoriť hráča" icon="➕" type="create" @clicked="addPlayer" />

    <ul v-if="!loading">
        <li class="player-item" v-for="player in players" @click="goToDetail(player.id)">

            <span> {{ player.firstName + ' ' + player.lastName }} </span>
            <AppButton label="Zmazať" icon="🗑️" type="delete" @clicked="() => deletePlayer(player.id)" />

        </li>
    </ul>

    <div v-else>... loading ...</div>

</template>

<script>
import AppButton from '@/components/AppButton.vue';
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
                .catch(err => {
                    console.error('Chyba pri mazaní hráča:', err)
                })
        },
        addPlayer() {
            this.$router.push('/players/create')
        }
    },
    components: { AppButton }
}

</script>

<style scoped>
ul {
    list-style-type: none;
    border: 1px solid #cdcdcd;
    width: 50%;
}

li {
    padding: .3em .6em;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

li:not(:last-child) {
    border-bottom: 1px solid #cdcdcd;
}
</style>