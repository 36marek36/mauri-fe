<!-- <template>

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



</template> -->

<template>
    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ league.name }} {{ league.leagueType }}</h1>

        <!-- Zobrazenie hráčov pre SINGLES -->
        <div v-if="league.leagueType === 'SINGLES'">
            <h2>Hráči v lige</h2>
            <ul>
                <li v-for="player in league.players" :key="player.id">
                    <span>{{ player.firstName }} {{ player.lastName }}</span>
                </li>
            </ul>
        </div>

        <!-- Zobrazenie tímov pre DOUBLES -->
        <div v-else-if="league.leagueType === 'DOUBLES'">
            <h2>Tímy v lige</h2>
            <ul>
                <li v-for="team in league.teams" :key="team.id">
                    <span>{{ team.player1.firstName }} {{ team.player1.lastName }} a
                        {{ team.player2.firstName }} {{ team.player2.lastName }}</span>
                </li>
            </ul>
        </div>

        <h2>Zápasy ligy</h2>

        <ul v-if="matches.length > 0">
            <li v-for="match in matches" :key="match.id">
                <template v-if="league.leagueType === 'SINGLES'">
                    {{ match.homePlayer.firstName }} {{ match.homePlayer.lastName }}
                    vs
                    {{ match.awayPlayer.firstName }} {{ match.awayPlayer.lastName }}
                </template>
                <template v-else-if="league.leagueType === 'DOUBLES'">
                    {{ match.homeTeam.player1.firstName }} {{ match.homeTeam.player1.lastName }} a
                    {{ match.homeTeam.player2.firstName }} {{ match.homeTeam.player2.lastName }}
                    vs
                    {{ match.awayTeam.player1.firstName }} {{ match.awayTeam.player1.lastName }} a
                    {{ match.awayTeam.player2.firstName }} {{ match.awayTeam.player2.lastName }}
                </template>
            </li>
        </ul>
        <p v-else>Žiadne zápasy pre túto ligu.</p>

        <div v-if="league.leagueType === 'SINGLES'">
            <h2>Všetci hráči:</h2>
            <ul>
                <li v-for="player in players" :key="player.id">
                    <span>{{ player.firstName }} {{ player.lastName }}</span>
                    <button @click="addParticipantToLeague(player.id)">Pridať hráča do ligy</button>
                </li>
            </ul>
        </div>

        <div v-else-if="league.leagueType === 'DOUBLES'">
            <h2>Všetky tímy</h2>
            <ul>
                <li v-for="team in teams" :key="team.id">
                    <span>{{ team.player1.firstName }} {{ team.player1.lastName }} a
                        {{ team.player2.firstName }} {{ team.player2.lastName }}</span>
                    <button @click="addParticipantToLeague(team.id)">Pridať tím do ligy</button>
                </li>
            </ul>
        </div>

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
            teams: [],
            matches: [],
            matchGenerationMessage: '',
            loading: true
        }
    },
    created() {
        this.loadInitialData()
    },

    methods: {
        loadInitialData() {
            const leagueId = this.$route.params.id;
            this.loading = true

            Promise.all([
                axios.get('/api/rest/leagues/' + leagueId),
                axios.get('/api/rest/players/'),
                axios.get('/api/rest/teams/'),
                this.fetchMatches()
            ])
                .then(([leagueResponse, playersResponse, teamsResponse]) => {
                    this.league = leagueResponse.data
                    this.players = playersResponse.data
                    this.teams = teamsResponse.data
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní údajov:', error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        addParticipantToLeague(participantId) {
            const leagueId = this.$route.params.id
            axios.patch('/api/rest/leagues/' + leagueId + '/addParticipant', {
                participantId: participantId
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

        async fetchMatches() {
            const leagueId = this.$route.params.id
            try {
                const res = await axios.get('/api/rest/leagues/' + leagueId + '/matches');
                this.matches = res.data;
                console.log('Zapasy v lige boli nacitane:', this.matches);
            } catch (err) {
                console.error('Chyba pri nacitavani zapasov', err);
            }
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