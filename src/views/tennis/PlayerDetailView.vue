<template>
    <div v-if="loading">... loading ...</div>
    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">

            <!--  údaje o hráčovi -->
            <div class="list-or-nothing">
                <div class="first">
                    <div class="player-photo-wrapper">
                        <img :src="getPlayerPhoto(player.id)" @click="toggleZoom" @error="hideMissingImage"
                            :class="['player-photo', { zoomed: isZoomed }]" />
                    </div>
                    <div class="player-info">
                        <div>
                            <p class="value">{{ player.phone || 'telefón nezadaný' }}</p>
                            <picture class="value small">{{ player.email || 'email nezadaný' }}</picture>
                        </div>
                        <div>
                            <p class="label small">Dátum registrácie: </p>
                            <path class="value small">{{ player.registrationDate }}</path>
                        </div>
                        <div v-if="player.deletedDate">
                            <p class="label small">Dátum zmazania: </p>
                            <p class="value small">{{ player.deletedDate }}</p>
                        </div>
                    </div>
                </div>
                <div class="second">
                    <!-- Tímy -->
                    <div class="my-teams">
                        <h3 class="label">Moje tímy:</h3>
                        <div class="value small" v-for="team in player.teams" :key="team.id"
                            @click="$router.push('/tennis/teams/' + team.id)" style="cursor: pointer;">
                            {{ team.name }}
                        </div>
                    </div>

                    <!-- Aktuálna sezóna -->
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
                                                        <div :class="getPlayerClass(match, 'home')">
                                                            <strong>{{ match.homePlayer.name }}</strong>
                                                        </div>

                                                        <div class="vs">vs</div>

                                                        <div :class="getPlayerClass(match, 'away')">
                                                            <strong>{{ match.awayPlayer.name }}</strong>
                                                        </div>
                                                    </div>
                                                </td>

                                                <!-- Výsledok -->
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
    name: 'PlayerDetailView',
    data() {
        return {
            player: null,
            createdMatches: [],
            finishedMatches: [],
            cancelledMatches: [],
            scratchedMatches: [],
            activeMatchId: null,
            loading: true,
            showMatches: window.innerWidth > 768,
            isZoomed: false,
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
                await this.fetchPlayerMatches();

                this.header.setTitle(
                    this.player.firstName || '',
                    this.player.lastName || ''
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
        getLeagueName(leagueId) {
            const league = this.player.leagues.find(l => l.leagueId === leagueId);
            return league ? league.leagueName : '';
        },
        getLeagueType(leagueId) {
            return this.activeLeagues.find(
                league => league.leagueId === leagueId
            )?.leagueType || null;
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
        getPlayerClass(match, side) {
            if (!match.result) return '';

            const home = match.result.score1;
            const away = match.result.score2;

            const isDraw = home === away;
            if (isDraw) return '';

            const isHomeWinner = home > away;

            if (side === 'home' && isHomeWinner) return 'winner';
            if (side === 'away' && !isHomeWinner) return 'winner';

            return 'loser';
        },
        getPlayerPhoto(playerId) {
            const url = `/players/${playerId}.png`

            return url
        },
        hideMissingImage(e) {
            e.target.style.display = 'none'
        },
        toggleZoom() {
            this.isZoomed = !this.isZoomed
        }
    },
    computed: {
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches, ...this.scratchedMatches];
        },
        playerId() {
            return this.$route.params.id
        },
        activeLeagues() {
            return this.player?.leagues?.filter(
                league => league.leagueStatus === 'ACTIVE'
            ) || [];
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin;
        },
        leaguesByYear() {
            const leagues = (this.player.leagues || [])
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
/* =======================
   LAYOUT
======================= */

.right-side {
    flex-direction: column;
    justify-content: flex-start;
}

.list-or-nothing {
    align-items: center;
}

.first {
    display: flex;
    align-items: center;
}

.player-info {
    text-align: center;
    padding: 0.5rem;
    margin: 0;
    width: 100%;
}

.player-photo-wrapper {
    display: flex;
    padding: 0.5rem;
}

.player-photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ffd700;
    transition: transform 0.2s ease;
    cursor: zoom-in;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.player-photo.zoomed {
    transform: translate(75%, 75%) scale(2.5);
    background-color: #1e1e1e;
    cursor: zoom-out;
    z-index: 1000;
}

.second {
    width: 100%;
    padding: 0.5rem;
}

.my-leagues {
    position: relative;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    padding: 10px;
}

.my-teams {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
    gap: 5px;
}

.my-teams::before {
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

/* =======================
   TEXT STYLES
======================= */

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

/* =======================
   TABLE BASE (DESKTOP)
======================= */

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

.actual-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-cell {
    text-align: center;
}

.form-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

/* =======================
   MATCH CELL
======================= */

.match-cell {
    display: flex;
    flex-wrap: wrap;
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

/* =======================
   STATUS BADGES
======================= */

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

/* =======================
   ANIMATIONS
======================= */

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* =======================
   TITLE
======================= */

.center-title {
    cursor: pointer;
}

/* =======================
   MOBILE
======================= */

@media (max-width: 768px) {

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

    .center-title {
        font-size: 1.2rem;
        margin: 0.2rem;
    }

    .actual-season {
        font-size: 1.4rem;
    }

    /* TABLE becomes card layout */
    .matches-table,
    /* .matches-table thead, */
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
}
</style>