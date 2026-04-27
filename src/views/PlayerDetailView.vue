<template>
    <div v-if="loading">... loading ...</div>
    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="details-section">
                <!--  údaje o hráčovi -->
                <div class="list-or-nothing">
                    <div class="player-info">
                        <div>
                            <h3 class="value">{{ player.email || 'email nezadaný' }}</h3>
                            <h3 class="value">{{ player.phone || 'telefón nezadaný' }}</h3>
                        </div>
                        <div>
                            <h3 class="label">Dátum registrácie: </h3>
                            <h3 class="value">{{ player.registrationDate }}</h3>
                        </div>
                        <div v-if="player.deletedDate">
                            <h3 class="label">Dátum zmazania: </h3>
                            <h3 class="value">{{ player.deletedDate }}</h3>
                        </div>
                    </div>
                </div>
                <div class="second">
                    <div class="list-or-nothing">

                        <div class="my-teams">
                            <h3 class="label">Tímy:</h3>
                            <h3>
                                <div class="value" v-for="team in player.teams" :key="team.id"
                                    @click="$router.push('/teams/' + team.id)" style="cursor: pointer;">
                                    {{ team.name }}
                                </div>
                            </h3>
                        </div>

                        <div class="my-leagues">
                            <h3 class="label">Ligy:</h3>
                            <h3>
                                <div class="value" v-for="league in player.leagues" :key="league.leagueId"
                                    @click="$router.push('/leagues/' + league.leagueId)" style="cursor: pointer;">
                                    {{ league.leagueName }} ({{ league.seasonYear }})
                                </div>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- tabuľka zápasov -->
            <div v-if="leagueId" class="list-or-nothing">
                <div class="matches-selection">
                    <div class="matches-table">
                        <h3 class="value">Zápasy sezóny</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Domáci</th>
                                    <th>Hosť</th>
                                    <th>Výsledok</th>
                                    <th>Liga</th>
                                    <th>Kolo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="match in allMatches" :key="match.id">

                                    <!-- 🔹 HLAVNÝ RIADOK -->
                                    <tr>
                                        <td data-label="Domáci">{{ match.homePlayer.name }}</td>
                                        <td data-label="Hosť">{{ match.awayPlayer.name }}</td>
                                        <!-- Výsledok -->
                                        <td data-label="Výsledok">
                                            <span
                                                v-if="['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status) && match.result">
                                                {{ match.result.score1 }} : {{ match.result.score2 }}
                                            </span>

                                            <span v-else-if="(isAdmin || isUserPlayerInMatch(match))">
                                                <AppButton :label="activeMatchId === match.id ? 'Zavrieť' : 'Zadať'"
                                                    :type="activeMatchId === match.id ? 'delete' : 'edit'"
                                                    html-type="button" @clicked="toggleForm(match.id)" />
                                            </span>

                                            <span v-else>-</span>
                                        </td>
                                        <td data-label="Liga">{{ getLeagueName(match.leagueId) }}</td>



                                        <td data-label="Kolo">{{ match.roundNumber }}</td>

                                        <td data-label="Status">
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

                                    <!-- 🔥 FORMULÁR -->
                                    <tr v-if="activeMatchId === match.id">
                                        <td colspan="6">
                                            <div>
                                                <AddMatchResult :match="match" :leagueType="activeLeague.leagueType"
                                                    @result-submitted="fetchMatchesAndClose" />
                                            </div>
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
    name: 'PlayerDetailView',
    data() {
        return {
            player: null,
            stats: null,
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
            this.loading = true;
            try {
                await this.fetchPlayer();

                // Paralelne načítaj zápasy a štatistiky (ak existuje liga)
                const promises = [this.fetchPlayerMatches()];
                if (this.leagueId) promises.push(this.fetchPlayerStats(this.leagueId));

                await Promise.all(promises);

                this.header.setTitle(
                    this.player.name,
                    this.stats?.rank !== undefined ? '#' + this.stats.rank : ''
                );

            } finally {
                this.loading = false;
            }
        },
        async fetchPlayer() {
            try {
                const response = await api.get('/players/' + this.playerId);
                this.player = response.data;

            } catch (error) {
                console.error('Chyba pri načítavaní hráča:', error);
            }
        },

        async fetchPlayerMatches() {
            try {
                const [createdRes, finishedRes, cancelledRes, scratchedRes] = await Promise.all([
                    api.get(`/matches/player/${this.playerId}/status/CREATED`),
                    api.get(`/matches/player/${this.playerId}/status/FINISHED`),
                    api.get(`/matches/player/${this.playerId}/status/CANCELLED`),
                    api.get(`/matches/player/${this.playerId}/status/SCRATCHED`)
                ]);

                this.createdMatches = createdRes.data;
                this.finishedMatches = finishedRes.data;
                this.cancelledMatches = cancelledRes.data;
                this.scratchedMatches = scratchedRes.data;

            } catch (error) {
                console.error('Chyba pri načítavaní zápasov:', error);
            }
        },
        async fetchPlayerStats() {

            if (!this.leagueId) return;

            try {
                const response = await api.get(`/leagues/${this.leagueId}/players/${this.playerId}/stats`);
                this.stats = response.data;
            } catch (error) {
                console.error('Chyba pri načítavaní štatistík hráča:', error);
            }
        },
        getLeagueName(leagueId) {
            const league = this.player.leagues.find(l => l.leagueId === leagueId);
            return league ? league.leagueName : '';
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchPlayerMatches()
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
        playerId() {
            return this.$route.params.id
        },
        activeLeague() {
            return this.player?.leagues?.find(l => l.leagueStatus === 'ACTIVE') || null;
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
.right-side {
    flex-direction: column;
}

.details-section {
    display: flex;
    width: 100%;
}

.list-or-nothing {
    align-items: center;
    justify-content: flex-start;
}

.player-info {
    /* list-style: none; */
    padding: 0.5rem;
    margin: 0;
    width: 100%;
}

.second {
    width: 60%;
    padding: 0.5rem;
}

.matches-selection {
    width: 100%;
}

.my-teams {
    width: 100%;
}

.my-leagues {
    width: 100%;
}

.label {
    color: #ffd700;
    font-size: 1.3rem;
}

.value {
    font-size: 1.4rem;
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
}

.matches-table th {
    text-transform: uppercase;
    font-size: 1rem;
    color: #ffd700;
    line-height: 1.2;
}


.matches-table td {
    white-space: nowrap;
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
    .label {
        font-size: 1.5rem;
    }

    .details-section {
        flex-direction: column;
        /* order: 2; */
    }


    .second {
        width: 100%;
    }

    .matches-table table,
    .matches-table thead,
    .matches-table tbody,
    .matches-table th,
    .matches-table td,
    .matches-table tr {
        display: block;
        width: 100%;
    }

    .matches-table thead {
        display: none;
    }

    .matches-table tr {
        margin-bottom: 1rem;
        background: #1e1e1e;
        padding: 0.8rem;
        border-radius: 8px;
    }

    .matches-table td {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem 0;
        border: none;
        font-size: 0.9rem;
    }

    .matches-table td::before {
        content: attr(data-label);
        color: #ffd700;
    }
}
</style>