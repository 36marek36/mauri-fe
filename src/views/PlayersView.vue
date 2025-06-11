<template>

    <h1>Všetci hráči:</h1>

    <AppButton label="Vytvoriť hráča" icon="➕" type="create" htmlType="button" @clicked="addPlayer" />

    <!-- <ul v-if="!loading">
        <li v-for="player in players" @click="goToDetail(player.id)">

            <span> {{ player.firstName + ' ' + player.lastName }} </span>
            <AppButton label="Zmazať" icon="🗑️" type="delete" @clicked="() => deletePlayer(player.id)" />

        </li>
    </ul>

    <div v-else>... loading ...</div> -->

    <div v-if="!loading">
        <ParticipantList :title="'Zoznam hráčov'" :participants="players" :formatName="formatPlayerName"
            :remove="deletePlayer" />
    </div>

    <div v-else>
        ... loading ...
    </div>

</template>

<script>
import AppButton from '@/components/AppButton.vue';
import ParticipantList from '@/components/ParticipantList.vue';
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
        },
        formatPlayerName(player) {
            return player.firstName + ' ' + player.lastName
        }
    },
    components: { AppButton, ParticipantList }
}

</script>

<style scoped>
:deep(ul) {
    width: 50%;
}

</style>