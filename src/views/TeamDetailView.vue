<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="players-container">
                <!-- Hráč 1 -->
                <div class="player-card">
                    <h3 @click="goToDetail(team.player1.id)">{{ team.player1.name }}</h3>
                </div>

                <!-- Hráč 2 -->
                <div class="player-card">
                    <h3 @click="goToDetail(team.player2.id)">{{ team.player2.name }}</h3>
                </div>

                <div class="list-or-nothing">
                    <div>
                        <h3 class="label">Založenie tímu:</h3>
                        <h3 class="value">{{ team.registrationDate }}</h3>
                    </div>
                    <div v-if="team.deletedDate">
                        <h3 class="label">Dátum zmazania:</h3>
                        <h3 class="value">{{ team.deletedDate }}</h3>
                    </div>

                </div>

            </div>

            <!-- Zápasy -->
            <div v-if="leagueId" class="list-or-nothing">
                <div class="matches-selection">
                    <div class="matches-table">
                        <h3 class="value">Tímové zápasy sezóny</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Domáci</th>
                                    <th>Hostia</th>
                                    <th>Liga</th>
                                    <th>Výsledok</th>
                                    <th>Kolo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="match in allMatches" :key="match.id">
                                    <tr>
                                        <td>{{ match.homeTeam.name }}</td>
                                        <td>{{ match.awayTeam.name }}</td>
                                        <td>{{ getLeagueName(match.leagueId) }}</td>
                                        <td>
                                            <span
                                                v-if="['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status) && match.result">
                                                {{ match.result.score1 }} : {{ match.result.score2 }}
                                            </span>
                                            <span v-else-if="(isAdmin || isUserPlayerInMatch(match))">
                                                <AppButton label="Zadať" type="edit" html-type="button"
                                                    @clicked="toggleForm(match.id)"></AppButton>
                                            </span>
                                            <span v-else>-</span>
                                        </td>
                                        <td>{{ match.roundNumber }}</td>
                                        <td>
                                            <span :class="{
                                                'badge-finished': match.status === 'FINISHED',
                                                'badge-cancelled': match.status === 'CANCELLED',
                                                'badge-scratched': match.status === 'SCRATCHED',
                                                'badge-pending': !['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status)
                                            }">
                                                {{
                                                    match.status === 'FINISHED'
                                                        ? 'Odohratý'
                                                        : match.status === 'CANCELLED'
                                                            ? 'Zrušený'
                                                            : match.status === 'SCRATCHED'
                                                                ? 'Skrečovaný'
                                                                : 'Neodohratý'
                                                }}
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="activeMatchId === match.id">
                                        <td colspan="6" class="form-row">
                                            <AddMatchResult :match="match" :leagueType="activeLeague.leagueType"
                                                @result-submitted="fetchMatchesAndClose" />
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/axios-interceptor';
import AddMatchResult from '@/components/AddMatchResult.vue';
import AppButton from '@/components/AppButton.vue';
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';

export default {
    name: 'TeamDetailView.vue',
    data() {
        return {
            team: null,
            createdMatches: [],
            finishedMatches: [],
            cancelledMatches: [],
            scratchedMatches: [],
            activeMatchId: null,
            loading: true,
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        this.fetchAll();
    },

    methods: {
        async fetchAll() {
            await this.fetchTeam();
            await this.fetchTeamMatches();
        },

        async fetchTeam() {
            try {
                const response = await api.get('/teams/' + this.teamId);
                this.team = response.data;
                this.header.setTitle('Detail tímu', '');
                this.loading = false
            } catch (error) {
                console.error('Chyba pri načítavaní tímu:', error);
            }
        },

        async fetchTeamMatches() {
            try {
                const [createdRes, finishedRes, cancelledRes, scratchedRes] = await Promise.all([
                    api.get(`/matches/team/${this.teamId}/status/CREATED`),
                    api.get(`/matches/team/${this.teamId}/status/FINISHED`),
                    api.get(`/matches/team/${this.teamId}/status/CANCELLED`),
                    api.get(`/matches/team/${this.teamId}/status/SCRATCHED`)
                ]);

                this.createdMatches = createdRes.data;
                this.finishedMatches = finishedRes.data;
                this.cancelledMatches = cancelledRes.data;
                this.scratchedMatches = scratchedRes.data;

            } catch (error) {
                console.error('Chyba pri načítavaní zápasov:', error);
            }
        },
        getLeagueName(leagueId) {
            const league = this.team.leagues.find(l => l.leagueId === leagueId);
            return league ? league.leagueName : '';
        },
        async goToDetail(id) {
            try {
                await api.get(`/players/${id}`);
                this.$router.push(`/players/${id}`);
            } catch (error) {
            }
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchTeamMatches()
            this.activeMatchId = null;
        },
        isUserPlayerInMatch(match) {
            const playerId = this.userStore.playerId;

            if (this.isSingles) {
                return match.homePlayer?.id === playerId || match.awayPlayer?.id === playerId;
            }

            if (this.isDoubles) {
                return (
                    match.homeTeam?.player1?.id === playerId ||
                    match.homeTeam?.player2?.id === playerId ||
                    match.awayTeam?.player1?.id === playerId ||
                    match.awayTeam?.player2?.id === playerId
                );
            }

            return false;
        }
    },
    computed: {
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches, ...this.scratchedMatches];
        },
        teamId() {
            return this.$route.params.id
        },
        activeLeague() {
            return this.team?.leagues?.find(l => l.leagueStatus === 'ACTIVE') || null;
        },
        leagueId() {
            return this.activeLeague?.leagueId || null;
        },
        // activeMatch() {
        //     return this.allMatches.find(m => m.id === this.activeMatchId)
        // },
        isSingles() {
            return this.activeLeague.leagueType === 'SINGLES';
        },
        isDoubles() {
            return this.activeLeague.leagueType === 'DOUBLES';
        },
        isAdmin() {
            return this.userStore.isAdmin;
        }
    },
    components: { AppButton, AddMatchResult }
}

</script>

<style scoped>
.players-container {
    display: flex;
    flex-direction: column;
    width: 40%;
    gap: 0.7rem;

}

.player-card {
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 8px;
    background: linear-gradient(to left,
            rgba(0, 0, 0, 1),

            rgba(0, 0, 0, 0.05)
            /* takmer priehľadné napravo */
        );
}

.player-card:hover {
    cursor: pointer;
}

.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
}

.label {
    color: #ffd700;
    font-size: 1.3rem;
}

.value {
    font-size: 1.4rem;
}

.matches-selection {
    width: 100%;
}

.matches-table {
    width: 100%;
}

.matches-table table {
    border-collapse: collapse;
    width: 100%;
}

.matches-table th,
.matches-table td {
    padding: 0.2rem;
    text-align: center;
}

.matches-table th {
    text-transform: uppercase;
    font-size: 1rem;
    color: #ffd700;
    line-height: 1.2;
}



.form-row>* {
    width: 70vw;
}

.badge-finished {
    color: #ADFF2F;
    /* font-weight: normal; */
}

.badge-cancelled {
    color: #FF4C4C;
    /* font-weight: bold; */
}

.badge-scratched {
    color: #FFC107;
    /* font-weight: bold; */
}

.badge-pending {
    color: #f5f5f5;
    font-style: italic;

}

@media (max-width: 768px) {
    .players-container {
        width: 100%;
    }

    .player-card h3 {
        text-align: right;
        font-size: 1.5rem;
        padding-right: 0.3rem;
    }

    .matches-table th,
    .matches-table td {
        font-size: 0.9rem;
    }

    .matches-table table {
        min-width: 600px;
    }

}
</style>