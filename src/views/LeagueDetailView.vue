<template>
    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ league.name }} {{ league.leagueType }}</h1>

        <!-- Zobrazenie hráčov pre SINGLES -->
        <div v-if="league.leagueType === 'SINGLES'">
            <h2>Hráči v lige</h2>
            <ul>
                <li v-for="player in league.players" :key="player.id"
                    @click="this.$router.push('/players/' + player.id)">
                    <span>{{ fullName(player) }}</span>
                    <AppButton label="Zmazať" icon="🗑️" type="delete"
                        @clicked="() => removeParticipantFromLeague(player.id)" />
                </li>
            </ul>
        </div>

        <!-- Zobrazenie tímov pre DOUBLES -->
        <div v-else-if="league.leagueType === 'DOUBLES'">
            <h2>Tímy v lige</h2>
            <ul>
                <li v-for="team in league.teams" :key="team.id">
                    <span>{{ fullName(team.player1) }} a {{ fullName(team.player2) }}</span>
                    <AppButton label="Zmazať" icon="🗑️" type="delete"
                        @clicked="() => removeParticipantFromLeague(team.id)" />
                </li>
            </ul>
        </div>

        <h2>Zápasy ligy</h2>

        <ul v-if="matches.length > 0">
            <li v-for="match in matches" :key="match.id" style="margin-bottom: 30px;">
                <div>
                    <!-- 🧑‍🤝‍🧑 Zobrazenie hráčov -->
                    <span v-if="league.leagueType === 'SINGLES'">
                        {{ fullName(match.homePlayer) }} vs {{ fullName(match.awayPlayer) }}
                    </span>
                    <span v-else-if="league.leagueType === 'DOUBLES'">
                        {{ fullName(match.homeTeam?.player1) }} a {{ fullName(match.homeTeam?.player2) }} vs
                        {{ fullName(match.awayTeam?.player1) }} a {{ fullName(match.awayTeam?.player2) }}
                    </span>

                    <!-- 📝 Formulár pri zápase CREATED -->
                    <div v-if="match.status === 'CREATED'">
                        <AppButton :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                            :type="activeMatchId === match.id ? 'delete' : 'create'" icon="📝"
                            @clicked="toggleForm(match.id)" />

                        <div v-if="activeMatchId === match.id">
                            <AddMatchResult :match="match" :leagueType="league.leagueType"
                                @result-submitted="fetchMatchesAndClose" />
                        </div>
                    </div>

                    <!-- 🏁 Výsledok pri FINISHED zápase -->
                    <div v-else-if="match.status === 'FINISHED'">
                        <strong>Výsledok:</strong>
                        {{ match.result?.score1 }} : {{ match.result?.score2 }}
                    </div>
                </div>
            </li>
        </ul>

        <p v-else>Žiadne zápasy pre túto ligu.</p>

        <div v-if="league.leagueType === 'SINGLES'">
            <h2>Všetci nezaradení hráči:</h2>
            <ul>
                <li v-for="player in freePlayers" :key="player.id">
                    <label>
                        <input type="checkbox" :value="player.id" v-model="selectedParticipants" />
                        <span>{{ fullName(player) }}</span>
                    </label>
                </li>
            </ul>

            <AppButton label="Pridať vybraných hráčov do ligy" type="create" icon="➕"
                @clicked="addSelectedParticipantsToLeague" :disabled="selectedParticipants.length === 0" />
        </div>

        <div v-else-if="league.leagueType === 'DOUBLES'">
            <h2>Všetky nezaradené tímy</h2>
            <ul>
                <li v-for="team in freeTeams" :key="team.id">
                    <label>
                        <input type="checkbox" :value="team.id" v-model="selectedParticipants" />
                        <span>{{ fullName(team.player1) }} a {{ fullName(team.player2) }}</span>
                    </label>
                </li>
            </ul>

            <AppButton label="Pridať vybrané tými do ligy" type="create" icon="➕"
                @clicked="addSelectedParticipantsToLeague" :disabled="selectedParticipants.length === 0" />

        </div>

        <button @click="generateMatches">Start</button>
        <p v-if="message">{{ message }}</p>
    </div>
</template>



<script>
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';
import axios from 'axios';


export default {
    name: 'LeagueDetail',
    data() {
        return {
            league: {},
            freePlayers: [],
            freeTeams: [],
            matches: [],
            selectedParticipants: [],
            message: '',
            activeMatchId: null,
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
                axios.get('/api/rest/players/not-in-any-league'),
                axios.get('/api/rest/teams/not-in-any-league'),
                this.fetchMatches()
            ])
                .then(([leagueResponse, playersResponse, teamsResponse]) => {
                    this.league = leagueResponse.data
                    this.freePlayers = playersResponse.data
                    this.freeTeams = teamsResponse.data
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní údajov:', error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        addSelectedParticipantsToLeague() {
            const leagueId = this.$route.params.id;
            const payload = {
                participantIds: this.selectedParticipants
            };

            axios.patch(`/api/rest/leagues/${leagueId}/addParticipants`, payload)
                .then(() => {
                    this.loadInitialData()
                    this.message = '✅ Hráči boli úspešne pridaný do ligy!';

                    setTimeout(() => {
                        this.message = '';
                    }, 3000)
                    this.selectedParticipants = []
                })
                .catch(err => {
                    console.error('Chyba pri hromadnom pridávaní:', err);
                });
        },
        removeParticipantFromLeague(id) {
            const leagueId = this.$route.params.id;
            console.log('Mažem participanta z ligy:')
            axios.delete('/api/rest/leagues/' + leagueId + '/participants/' + id)
                .then(() => {
                    this.loadInitialData()
                    console.log('Participant bol úspešne odstánený y ligy')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní participanta z ligy:', err)
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
            const leagueId = this.$route.params.id;
            axios.patch('/api/rest/matches/' + leagueId + '/generate-matches')
                .then(() => {
                    this.message = 'Zápasy boli úspešne vygenerované';
                    setTimeout(() => {
                        this.message = '';
                    }, 3000);

                    return axios.get('/api/rest/leagues/' + leagueId);
                })
                .then((res) => {
                    this.league = res.data;
                    return this.fetchMatches();
                })
                .catch((err) => {
                    if (err.response && err.response.status === 409) {
                        this.message = err.response.data;
                        setTimeout(() => {
                            this.message = '';
                        }, 3000);
                    }
                    console.log('err.response:', err.response.data);
                });
        },
        fullName(person) {
            return person.firstName + ' ' + person.lastName;
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchMatches();
            this.activeMatchId = null;
            this.message = '✅ Výsledok bol úspešne uložený!';

            setTimeout(() => {
                this.message = '';
            }, 3000)
        }
    },
    components: { AppButton, AddMatchResult }
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