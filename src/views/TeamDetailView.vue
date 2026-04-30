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
            <section v-if="leagueId" class="matches">

                <div class="list-or-nothing">
                    <h3 class="center-title" @click="showMatches = !showMatches">
                        Tímové zápasy sezóny
                        <span v-if="showMatches">▲</span>
                        <span v-else>▼</span>
                    </h3>

                    <transition name="fade">
                        <table v-show="showMatches" class="matches-table">

                            <thead>
                                <tr>
                                    <th colspan="2">Zápas</th>
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

                                        <td colspan="2" data-label="Zápas">
                                            <div class="match-cell">
                                                <div :class="getTeamClass(match, 'home')">
                                                    <strong>{{ match.homeTeam.name }}</strong>
                                                </div>
                                                <div class="vs">
                                                    vs
                                                </div>
                                                <div :class="getTeamClass(match, 'away')">
                                                    <strong>{{ match.awayTeam.name }}</strong>
                                                </div>

                                            </div>
                                        </td>

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

                                        <td data-label="Liga">
                                            {{ getLeagueName(match.leagueId) }}
                                        </td>

                                        <td data-label="Kolo">
                                            {{ match.roundNumber }}
                                        </td>

                                        <td data-label="Status">
                                            <span :class="{
                                                'badge-finished': match.status === 'FINISHED',
                                                'badge-cancelled': match.status === 'CANCELLED',
                                                'badge-scratched': match.status === 'SCRATCHED',
                                                'badge-pending': !['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status)
                                            }">
                                                {{
                                                    match.status === 'FINISHED' ? 'Odohratý' :
                                                        match.status === 'CANCELLED' ? 'Zrušený' :
                                                            match.status === 'SCRATCHED' ? 'Skrečovaný' :
                                                                'Neodohratý'
                                                }}
                                            </span>
                                        </td>

                                    </tr>

                                    <!-- 🔥 FORMULÁR -->
                                    <tr v-if="activeMatchId === match.id">
                                        <td colspan="6">
                                            <AddMatchResult :match="match" :leagueType="activeLeague.leagueType"
                                                @result-submitted="fetchMatchesAndClose" />
                                        </td>
                                    </tr>

                                </template>
                            </tbody>
                        </table>
                    </transition>
                </div>

            </section>
        </div>
    </div>
</template>

<script>
import api from '@/axios-interceptor';
import AddMatchResult from '@/components/AddMatchResult.vue';
import AppButton from '@/components/AppButton.vue';
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import { useFlashMessageStore } from '@/stores/flashMessage';

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
            showMatches: window.innerWidth > 768,
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
            this.flash.showMessage('✅ Výsledok bol úspešne uložený!', 'success')
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
        },
        getTeamClass(match, side) {
            if (!match.result) return '';

            const home = match.result.score1;
            const away = match.result.score2;

            const isDraw = home === away;

            if (isDraw) return '';

            const isHomeWinner = home > away;

            if (side === 'home' && isHomeWinner) return 'winner';
            if (side === 'away' && !isHomeWinner) return 'winner';

            return 'loser';
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
        flash() {
            return useFlashMessageStore();
        },
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

.matches {
    width: 100%;
}

/* nadpis */
.center-title {
    text-align: center;
    cursor: pointer;
}

/* table */
.matches-table {
    width: 100%;
    border-collapse: collapse;
}

.matches-table th,
.matches-table td {
    padding: 0.5rem;
    text-align: center;
}

.matches-table th {
    text-transform: uppercase;
    font-size: 1rem;
    color: #ffd700;
    line-height: 1.2;
}

.matches-table tbody tr:hover {
    background-color: #363537;
}

.matches-table tbody tr {
    border-bottom: 1px solid #2a2a2a;
}

/* match cell */
.match-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
}

.vs {
    font-size: 0.8rem;
    opacity: 0.7;
    text-transform: lowercase;
}

.winner {
    color: #ADFF2F;
    text-shadow: 0 0 6px rgba(173, 255, 47, 0.3);
}

.loser {
    color: #e0e0e0;
    text-shadow: none;
}

/* statusy */
.badge-finished {
    color: #ADFF2F;
}

.badge-cancelled {
    color: #FF4C4C;
}

.badge-scratched {
    color: #FFC107;
}

.badge-pending {
    color: #f5f5f5;
    font-style: italic;
}

/* fade animácia */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
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

    .center-title {
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
    }

    .matches-table,
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