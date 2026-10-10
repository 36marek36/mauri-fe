<template>
    <div class="league-detail-container">

        <div v-if="loading" class="loading-state">
            Načítavam...
        </div>

        <main v-else class="main-layout">
            <div class="left-side">
            </div>

            <div class="right-side">

                <div class="list-or-nothing">

                    <div class="rating-switch">
                        <AppButton label="Dvojhra" type="default" :class="{ active: selectedMatchType === 'SINGLES' }"
                            @clicked="changeMatchType('SINGLES')" />

                        <AppButton label="Štvorhra" type="default" :class="{ active: selectedMatchType === 'DOUBLES' }"
                            @clicked="changeMatchType('DOUBLES')" />
                    </div>
                    <table class="rating-table">
                        <colgroup>
                            <col class="col-rank">
                            <col class="col-player">
                            <col class="col-rating">
                        </colgroup>

                        <tbody>
                            <tr v-for="(player, index) in ratingPlayers" :key="player.playerId" class="main-row" :class="{
                                'rank-first': index === 0,
                                'rank-second': index === 1,
                                'rank-third': index === 2
                            }" @click="goToDetail('players', player.playerId)">
                                <!-- Poradie -->
                                <td class="rank">
                                    <span v-if="index === 0" class="rank-medal">🥇</span>
                                    <span v-else-if="index === 1" class="rank-medal">🥈</span>
                                    <span v-else-if="index === 2" class="rank-medal">🥉</span>
                                    <span v-else>{{ index + 1 }}.</span>
                                </td>

                                <!-- Hráč, level a zmena ratingu -->
                                <td class="player-info">
                                    <div class="participant-name">
                                        {{ player.playerName }}
                                    </div>

                                    <div>
                                        <span v-if="isDoubles ? player.doublePlayerLevel : player.playerLevel"
                                            class="level-badge"
                                            :class="getLevelClass(isDoubles ? player.doublePlayerLevel : player.playerLevel)">
                                            {{ formatLevel(isDoubles ? player.doublePlayerLevel : player.playerLevel) }}
                                        </span>

                                        <span v-else class="no-rating">
                                            Bez úrovne
                                        </span>
                                    </div>
                                </td>

                                <!-- Rating -->
                                <td class="rating-cell">
                                    <div class="rating-caption">RATING</div>

                                    <div class="rating-row">
                                        <span v-if="(isDoubles ? player.doubleRatingChange : player.ratingChange) !== 0"
                                            class="rating-change" :class="(isDoubles ? player.doubleRatingChange : player.ratingChange) > 0
                                                ? 'rating-up'
                                                : 'rating-down'">
                                            {{ (isDoubles ? player.doubleRatingChange : player.ratingChange) > 0 ? '↑' :
                                                '↓' }}
                                            {{ Math.abs(isDoubles ? player.doubleRatingChange : player.ratingChange) }}
                                        </span>

                                        <span class="rating-value">
                                            {{ isDoubles ? player.doubleRating : player.rating }}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

</template>
<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useHeaderStore } from '@/stores/header';

export default {
    data() {
        return {
            loading: false,
            ratingPlayers: [],
            selectedMatchType: 'SINGLES',
            header: useHeaderStore(),
        }
    },
    created() {
        this.header.setTitle('Celkový rebríček')
        this.loadRatingPlayers();
    },

    methods: {
        async loadRatingPlayers(matchType = this.selectedMatchType) {
            try {
                const response = await api.get('/player_rating/ratings', {
                    params: { matchType }
                })

                this.ratingPlayers = response.data
            } catch (error) {
                console.error('Nepodarilo sa načítať rating hráčov:', error)
            }
        },
        async changeMatchType(matchType) {
            if (this.selectedMatchType === matchType) {
                return
            }

            this.selectedMatchType = matchType
            await this.loadRatingPlayers(matchType)
        },
        async goToDetail(type, id) {
            try {
                // Skúsi načítať detail hráča – backend overí prihlásenie a práva
                await api.get(`/${type}/${id}`);
                // Ak request prešiel, presmerujeme na detail
                this.$router.push(`/tennis/${type}/${id}`);
            } catch (error) {
                // Chyby sa riešia automaticky v axios interceptore
            }
        },

        formatLevel(level) {
            if (!level) {
                return '-'
            }

            const levels = {
                BEGINNER: 'Začiatočník',
                AMATEUR: 'Amatér',
                INTERMEDIATE: 'Stredne pokročilý',
                ADVANCED: 'Pokročilý',
                PROFESSIONAL: 'Profesionál',
                ELITE: 'Elita',
                LEGEND: 'Legenda'
            }

            return levels[level] ?? level
        },

        getLevelClass(level) {
            return `level-${level?.toLowerCase()}`
        }
    },
    computed: {
        isDoubles() {
            return this.selectedMatchType === 'DOUBLES'
        }
    },
    components: { AppButton }
}
</script>

<style scoped>
.list-or-nothing {
    align-items: center;
}

/* ===== RATING SWITCH ===== */

.rating-switch {
    display: flex;
    gap: 5px;
    padding: 4px;
    margin-top: 8px;
    background: #1e2026;
    border: 1px solid rgba(220, 190, 170, 0.2);
    border-radius: 12px;
}

.rating-switch button {
    border-radius: 9px;
    background: transparent;
    color: #a0a5af;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease,
        color 0.2s ease;
}

.rating-switch button:hover {
    color: #ffffff;
    background: #292c34;
}

.rating-switch button.active {
    background: #d6b58c;
    color: #1e2026;
}

/* ===== TABLE LAYOUT ===== */

.rating-table {
    width: 100%;
    padding: 0 0.5rem;
    border-radius: 16px;
    border-collapse: separate;
    border-spacing: 0 7px;
    table-layout: fixed;
}

.rating-table .col-rank {
    width: 42px;
}

.rating-table .col-player {
    width: auto;
}

.rating-table .col-rating {
    width: 120px;
}

/* ===== PLAYER ROW ===== */

.rating-table tbody tr.main-row {
    background: #1e2026;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.rating-table tbody tr.main-row:hover {
    background: #292c34;
}

.rating-table tbody tr.main-row td {
    padding: 10px;
    border-top: 1px solid rgba(220, 190, 170, 0.3);
    border-bottom: 1px solid rgba(220, 190, 170, 0.3);
}

.rating-table tbody tr.main-row td:first-child {
    border-left: 1px solid rgba(220, 190, 170, 0.3);
    border-radius: 12px 0 0 12px;
}

.rating-table tbody tr.main-row td:last-child {
    border-right: 1px solid rgba(220, 190, 170, 0.3);
    border-radius: 0 12px 12px 0;
}

/* ===== TOP 3 ===== */

.rating-table .rank-first .participant-name {
    color: #FFD700;
}

.rating-table .rank-second .participant-name {
    color: #C0C0C0;
}

.rating-table .rank-third .participant-name {
    color: #CD7F32;
}

.rating-table .rank {
    color: #a0a5af;
    font-size: 13px;
    font-weight: 750;
    text-align: center;
}

.rating-table .rank-medal {
    font-size: 18px;
}

/* ===== PLAYER INFO ===== */

.rating-table td.player-info {
    min-width: 0;
    text-align: left;
}

.rating-table .participant-name {
    color: #f5f5f5;
    font-size: 13px;
    font-weight: 650;
    text-align: left;
    overflow-wrap: anywhere;
}

/* ===== LEVEL BADGES ===== */

.rating-table .level-badge {
    display: inline-block;
    max-width: 100%;
    padding: 4px 7px;
    border-radius: 5px;
    font-size: 9px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: normal;
}

.rating-table .level-beginner {
    background: #f3f4f6;
    color: #6b7280;
}

.rating-table .level-amateur {
    background: #dbeafe;
    color: #2563eb;
}

.rating-table .level-intermediate {
    background: #dcfce7;
    color: #15803d;
}

.rating-table .level-advanced {
    background: #fef3c7;
    color: #b45309;
}

.rating-table .level-professional {
    background: #ede9fe;
    color: #7c3aed;
}

.rating-table .level-elite {
    background: #fce7f3;
    color: #be185d;
}

.rating-table .level-legend {
    background: #ffedd5;
    color: #c2410c;
}

.rating-table .no-rating {
    color: #858b97;
    font-size: 10px;
}

/* Rating */
.rating-table td.rating-cell {
    text-align: right;
    vertical-align: middle;
}

.rating-table .rating-caption {
    margin-bottom: 3px;
    color: #858b97;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
}

.rating-table .rating-row {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;
}

.rating-table .rating-value {
    color: #ffffff;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.6px;
}

.rating-table .rating-change {
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.rating-table .rating-up {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.10);
}

.rating-table .rating-down {
    color: #f87171;
    background: rgba(248, 113, 113, 0.10);
}


/* ===== MOBILE ===== */

@media (max-width: 768px) {
    .right-side {
        padding: 1rem 0;
    }

    .rating-table .col-rank {
        width: 34px;
    }

    .rating-table .col-rating {
        width: 90px;
    }

    .rating-table tbody td {
        padding: 12px 6px;
    }

    .rating-table .participant-name {
        font-size: 12px;
    }

    .rating-table .rating-value {
        font-size: 17px;
    }

    .rating-table .rating-change {
        font-size: 9px;
    }

    .rating-table .level-badge {
        padding: 4px 5px;
        font-size: 8px;
        letter-spacing: 0;
    }
}
</style>