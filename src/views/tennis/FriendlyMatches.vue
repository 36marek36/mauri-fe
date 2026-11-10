<template>
    <div class="main-layout">

        <div class="left-side">
        </div>

        <div class="right-side">

            <div class="list-or-nothing">

                <!-- PREPÍNANIE TYPU ZÁPASU -->
                <div class="matchType-switch">

                    <div class="switch-buttons">

                        <AppButton label="Dvojhra" type="default" :class="{ active: selectedMatchType === 'SINGLES' }"
                            @clicked="changeMatchType('SINGLES')" />

                        <AppButton label="Štvorhra" type="default" :class="{ active: selectedMatchType === 'DOUBLES' }"
                            @clicked="changeMatchType('DOUBLES')" />

                    </div>

                </div>

                <!-- NAČÍTAVANIE -->
                <div v-if="loading" class="empty-message">
                    Načítavam zápasy...
                </div>

                <!-- CHYBA -->
                <div v-else-if="error" class="error-message">
                    {{ error }}
                </div>

                <!-- PRÁZDNY ZOZNAM -->
                <div v-else-if="matches.length === 0" class="empty-message">
                    Zatiaľ neboli vytvorené žiadne
                    {{ selectedMatchType === 'SINGLES' ? 'priateľské zápasy dvojhry.' : 'priateľské zápasy štvorhry.' }}
                </div>

                <!-- ZOZNAM ZÁPASOV -->
                <div v-else class="matches-list">

                    <div v-for="match in matches" :key="match.id" class="match-card">

                        <!-- DÁTUM, STATUS A TYP -->
                        <div class="match-header">

                            <span class="match-date">
                                {{ formatDate(match.createdAt) }}
                            </span>

                            <span class="match-status" :class="getStatusClass(match.status)">
                                {{ getStatusLabel(match.status) }}
                            </span>

                        </div>

                        <!-- HRÁČI / TÍMY -->
                        <div class="match-content">

                            <div class="participant">

                                <template v-if="selectedMatchType === 'SINGLES'">
                                    {{ match.homePlayer?.name || 'Neznámy hráč' }}
                                </template>

                                <template v-else>
                                    {{ match.homeTeam?.name?.split('&')[0]?.trim() }}
                                    <br>
                                    {{ match.homeTeam?.name?.split('&')[1]?.trim() }}
                                </template>

                            </div>

                            <div class="match-result">

                                <template v-if="match.status === 'FINISHED' || match.status === 'SCRATCHED'">

                                    <div class="main-score">
                                        {{ match.result?.score1 ?? '-' }}
                                        :
                                        {{ match.result?.score2 ?? '-' }}
                                    </div>

                                    <div v-if="match.result?.setScores?.length" class="set-scores">
                                        <span v-for="(set, index) in match.result.setScores" :key="index">
                                            {{ set.score1 }}:{{ set.score2 }}
                                            <span v-if="index < match.result.setScores.length - 1"> </span>
                                        </span>
                                    </div>

                                </template>

                                <template v-else>
                                    vs
                                </template>

                            </div>

                            <div class="participant">

                                <template v-if="selectedMatchType === 'SINGLES'">
                                    {{ match.awayPlayer?.name || 'Neznámy hráč' }}
                                </template>

                                <template v-else>
                                    {{ match.awayTeam?.name?.split('&')[0]?.trim() }}
                                    <br>
                                    {{ match.awayTeam?.name?.split('&')[1]?.trim() }}
                                </template>

                            </div>

                        </div>
                        <!-- ZADANIE VÝSLEDKU -->
                        <div v-if="canEnterResult(match)" class="enter-result">

                            <AppButton :label="['FINISHED', 'SCRATCHED'].includes(match.status)
                                ? 'Opraviť výsledok'
                                : 'Zadať výsledok'" type="create" @clicked="openResultForm(match)" />

                        </div>

                        <!-- FORMULÁR VÝSLEDKU -->
                        <div v-if="selectedMatchForResult?.id === match.id" class="result-form">

                            <AddMatchResult :key="selectedMatchForResult.id" :match="selectedMatchForResult"
                                :leagueType="selectedMatchType" @result-submitted="onResultSubmitted" />

                            <AppButton label="Zavrieť" type="default" @clicked="selectedMatchForResult = null" />

                        </div>

                    </div>

                </div>

                <!-- STRÁNKOVANIE -->
                <div v-if="totalPages > 1" class="pagination">

                    <AppButton label="Predchádzajúca" type="default" :disabled="page === 0 || loading"
                        @clicked="changePage(page - 1)" />

                    <span class="page-info">
                        {{ page + 1 }} / {{ totalPages }}
                    </span>

                    <AppButton label="Ďalšia" type="default" :disabled="page >= totalPages - 1 || loading"
                        @clicked="changePage(page + 1)" />

                </div>

                <div v-if="totalElements > 0" class="total-count">
                    Celkový počet zápasov: {{ totalElements }}
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

    name: 'FriendlyMatches',

    components: {
        AppButton, AddMatchResult
    },

    data() {
        return {

            header: useHeaderStore(),
            userStore: useUserStore(),

            matches: [],
            selectedMatchForResult: null,
            selectedMatchType: 'SINGLES',

            page: 0,
            size: 10,

            totalPages: 0,
            totalElements: 0,

            loading: false,
            error: null

        };
    },

    async created() {

        this.header.setTitle('Priateľské zápasy');

        await this.loadMatches();

    },

    methods: {

        // NAČÍTANIE ZÁPASOV
        async loadMatches() {

            this.loading = true;
            this.error = null;

            try {

                const response = await api.get('/matches/friendly', {

                    params: {
                        matchType: this.selectedMatchType,
                        page: this.page,
                        size: this.size
                    }

                });

                this.matches = response.data.content;
                this.totalPages = response.data.totalPages;
                this.totalElements = response.data.totalElements;

            } catch (err) {

                console.error('Chyba pri načítaní zápasov:', err);

                this.error = 'Nepodarilo sa načítať priateľské zápasy.';

            } finally {

                this.loading = false;

            }

        },

        // PREPÍNANIE DVOJHRA / ŠTVORHRA
        async changeMatchType(matchType) {

            if (this.selectedMatchType === matchType) {
                return;
            }

            this.selectedMatchType = matchType;

            this.page = 0;
            this.selectedMatchForResult = null;

            await this.loadMatches();

        },

        // STRÁNKOVANIE
        async changePage(newPage) {

            if (
                newPage < 0 ||
                newPage >= this.totalPages ||
                this.loading
            ) {
                return;
            }

            this.page = newPage;

            await this.loadMatches();

        },

        // FORMÁTOVANIE DÁTUMU
        formatDate(date) {

            if (!date) {
                return '';
            }

            return new Date(date).toLocaleString('sk-SK', {

                day: '2-digit',
                month: '2-digit',
                year: 'numeric',

                hour: '2-digit',
                minute: '2-digit'

            });

        },

        // TEXT STAVU
        getStatusLabel(status) {

            const statuses = {

                CREATED: 'Čaká na odohranie',
                FINISHED: 'Odohratý',
                SCRATCHED: 'Kontumovaný',
                CANCELLED: 'Zrušený'

            };

            return statuses[status] || status;

        },

        // CSS TRIEDA STAVU
        getStatusClass(status) {

            const classes = {

                CREATED: 'status-created',
                FINISHED: 'status-finished',
                SCRATCHED: 'status-scratched',
                CANCELLED: 'status-cancelled'

            };

            return classes[status] || '';

        },
        // KONTROLA, ČI JE PRIHLÁSENÝ POUŽÍVATEĽ ÚČASTNÍKOM ZÁPASU
        isUserPlayerInMatch(match) {

            const playerId = this.userStore.user?.playerId;

            if (!playerId) {
                return false;
            }

            if (this.selectedMatchType === 'SINGLES') {

                return (
                    String(match.homePlayer?.id) === String(playerId) ||
                    String(match.awayPlayer?.id) === String(playerId)
                );

            }

            if (this.selectedMatchType === 'DOUBLES') {

                return (
                    String(match.homeTeam?.player1?.id) === String(playerId) ||
                    String(match.homeTeam?.player2?.id) === String(playerId) ||
                    String(match.awayTeam?.player1?.id) === String(playerId) ||
                    String(match.awayTeam?.player2?.id) === String(playerId)
                );

            }

            return false;
        },

        // KONTROLA, ČI MÔŽE POUŽÍVATEĽ ZADAŤ VÝSLEDOK
        canEnterResult(match) {

            return (
                ['CREATED', 'FINISHED', 'SCRATCHED'].includes(match.status) &&
                this.isUserPlayerInMatch(match)
            );

        },

        // OTVORENIE FORMULÁRA VÝSLEDKU
        openResultForm(match) {

            this.selectedMatchForResult =
                this.selectedMatchForResult?.id === match.id
                    ? null
                    : match;

        },

        // ÚSPEŠNÉ ODOSLANIE VÝSLEDKU
        async onResultSubmitted() {

            this.selectedMatchForResult = null;

            await this.loadMatches();

        }

    }

};
</script>

<style scoped>
.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
}

/* PREPÍNAČ */

.matchType-switch {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
    margin-top: 8px;
    margin-bottom: 25px;
}

.switch-buttons {
    grid-column: 2;
    display: flex;
    gap: 5px;
    padding: 4px;
    background: #1e2026;
    border: 1px solid rgba(220, 190, 170, 0.2);
    border-radius: 12px;
}

.matchType-switch button {
    border-radius: 9px;
    background: transparent;
    color: #a0a5af;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease,
        color 0.2s ease;
}

.matchType-switch button:hover {
    color: #ffffff;
    background: #292c34;
}

.matchType-switch button.active {
    background: #d6b58c;
    color: #1e2026;
}

/* ZOZNAM */

.matches-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
}

.match-card {
    background: #20232b;
    border: 1px solid rgba(220, 190, 170, 0.2);
    border-radius: 12px;
    padding: 15px;
}

/* HLAVIČKA */

.match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.match-date {
    color: #a0a5af;
    font-size: 12px;
}

/* HRÁČI A VÝSLEDOK */

.match-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    text-align: center;
}

.participant {
    color: white;
    font-weight: 600;
    overflow-wrap: anywhere;
}

.match-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 65px;
    text-align: center;
}

.main-score {
    font-size: 1.3rem;
    font-weight: bold;
    white-space: nowrap;
}

.set-scores {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 5px;
    font-size: 0.75rem;
    color: #aaa;
    white-space: nowrap;
    text-align: center;
}

/* STAV */

.match-status {
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 20px;

}

.status-created {
    color: #d6b58c;
    background: rgba(214, 181, 140, 0.12);
}

.status-finished {
    color: #4caf50;
    background: rgba(76, 175, 80, 0.12);
}

.status-scratched {
    color: #ff9800;
    background: rgba(255, 152, 0, 0.12);
}

.status-cancelled {
    color: #f44336;
    background: rgba(244, 67, 54, 0.12);
}

/* STRÁNKOVANIE */

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 25px;
}

.page-info {
    color: white;
    font-size: 14px;
}

.total-count {
    color: #a0a5af;
    font-size: 12px;
    text-align: center;
    margin-top: 15px;
}

/* OSTATNÉ */

.empty-message {
    text-align: center;
    color: #ffffff;
    padding: 20px 0;
}

.error-message {
    color: #c62828;
    text-align: center;
    padding: 15px;
}

/* MOBIL */

@media (max-width: 600px) {

    .list-or-nothing {
        padding: 2px;
    }

    .match-card {
        padding: 12px;
    }

    .match-content {
        gap: 5px;
    }

    .participant {
        font-size: 13px;
    }

    .match-result {
        font-size: 17px;
    }

    .match-date {
        font-size: 11px;
    }

}
</style>
