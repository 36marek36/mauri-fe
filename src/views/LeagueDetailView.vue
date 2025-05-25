<template>
    <div class="league-detail-container">
        <header class="header">
            <h1>{{ league.name }}</h1>
            <h1>{{ league.leagueType }}</h1>
            <button @click="generateMatches" :disabled="loading">Start</button>
            <p v-if="message">{{ message }}</p>
        </header>

        <div v-if="loading" class="loading-overlay">
            Načítavam...
        </div>

        <main v-else class="main-flex-layout">
            <!-- 📋 Ľavý stĺpec: hráči alebo tímy -->
            <aside class="players">
                <div v-if="league.leagueType === 'SINGLES'">
                    <h3>Hráči v lige</h3>
                    <ul>
                        <li v-for="player in league.players" :key="player.id"
                            @click="$router.push('/players/' + player.id)">
                            <span>{{ fullName(player) }}</span>
                            <AppButton label="Zmazať" icon="🗑️" type="delete"
                                @clicked="() => removeParticipantFromLeague(player.id)" />
                        </li>
                    </ul>

                    <AppButton :label="showAddParticipants ? 'Skryť formulár' : 'Pridať hráčov do ligy'" icon="➕"
                        type="create" @clicked="showAddParticipants = !showAddParticipants" />

                    <div v-if="showAddParticipants">
                        <h3>Pridať hráčov do ligy</h3>
                        <ul>
                            <li v-for="player in freePlayers" :key="player.id">
                                <label>
                                    <input type="checkbox" :value="player.id" v-model="selectedParticipants" />
                                    <span>{{ fullName(player) }}</span>
                                </label>
                            </li>
                        </ul>
                        <AppButton label="Pridať vybraných hráčov" type="create" icon="✅"
                            @clicked="addSelectedParticipantsToLeague" :disabled="selectedParticipants.length === 0" />
                    </div>
                </div>

                <div v-else-if="league.leagueType === 'DOUBLES'">
                    <h3>Tímy v lige</h3>
                    <ul>
                        <li v-for="team in league.teams" :key="team.id">
                            <span>{{ fullName(team.player1) }} a {{ fullName(team.player2) }}</span>
                            <AppButton label="Zmazať" icon="🗑️" type="delete"
                                @clicked="() => removeParticipantFromLeague(team.id)" />
                        </li>
                    </ul>

                    <AppButton :label="showAddParticipants ? 'Skryť formulár' : 'Pridať tými do ligy'" icon="➕"
                        type="create" @clicked="showAddParticipants = !showAddParticipants" />

                        <div v-if="showAddParticipants">
                            <h3>Pridať tímy do ligy</h3>
                            <ul>
                                <li v-for="team in freeTeams" :key="team.id">
                                    <label>
                                        <input type="checkbox" :value="team.id" v-model="selectedParticipants" />
                                        <span>{{ fullName(team.player1) }} a {{ fullName(team.player2) }}</span>
                                    </label>
                                </li>
                            </ul>
                            <AppButton label="Pridať vybrané tímy do ligy" type="create" icon="✅"
                                @clicked="addSelectedParticipantsToLeague"
                                :disabled="selectedParticipants.length === 0" />
                        </div>
                </div>
            </aside>

            <!-- 🎾 Stredný stĺpec: zápasy -->
            <section class="matches">
                <h3>Zápasy ligy</h3>
                <ul v-if="matches.length > 0">
                    <li v-for="match in matches" :key="match.id" class="match-item">
                        <div>
                            <span v-if="league.leagueType === 'SINGLES'">
                                {{ fullName(match.homePlayer) }} vs {{ fullName(match.awayPlayer) }}
                            </span>
                            <span v-else>
                                {{ fullName(match.homeTeam?.player1) }} a {{ fullName(match.homeTeam?.player2) }} vs
                                {{ fullName(match.awayTeam?.player1) }} a {{ fullName(match.awayTeam?.player2) }}
                            </span>

                            <div v-if="match.status === 'CREATED'">
                                <AppButton :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                                    :type="activeMatchId === match.id ? 'delete' : 'create'" icon="📝"
                                    @clicked="toggleForm(match.id)" />
                                <div v-if="activeMatchId === match.id">
                                    <AddMatchResult :match="match" :leagueType="league.leagueType"
                                        @result-submitted="fetchMatchesAndClose" />
                                </div>
                            </div>

                            <div v-else-if="match.status === 'FINISHED'">
                                <strong>Výsledok:</strong> {{ match.result?.score1 }} : {{ match.result?.score2 }}
                            </div>
                        </div>
                    </li>
                </ul>
                <p v-else>Žiadne zápasy pre túto ligu.</p>
            </section>

            <!-- 📊 Pravý stĺpec: tabuľka -->
            <aside class="standings">
                <h3>Tabuľka</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Hráč</th>
                            <th>Výhry</th>
                            <th>Prehry</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in standings" :key="entry.player.id">
                            <td>{{ fullName(entry.player) }}</td>
                            <td>{{ entry.wins }}</td>
                            <td>{{ entry.losses }}</td>
                        </tr>
                    </tbody>
                </table>
            </aside>
        </main>
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
            standings: [],
            selectedParticipants: [],
            message: '',
            activeMatchId: null,
            loading: true,
            showAddParticipants: false
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
                    this.message = '✅ Účastníci boli úspešne pridaný do ligy!';

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
        fullName(player) {
            if (!player) return 'Neznámy';
            return `${player.firstName || ''} ${player.lastName || ''}`.trim();
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
.league-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

ul {
    list-style-type: none;
    border: 1px solid #cdcdcd;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}

.loading-overlay {
    text-align: center;
    font-size: 1.5rem;
    padding: 2rem;
    color: #555;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.main-flex-layout {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}

.players,
.matches,
.standings {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    min-width: 250px;
}

.players {
    flex: 1;
}

.matches {
    flex: 2;
    background: #fff;
}

.standings {
    flex: 1;
}

.match-item {
    border-bottom: 1px solid #ddd;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .main-flex-layout {
        flex-direction: column;
    }
}
</style>