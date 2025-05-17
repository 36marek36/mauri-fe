<template>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ league.name }}</h1>

        <ul>
            <li v-for="participant in league.players" :key="participant.id">
                <span>{{ participant.firstName + ' ' + participant.lastName }}</span>
            </li>
        </ul>

        <h2>Zápasy ligy</h2>

        <ul v-if="matches.length > 0">
            <li v-for="match in matches" :key="match.id">
                {{ match.homePlayer.firstName }} {{ match.homePlayer.lastName }} vs {{ match.awayPlayer.firstName + ' '
                    +
                    match.awayPlayer.lastName }}
            </li>
        </ul>
        <p v-else>Žiadne zápasy pre túto ligu.</p>

        <h2>Vsetci hraci:</h2>
        <ul>
            <li v-for="player in players" :key="player.id">
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
            league: {},
            players: [],
            matches: [],
            matchGenerationMessage: '',
            loading: true
        }
    },
    created() {
        const leagueId = this.$route.params.id;

        Promise.all([
            axios.get('/api/rest/leagues/' + leagueId),
            axios.get('/api/rest/players/'),
            axios.get('/api/rest/leagues/' + leagueId + '/matches')
        ])
            .then(([leagueResponse, playersResponse, matchesResponse]) => {
                this.league = leagueResponse.data;
                this.players = playersResponse.data;
                this.matches = matchesResponse.data
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

        fetchMatches() {
            const leagueId = this.$route.params.id
            return axios.get('/api/rest/leagues/' + leagueId + '/matches')
                .then((res) => {
                    this.matches = res.data
                    console.log('Zapasy boli nacitane:', this.matches)
                })
                .catch((err) => {
                    console.error('Chyba pri nacitavani zapasov', err)
                })
        },
        
        generateMatches() {
            const leagueId = this.$route.params.id
            axios.patch('/api/rest/matches/' + leagueId + '/generate-matches')
                .then(() => {
                    this.matchGenerationMessage = 'Zapasy boli uspesne vygenerovane'
                    return axios.get('/api/rest/leagues/' + leagueId)
                })
                .then((res) => {
                    this.league = res.data
                    return this.fetchMatches()
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