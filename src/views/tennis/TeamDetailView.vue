<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="list-or-nothing">
                <div class="first">
                    <div class="players-container">
                        <!-- Hráč 1 -->
                        <div class="player-card">
                            <h3 @click="goToDetail(team.player1.id)">{{ team.player1.name }}</h3>
                        </div>

                        <!-- Hráč 2 -->
                        <div class="player-card">
                            <h3 @click="goToDetail(team.player2.id)">{{ team.player2.name }}</h3>
                        </div>
                    </div>
                </div>

                <div class="second">
                    <!-- Akutálna sezóna -->
                    <section v-if="activeLeagues.length > 0 && allMatches.length > 0">
                        <div class="list-or-nothing">
                            <h3 class="actual-season">Aktuálna sezóna</h3>
                            <!-- Aktuálne ligy -->
                            <div class="actual-rank">
                                <span>Priebežné poradie</span>

                                <div v-for="league in activeLeagues" :key="league.leagueId" class="value small league"
                                    @click="$router.push('/tennis/leagues/' + league.leagueId)">
                                    <span>{{ league.leagueName }} - </span>

                                    <span v-if="league.participantRank === 0" class="league-rank">
                                        odhlásený
                                    </span>

                                    <span v-else-if="league.participantRank != null" class="league-rank">
                                        {{ league.participantRank }}. miesto
                                    </span>
                                </div>
                            </div>

                            <!-- tabuľka zápasov -->
                            <h3 class="center-title" @click="showMatches = !showMatches">
                                Zápasy
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
                                                        <span v-if="match.result.setScores?.length" class="set-scores">
                                                            (
                                                            <span v-for="(set, i) in match.result.setScores" :key="i">
                                                                {{ set.score1 }} : {{ set.score2 }}<span
                                                                    v-if="i < match.result.setScores.length - 1">,
                                                                </span>
                                                            </span>
                                                            )
                                                        </span>
                                                    </span>

                                                    <span v-else-if="(isAdmin || isUserPlayerInMatch(match))">
                                                        <AppButton
                                                            :label="activeMatchId === match.id ? 'Zavrieť' : 'Zadať'"
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
                                                <td colspan="6" class="form-cell">
                                                    <div class="form-wrapper">
                                                        <AddMatchResult :match="match"
                                                            :leagueType="getLeagueType(match.leagueId)"
                                                            @result-submitted="fetchMatchesAndClose" />
                                                    </div>
                                                </td>
                                            </tr>

                                        </template>
                                    </tbody>
                                </table>
                            </transition>

                        </div>
                    </section>
                    <!-- Ukončené ligy -->
                    <div class="my-leagues">
                        <div v-for="yearGroup in leaguesByYear" :key="yearGroup.year">
                            <div class="year">
                                {{ yearGroup.year }}
                            </div>

                            <div v-for="league in yearGroup.leagues" :key="league.leagueId" class="value small league"
                                @click="$router.push('/tennis/leagues/' + league.leagueId)">
                                <span>{{ league.leagueName }} - </span>

                                <span v-if="league.participantRank === 0" class="league-rank">
                                    odhlásený
                                </span>

                                <span v-else-if="league.participantRank != null" class="league-rank">
                                    {{ league.participantRank }}. miesto
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Team detail-->
                    <div class="registration">
                        <h3 class="label small">Založenie tímu:</h3>
                        <h3 class="value small">{{ team.registrationDate }}</h3>
                    </div>
                    <div v-if="team.deletedDate">
                        <h3 class="label">Dátum zmazania:</h3>
                        <h3 class="value">{{ team.deletedDate }}</h3>
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
            this.loading = true;

            try {
                await this.fetchTeam();
                await this.fetchTeamMatches();

                this.header.setTitle('Detail tímu', '');

            } finally {
                this.loading = false;
            }
        },

        async fetchTeam() {
            try {
                const response = await api.get('/teams/' + this.teamId);
                this.team = response.data;
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
        getLeagueType(leagueId) {
            return this.activeLeagues.find(
                league => league.leagueId === leagueId
            )?.leagueType || null;
        },
        async goToDetail(id) {
            try {
                await api.get(`/players/${id}`);
                this.$router.push(`/tennis/players/${id}`);
            } catch (error) {
            }
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchAll();
            this.activeMatchId = null;
            this.flash.showMessage('✅ Výsledok bol úspešne uložený!', 'success')
        },
        isUserPlayerInMatch(match) {
            const playerId = this.userStore.playerId;
            const leagueType = this.getLeagueType(match.leagueId);

            if (leagueType === 'SINGLES') {
                return (
                    match.homePlayer?.id === playerId ||
                    match.awayPlayer?.id === playerId
                );
            }

            if (leagueType === 'DOUBLES') {
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
        activeLeagues() {
            return this.team?.leagues?.filter(
                league => league.leagueStatus === 'ACTIVE'
            ) || [];
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
        },
        leaguesByYear() {
            const leagues = (this.team.leagues || [])
                .filter(league => league.leagueStatus === 'FINISHED')

            const grouped = leagues.reduce((acc, league) => {
                if (!acc[league.seasonYear]) {
                    acc[league.seasonYear] = []
                }

                acc[league.seasonYear].push(league)

                return acc
            }, {})

            return Object.keys(grouped)
                .sort((a, b) => b - a)
                .map(year => ({
                    year,
                    leagues: grouped[year]
                }))
        }
    },
    components: { AppButton, AddMatchResult }
}

</script>

<style scoped>
.right-side {
    flex-direction: column;
    justify-content: flex-start;
}

.list-or-nothing {
    align-items: center;
}

.first {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 10px;
}

.players-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 0.7rem;
}

.player-card {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 3px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #3a815c 5%, #0d3d24 30%, #030f09 70%, #3a815c 95%, #ffffff 100%);
    border: 1px solid rgba(255, 255, 255, 0.932);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
}

.player-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 215, 0, 0.25);
}

.player-card:hover h3 {
    color: #ffd700;
}

.label {
    color: #ffd700;
    font-size: 18px;
}

.value {
    font-size: 1.4rem;
    color: #e0e0e0;
}

.small {
    font-size: 1rem;
}

.second {
    width: 100%;
    padding: 0.5rem;
}

.actual-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* nadpis */
.center-title {
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
    vertical-align: middle;
}

.matches-table th {
    text-transform: uppercase;
    font-size: 1rem;
    color: #ffd700;
    line-height: 1.2;
}

.matches-table td {
    white-space: normal;
}

.form-cell {
    text-align: center;
}

.form-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
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

.set-scores {
    margin-left: 8px;
    display: inline-flex;
    gap: 4px;
    font-size: 0.85em;
    opacity: 0.9;
}

.winner {
    color: #ADFF2F;
    text-shadow: 0 0 6px rgba(173, 255, 47, 0.3);
}

.my-leagues {
    position: relative;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    padding: 10px;
}

.year {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #ddd;
    color: #ffd700;
}

.league {
    cursor: pointer;
    padding: 3px 0;
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

.registration {
    position: relative;
    padding-top: 10px;
}

.registration::before {
    content: "";
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 3px;
    background: linear-gradient(to right,
            transparent,
            wheat 30%,
            wheat 70%,
            transparent);
}

@media (max-width: 768px) {
    .first {
        padding: 6px;
    }

    .players-container {
        gap: 0.4rem;
    }

    .player-card h3 {
        font-size: 1rem;
    }

    .center-title {
        font-size: 1.2rem;
        margin: 0.2rem;
    }

    .actual-season {
        font-size: 1.4rem;
    }

    .matches-table,
    .matches-table tbody {
        display: block;
        width: 100%;
    }

    .matches-table thead {
        display: none;
    }

    .matches-table tr {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.6rem;
        background: #1e1e1e;
        border-radius: 8px;
        padding: 0.8rem;
        border: 1px solid wheat;
    }

    .matches-table td {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 0.3rem 0;
        border: none;
        font-size: 0.9rem;
    }

    .matches-table td::before {
        content: attr(data-label);
        color: #ffd700;
    }

    .my-leagues {
        grid-template-columns: repeat(1, 1fr);
        gap: 10px;
    }

    .league {
        font-size: 0.9rem;
    }

    .year {
        font-size: 1rem;
    }
}
</style>