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

            </div>

        </div>
    </div>
</template>

<script>
import api from '@/axios-interceptor';
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';

export default {
    name: 'PlayerDetailView',
    data() {
        return {
            player: null,
            loading: true,
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        this.fetchPlayer();
    },
    methods: {
        async fetchPlayer() {
            this.loading = true
            try {
                const response = await api.get('/players/' + this.playerId);
                this.player = response.data;
                this.header.setTitle(
                    this.player.firstName || '',
                    this.player.lastName || ''
                );
            } catch (error) {
                console.error('Chyba pri načítavaní hráča:', error);
            } finally {
                this.loading = false
            }
        },
    },
    computed: {
        playerId() {
            return this.$route.params.id
        },
        isAdmin() {
            return this.userStore.isAdmin;
        },
    }
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

.details-section {
    display: flex;
    width: 100%;
}

.matches {
    width: 100%;
}

/* =======================
   PLAYER INFO / SIDE PANELS
======================= */

.list-or-nothing {
    align-items: center;
    justify-content: flex-start;
}

.player-info {
    text-align: center;
    padding: 0.5rem;
    margin: 0;
    width: 100%;
}

.second {
    width: 60%;
    padding: 0.5rem;
}

.my-teams,
.my-leagues {
    width: 100%;
    text-align: center;
}

.player-photo-wrapper {
    display: flex;
    padding: 0 0.5rem 0.5rem 0;
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
    transform: scale(2);
    z-index: 10;
    cursor: zoom-out;
}

/* =======================
   TEXT STYLES
======================= */

.label {
    color: #ffd700;
    font-size: 1.3rem;
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

/* divider */
.matches-table tbody tr {
    border-bottom: 1px solid #2a2a2a;
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

    .details-section {
        flex-direction: column;
    }

    .player-photo-wrapper {
        justify-content: flex-end;
    }

    .player-photo.zoomed {
        transform: translate(-50%, -50%) scale(2);
    }

    .second {
        width: 100%;
    }

    .center-title {
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
    }

    /* TABLE becomes card layout */
    .matches-table,
    .matches-table thead,
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