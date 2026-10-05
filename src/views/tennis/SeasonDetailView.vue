<template>
    <div class="season-detail-container">

        <div v-if="loading">... loading ...</div>

        <div v-else class="main-layout">
            <div class="left-side">
            </div>

            <div class="right-side">

                <!-- ========================= -->
                <!-- HLAVIČKA SEZÓNY           -->
                <!-- ========================= -->
                <section class="season-header">

                    <div class="season-header-top">
                        <div class="season-title">

                            <div class="season-title-icon">
                                <img src="/public/images/logo-mauri.png" alt="logo mauri">
                            </div>

                            <div class="season-title-text">
                                <p>Tenisová sezóna</p>
                                <h1>{{ season.year }}</h1>
                            </div>

                        </div>

                        <div>
                            <div class="season-status" :class="{
                                'status-created': isSeasonCreated,
                                'status-active': isSeasonActive,
                                'status-finished': isSeasonFinished
                            }">

                                <span v-if="isSeasonCreated">⚪ VYTVORENÁ</span>
                                <span v-else-if="isSeasonActive">🟢 AKTÍVNA</span>
                                <span v-else-if="isSeasonFinished">🏁 UKONČENÁ</span>
                                <span v-else>{{ season.status }}</span>
                            </div>


                            <div class="total-participants">
                                <strong>
                                    {{ inflection('participant', season.totalParticipants) }}
                                </strong>
                            </div>

                        </div>

                    </div>

                    <!-- INFO -->
                    <div class="season-info">

                        <div class="season-info-first-line">
                            <div class="season-info-item">
                                <span>🏆</span>
                                <div>
                                    <strong>
                                        {{ inflection('league', season.totalLeagues) }}
                                    </strong>
                                </div>
                            </div>

                            <div class="season-info-item">
                                <span>👤</span>
                                <div>
                                    <strong>
                                        {{ inflection('player', season.totalPlayers) }}
                                    </strong>
                                </div>
                            </div>

                            <div class="season-info-item">
                                <span>👥</span>
                                <div>
                                    <strong>
                                        {{ inflection('team', season.totalTeams) }}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div class="season-info-item">
                            <span>🎾</span>

                            <div class="season-matches-info">

                                <div class="season-match-stats">
                                    <div>
                                        <small>Odohraté</small>
                                        <strong>{{ season.totalFinishedMatches }}</strong>
                                    </div>

                                    <div>
                                        <small>Kontumované</small>
                                        <strong>{{ season.totalScratchedMatches }}</strong>
                                    </div>

                                    <div>
                                        <small>Zrušené</small>
                                        <strong>{{ season.totalCancelledMatches }}</strong>
                                    </div>

                                    <div>
                                        <small>Zápasy</small>
                                        <strong>
                                            {{ season.totalMatches }}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <span>🎾</span>
                        </div>

                    </div>

                    <!-- PROGRESS SEZÓNY -->
                    <div v-if="isSeasonActive" class="season-progress">

                        <div class="progress-header">
                            <span>Priebeh sezóny</span>
                            <strong>
                                {{ Math.round(seasonProgress) }} %
                            </strong>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: `${seasonProgress}%` }"></div>
                        </div>

                    </div>

                    <!-- PRE AKTÍVNU SEZÓNU: Zobrazí, koľko dní prebieha -->
                    <div v-if="isSeasonActive" class="days-counter">
                        <strong>
                            Sezóna prebieha {{ inflection('day', getDaysElapsed(season.startDate)) }}
                        </strong>
                    </div>


                    <!-- ADMIN BUTTONS -->
                    <!-- <div v-if="isAdmin" class="admin-buttons">

                        <AppButton v-if="hasParticipants && isLeagueCreated" label="Odštartovať ligu" icon="🏁"
                            type="create" htmlType="button" @clicked="openGenerateModal" />

                        <AppButton v-if="isLeagueActive" label="Ukončiť ligu" icon="🛑" type="delete" htmlType="button"
                            @clicked="openFinishModal" />

                        <AppButton v-if="isLeagueCreated"
                            :label="showAddParticipants ? 'Skryť formulár' : isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
                            icon="➕" type="default" htmlType="button"
                            @clicked="showAddParticipants = !showAddParticipants" />

                    </div>

                    <AddParticipantsForm v-if="isAdmin" :show="showAddParticipants"
                        :items="isSingles ? freePlayers : freeTeams" :title="isSingles
                            ? 'Pridať hráčov do ligy'
                            : 'Pridať tímy do ligy'
                            " :submitLabel="isSingles
                                ? 'Pridať hráčov'
                                : 'Pridať tímy'
                                " @submit="handleAddParticipants" /> -->
                </section>


                <div class="leagues">
                    <div class="list-or-nothing">

                        <!-- SINGLES -->
                        <h3>Dvojhry</h3>
                        <table v-if="singleLeagues.length" class="league-table">
                            <tbody>
                                <tr v-for="league in singleLeagues" :key="league.id"
                                    @click="$router.push('/tennis/leagues/' + league.id)" class="league-row">

                                    <td class="league-name">{{ league.name }}</td>

                                    <td v-if="season?.status !== 'FINISHED'" class="occupancy">{{ inflection('player',
                                        league.participants) }}</td>

                                    <td v-if="season?.status === 'ACTIVE'" class="progress">
                                        <CircularProgress :progress="league.leagueProgress" />
                                    </td>


                                    <td v-if="season?.status === 'FINISHED'" class="winner">
                                        <span>
                                            🏆 {{ league.winnerName }}
                                        </span>
                                    </td>

                                </tr>
                            </tbody>
                        </table>

                        <!-- DOUBLES -->
                        <h3>Štvorhry</h3>
                        <table v-if="doubleLeagues.length" class="league-table">
                            <tbody>
                                <tr v-for="league in doubleLeagues" :key="league.id"
                                    @click="$router.push('/tennis/leagues/' + league.id)" class="league-row">

                                    <td class="league-name">{{ league.name }}</td>

                                    <td v-if="season?.status !== 'FINISHED'" class="occupancy">{{
                                        inflection('team', league.participants) }}
                                    </td>

                                    <td v-if="season?.status === 'ACTIVE'" class="progress">
                                        <CircularProgress :progress="league.leagueProgress" />
                                    </td>

                                    <td v-if="season?.status === 'FINISHED'" class="winner">
                                        <span>
                                            🏆 {{ league.winnerName }}
                                        </span>
                                    </td>

                                </tr>
                            </tbody>
                        </table>

                        <p v-if="!singleLeagues.length && !doubleLeagues.length">
                            Sezóna neobsahuje žiadne ligy.
                        </p>

                    </div>
                </div>
            </div>
        </div>


    </div>



</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import CircularProgress from '@/components/CircularProgress.vue';
import { inflection } from '@/utils/inflection';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            loading: true,
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        const seasonId = this.$route.params.id;
        this.fetchSeason(seasonId);
    },

    methods: {
        async fetchSeason(seasonId) {
            this.loading = true;

            try {
                const response = await api.get('/seasons/tennis/' + seasonId);
                const season = response.data;

                this.season = season;

                this.header.setTitle('Tenisová sezóna', season.year)

            } catch (err) {
                console.error('Chyba pri načítavaní sezóny:', err);
            } finally {
                this.loading = false;
            }
        },
        inflection,
        getDaysElapsed(startDateString) {
            if (!startDateString) return 0;

            let formattedDate = startDateString;

            // Spracovanie slovenského formátu (napr. 21.4.2026 alebo 21. 4. 2026)
            if (startDateString.includes('.')) {
                // Odstránime medzery a rozdelíme podľa bodiek
                const parts = startDateString.replace(/\s+/g, '').split('.');

                if (parts.length >= 3) {
                    // Doplníme nuly na začiatok pre jednociferné dni a mesiace (napr. "4" -> "04")
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];

                    // Vytvoríme ISO formát YYYY-MM-DD, ktorému JavaScript 100% rozumie
                    formattedDate = `${year}-${month}-${day}`;
                }
            }

            const start = new Date(formattedDate);
            const today = new Date();

            // Kontrola, či je dátum platný
            if (isNaN(start.getTime())) {
                console.error('Nepodporovaný formát dátumu:', startDateString);
                return 0;
            }

            // Vynulujeme čas, aby sme porovnávali iba čisté kalendárne dni
            start.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const differenceInTime = today.getTime() - start.getTime();

            // Prepočet milisekúnd na dni
            const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

            // Ak sezóna začala dnes alebo v budúcnosti, vráti 0
            return differenceInDays > 0 ? differenceInDays : 0;
        }
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        },
        singleLeagues() {
            return this.season.leagues.filter(l => l.leagueType === 'SINGLES')
        },
        doubleLeagues() {
            return this.season.leagues.filter(l => l.leagueType === 'DOUBLES')
        },
        seasonStatus() {
            return this.season.status;
        },
        isSeasonCreated() {
            return this.season.status === 'CREATED';
        },
        isSeasonActive() {
            return this.season.status === 'ACTIVE';
        },
        isSeasonFinished() {
            return this.season.status === 'FINISHED';
        },
        seasonProgress() {
            if (!this.season.totalMatches) return 0;

            return Math.min(
                (this.season.totalCompletedMatches / this.season.totalMatches) * 100,
                100
            );
        },
    },
    components: { AppButton, AppModal, CircularProgress }
}

</script>

<style scoped>
.right-side {
    flex-direction: column;
    text-align: center;
    align-items: center;
}

/* =========================
   SEASON HEADER
========================= */

.season-header {
    background: #111;
    color: white;
    border: 1px solid #292929;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 18px;
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
    /*padding border sa započítali do výslednej šírky.*/
}

.season-header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.season-title {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
}

.season-title-text {
    flex: 1;
    text-align: center;
}

.season-title-icon img {
    width: 80px;
    height: auto;
    filter: drop-shadow(0 5px 20px #bdbdbd);
}

.season-title h1 {
    margin: 0;
    font-size: 30px;
}

.season-title p {
    color: #acbbc9;
    font-size: 14px;
}

/* STATUS */

.season-status {
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
}

.status-created {
    background: #292929;
    color: #ccc;
}

.status-active {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
}

.status-finished {
    background: rgba(255, 215, 0, 0.12);
    color: #ffd700;
}

.total-participants {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Barlow Condensed", sans-serif;
    gap: 4px;
}

.total-participants strong {
    font-size: 1.5rem;
    color: #fff;
}

/* INFO */

.season-info {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
}

.season-info-first-line {
    display: flex;
    gap: 15px;
}

.season-info-second-line {
    display: flex;
    gap: 15px;
}

.season-info-item {
    display: flex;
    align-items: center;

}

.season-info-item>span {
    font-size: 22px;
}

.season-info-item strong {
    display: block;
    margin-top: 2px;
    font-size: 14px;
}

.season-matches-info {
    flex: 1;
}

.season-matches-info small {
    display: block;
    color: #acbbc9;
    font-size: 11px;
}

.season-match-stats {
    display: flex;
    gap: 5px;
}

/* PROGRESS */

.season-progress {
    margin-top: 25px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 7px;
    color: #aaa;
    font-size: 12px;
}

.progress-header strong {
    color: #ffd700;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #2a2a2a;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg,
            #b8860b,
            #ffd700);
    border-radius: 10px;
    transition: width 0.4s ease;
}

.days-counter {
    font-size: 1.2rem;
    font-family: "Barlow Condensed", sans-serif;
    padding-top: 0.5rem;
}

/* =========================
   SEASON LEAGUES
========================= */

.leagues {
    width: 100%;
}

.list-or-nothing {
    align-items: center;
}

h3 {
    font-size: 2rem;
    font-family: "Barlow Condensed", sans-serif;
}

.league-table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
}

.league-table td {
    padding-left: 10px;
    text-align: left;
    white-space: normal;
}

.league-table tbody tr:hover {
    /* background-color: #363537; */
    background: linear-gradient(90deg, #484749 0%, transparent 100%);
}

.league-row {
    height: 60px;
    cursor: pointer;
}

/* názov ligy */
.league-table td.league-name {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1.2rem;

    white-space: nowrap;
    width: auto;
}

/* počet hráčov */
.league-table td.occupancy {
    white-space: nowrap;
    width: 1%;
    padding-right: 40px;
    text-align: left;
}

/* progress */
.league-table td.progress {
    white-space: nowrap;
    width: 1%;
    text-align: right;
    padding: 5px;
}

.league-table td.winner {
    width: 100%;
    text-align: center;
    padding-right: 5px;
}

.league-table tbody tr:hover {
    text-shadow:
        0 0 3px #ffd700,
        0 0 8px #ffd700;
}

.league-table td.delete {
    width: 1%;
    text-align: right;
    padding-right: 5px;
}

/* =========================
   MOBILE
========================= */
@media (max-width: 768px) {

    .season-page {
        padding: 12px;
    }

    .season-header {
        padding: 15px;
    }

    .season-title {
        gap: 5px;
    }


    .season-title-icon img {
        width: 60px;
    }

    .season-title h1 {
        font-size: 24px;
    }

    .season-status {
        padding: 4px 4px;
        font-size: 0.6rem;
    }

    .total-participants strong {
        font-size: 1.1rem;
    }

    .total-participants span {
        font-size: 0.85rem;
    }

    .season-info {
        justify-content: center;
    }

    .season-progress {
        margin-top: 10px;
    }

}
</style>