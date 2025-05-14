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
                <span>{{ player.firstName + ' ' + player.lastName }}</span>
                <button @click="addPlayerToLeague(player.id)">Pridat hraca do ligy</button>
            </li>
        </ul>

        <button @click="generateMatches">Start</button>
        <p v-if="matchGenerationMessage">{{ matchGenerationMessage }}</p>
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
            matchGenerationMessage: '',
            loading: true
        }
    },
    created() {
        const leagueId = this.$route.params.id;

        Promise.all([
            axios.get('/api/rest/leagues/' + leagueId),
            axios.get('/api/rest/players/')
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
    },
    methods: {
        addPlayerToLeague(playerId) {
            const leagueId = this.$route.params.id
            axios.patch('/api/rest/leagues/' + leagueId + '/addParticipant', {
                participantId: playerId
            })
                .then(() => {
                    // Načítame ligu znova, aby bola vždy aktuálna
                    return axios.get('/api/rest/leagues/' + leagueId)
                })
                .then((updatedLeagueResponse) => {
                    // Aktualizujeme ligu zo servera
                    this.league = updatedLeagueResponse.data
                })
                .catch((err) => {
                    console.log('Chyba pri nacitavani:', err)
                })
        },
        generateMatches() {
            const leagueId = this.$route.params.id
            axios.patch('/api/rest/matches/' + leagueId + '/generate-matches')
                .then((res) => {
                    this.matchGenerationMessage = 'Zapasy boli uspesne vygenerovane'
                    console.log('Vygenerovane zapasy:', res.data)
                })
                .catch((err) => {
                    if (err.response && err.response.status === 409) {
                        this.matchGenerationMessage = err.response.data;
                    }
                    console.log('err.response:', err.response.data);
                })
        }
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