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
                    <table class="rating-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Hráč</th>
                                <th>Rating</th>
                                <th>Level</th>
                            </tr>
                        </thead>

                        <tbody>
                            <template v-for="(player, index) in ratingPlayers" :key="player.playerId">

                                <tr class="main-row">
                                    <td class="rank">
                                        <span v-if="index === 0">🥇</span>
                                        <span v-else-if="index === 1">🥈</span>
                                        <span v-else-if="index === 2">🥉</span>
                                        <span v-else>{{ index + 1 }}.</span>
                                    </td>

                                    <td class="participant-name">
                                        {{ player.playerName }}
                                    </td>

                                    <td class="rating-value">
                                        {{ player.rating ?? '-' }}
                                    </td>

                                    <td>
                                        <span v-if="player.playerLevel" class="level-badge"
                                            :class="getLevelClass(player.playerLevel)">
                                            {{ formatLevel(player.playerLevel) }}
                                        </span>

                                        <span v-else class="no-rating">
                                            —
                                        </span>
                                    </td>

                                </tr>

                            </template>
                        </tbody>

                    </table>

                </div>


            </div>
        </main>
    </div>

</template>
<script>
import api from '@/axios-interceptor';

export default {
    data() {
        return {
            loading: false,
            ratingPlayers: [],
        }
    },
    created() {
        this.loadRatingPlayers();
    },

    methods: {
        async loadRatingPlayers() {
            try {
                const response = await api.get('/player_rating/ranking')

                this.ratingPlayers = response.data
            } catch (error) {
                console.error('Nepodarilo sa načítať rating hráčov:', error)
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
                MASTER: 'Master'
            }

            return levels[level] ?? level
        },

        getLevelClass(level) {
            return `level-${level?.toLowerCase()}`
        }
    }
}
</script>

<style scoped>
/* TABLE */
.rating-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
}

.rating-table th {
    padding: 9px 7px;
    color: #888;
    font-size: 10px;
    text-transform: uppercase;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
}

.rating-table td {
    padding: 12px 7px;
    white-space: nowrap;
}

.rating-table th:nth-child(2),
.rating-table td:nth-child(2) {
    text-align: left;
}

.rating-table .main-row {
    cursor: pointer;
    transition: background 0.15s;
}

.rating-table .main-row:hover,
.rating-table .main-row.expanded {
    background: #3d3d3d;
}

.rating-table .rank {
    width: 35px;
    font-weight: 700;
}

.rating-table .participant-name {
    font-weight: 600;
    white-space: normal;
}

.rating-table .league-name {
    color: #999;
    font-size: 13px;
}

.rating-table .rating-value {
    font-size: 16px;
    font-weight: 800;
    color: #f5f5f5;
}

/* LEVEL */
.level-badge {
    display: inline-block;
    padding: 4px 9px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.level-beginner {
    background: #e5e7eb;
    color: #4b5563;
}

.level-amateur {
    background: #dbeafe;
    color: #2563eb;
}

.level-intermediate {
    background: #dcfce7;
    color: #16a34a;
}

.level-advanced {
    background: #fef3c7;
    color: #d97706;
}

.level-professional {
    background: #ede9fe;
    color: #7c3aed;
}

.level-master {
    background: #fef3c7;
    color: #b45309;
}

.no-rating {
    color: #777;
}

</style>