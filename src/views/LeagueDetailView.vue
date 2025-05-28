[<template>
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

                <ParticipantList :title="league.leagueType === 'SINGLES' ? 'Hráči v lige' : 'Tými v lige'"
                    :participants="league.leagueType === 'SINGLES' ? league.players : league.teams"
                    :formatName="league.leagueType === 'SINGLES' ? fullName : formatTeamName"
                    :remove="removeParticipantFromLeague" />

                <AppButton :label="showAddParticipants ? 'Skryť formulár' : 'Pridať účastníkov do ligy'" icon="➕"
                    type="create" @clicked="showAddParticipants = !showAddParticipants" />

                <AddParticipantsForm :show="showAddParticipants"
                    :items="league.leagueType === 'SINGLES' ? freePlayers : freeTeams"
                    :formatName="league.leagueType === 'SINGLES' ? fullName : formatTeamName"
                    :title="league.leagueType === 'SINGLES' ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
                    :submitLabel="league.leagueType === 'SINGLES' ? 'Pridať hráčov' : 'Pridať tímy'"
                    @submit="handleAddParticipants" />
            </aside>

            <!-- 🎾 Stredný stĺpec: zápasy -->
            <section class="matches">
                <h3>Zápasy ligy</h3>

                <div v-if="hasMatches">
                    <div v-for="(roundMatches, roundNumber) in groupedMatches" :key="roundNumber" class="round-group">
                        <h4>Kolo: {{ roundNumber }}</h4>
                        <ul>
                            <li v-for="match in roundMatches" :key="match.id" class="match-item">
                                <div>
                                    <span>
                                        {{ league.leagueType === 'SINGLES'
                                            ? `${fullName(match.homePlayer)} vs ${fullName(match.awayPlayer)}`
                                            : `${formatTeamName(match.homeTeam)} vs ${formatTeamName(match.awayTeam)}` }}
                                    </span>

                                    <div v-if="match.status === 'CREATED'">
                                        <AppButton
                                            :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                                            :type="activeMatchId === match.id ? 'delete' : 'create'" icon="📝"
                                            @clicked="toggleForm(match.id)" />
                                        <AddMatchResult v-if="activeMatchId === match.id" :match="match"
                                            :leagueType="league.leagueType" @result-submitted="fetchMatchesAndClose" />
                                    </div>

                                    <div v-else-if="match.status === 'FINISHED'">
                                        <strong>Výsledok:</strong> {{ match.result?.score1 }} : {{ match.result?.score2
                                        }}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <p v-else>Žiadne zápasy pre túto ligu.</p>
            </section>

            <!-- 📊 Pravý stĺpec: tabuľka -->
            <aside class="standings">
                <h3>Tabuľka</h3>

                <table v-if="league.leagueType === 'SINGLES' || league.leagueType === 'DOUBLES'">
                    <thead>
                        <tr>
                            <th>{{ league.leagueType === 'SINGLES' ? 'Hráč' : 'Tím' }}</th>
                            <th>Zápasy</th>
                            <th>Výhry</th>
                            <th>Prehry</th>
                            <th>Prehraté sety</th>
                            <th>Vyhraté sety</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in standings" :key="entry.id">
                            <td>{{ league.leagueType === 'SINGLES' ? entry.playerName : entry.teamName }}</td>
                            <td>{{ entry.matches }}</td>
                            <td>{{ entry.wins }}</td>
                            <td>{{ entry.losses }}</td>
                            <td>{{ entry.setsLost }}</td>
                            <td>{{ entry.setsWon }}</td>
                        </tr>
                    </tbody>
                </table>

                <p v-else>Nie je určený typ zápasu.</p>
            </aside>
        </main>
    </div>
</template>



<script>
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';
import axios from 'axios';
import ParticipantList from '@/components/ParticipantList.vue';
import AddParticipantsForm from '@/components/AddParticipantsForm.vue';


export default {
    name: 'LeagueDetail',
    data() {
        return {
            league: {},
            freePlayers: [],
            freeTeams: [],
            groupedMatches: {},
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
            const leagueId = this.leagueId;
            this.loading = true

            Promise.all([
                axios.get('/api/rest/leagues/' + leagueId),
                axios.get('/api/rest/players/not-in-any-league'),
                axios.get('/api/rest/teams/not-in-any-league'),


            ])
                .then(([leagueResponse, playersResponse, teamsResponse]) => {
                    this.league = leagueResponse.data
                    this.freePlayers = playersResponse.data
                    this.freeTeams = teamsResponse.data
                })
                .then(() => {
                    this.fetchMatches(),
                    this.fetchStats()
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní údajov:', error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        addSelectedParticipantsToLeague() {
            const leagueId = this.leagueId;
            const payload = {
                participantIds: this.selectedParticipants
            };

            axios.patch(`/api/rest/leagues/${leagueId}/addParticipants`, payload)
                .then(() => {
                    this.loadInitialData()
                    this.showMessage('✅ Účastníci boli úspešne pridaný do ligy!')
                    this.selectedParticipants = []
                })
                .catch(err => {
                    console.error('Chyba pri hromadnom pridávaní:', err);
                });
        },
        removeParticipantFromLeague(id) {
            const leagueId = this.leagueId;
            console.log('Mažem participanta z ligy:')
            axios.delete('/api/rest/leagues/' + leagueId + '/participants/' + id)
                .then(() => {
                    this.loadInitialData()
                    console.log('Participant bol úspešne odstánený z ligy')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní participanta z ligy:', err)
                })

        },
        async fetchMatches() {
            const leagueId = this.leagueId
            try {
                const res = await axios.get('/api/rest/matches/' + leagueId + '/grouped-by-round');
                this.groupedMatches = res.data;
                console.log('Zapasy v lige boli nacitane:', this.groupedMatches);
            } catch (err) {
                console.error('Chyba pri nacitavani zapasov', err);
            }
        },
        generateMatches() {
            const leagueId = this.leagueId;
            axios.patch('/api/rest/matches/' + leagueId + '/generate-matches')
                .then(() => {
                    this.showMessage('✅ Zápasy boli úspešne vygenerované')
                    return axios.get('/api/rest/leagues/' + leagueId);
                })
                .then((res) => {
                    this.league = res.data;
                    return this.fetchMatches();
                })
                .catch((err) => {
                    if (err.response && err.response.status === 409) {
                        this.showMessage(err.response.data)
                    }
                    console.log('err.response:', err.response.data);
                });
        },
        fullName(player) {
            if (!player) return 'Neznámy';
            return `${player.firstName || ''} ${player.lastName || ''}`.trim();
        },
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.fullName(team.player1)} a ${this.fullName(team.player2)}`;
        },
        handleAddParticipants(selectedIds) {
            this.selectedParticipants = selectedIds
            this.addSelectedParticipantsToLeague()
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchMatches();
            await this.fetchStats()
            this.activeMatchId = null;
            this.showMessage('✅ Výsledok bol úspešne uložený!');
        },
        async fetchStats() {
            const leagueId = this.leagueId
            try {
                const url = this.league.leagueType === 'DOUBLES'
                    ? '/api/rest/leagues/' + leagueId + '/teams/stats'
                    : '/api/rest/leagues/' + leagueId + '/players/stats'

                const res = await axios.get(url);
                this.standings = res.data;
                console.log('Štatistiky načítané:', this.standings);
            } catch (err) {
                console.error('Chyba pri načítavaní štatistík', err);
            }
        },
        showMessage(msg) {
            this.message = msg;
            setTimeout(() => {
                this.message = '';
            }, 3000);
        }
    },
    computed: {
        leagueId() {
            return this.$route.params.id;
        },
        hasMatches() {
            return Object.keys(this.groupedMatches).length > 0;
        }
    },
    components: { AppButton, AddMatchResult, ParticipantList, AddParticipantsForm }
}

</script>

<style scoped>
.league-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
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
</style>]