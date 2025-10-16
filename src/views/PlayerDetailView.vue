<template>

    <div v-if="loading">... loading ...</div>



    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <!-- Ľavý stĺpec – údaje o hráčovi -->
            <ul class="player-info">
                <li>
                    <h3 class="label">Meno: </h3>
                    <span class="value">{{ player.firstName }}</span>
                </li>
                <li>
                    <h3 class="label">Priezvisko: </h3>
                    <span class="value">{{ player.lastName }}</span>
                </li>
                <li>
                    <h3 class="label">Email: </h3>
                    <span class="value">{{ player.email || 'nezadaný' }}</span>
                </li>
                <li>
                    <h3 class="label">Telefón: </h3>
                    <span class="value">{{ player.phone || 'nezadaný' }}</span>
                </li>
                <li>
                    <h3 class="label">Dátum registrácie: </h3>
                    <span class="value">{{ player.registrationDate }}</span>
                </li>
                <li>
                    <h3 class="label">Moje tímy:</h3>
                    <span>
                        <div class="value" v-for="team in player.teams" :key="team.id">
                            {{ team.name }}
                        </div>
                    </span>

                </li>
                <li v-if="player.deletedDate">
                    <h3 class="label">Dátum zmazania: </h3>
                    <span class="value">{{ player.deletedDate }}</span>
                </li>
                <li>
                    <h3 class="label">Zoznam líg:</h3>
                    <span>
                        <div class="value" v-for="league in player.leagues" :key="league.leagueId">
                            {{ league.leagueName }} ({{ league.seasonYear }})
                        </div>
                    </span>
                </li>
            </ul>

            <!-- Pravý stĺpec – tabuľka zápasov -->
            <div v-if="player.active" class="matches-table">
                <h3 class="matches-title">Všetky zápasy aktuálnej sezóny</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Domáci</th>
                            <th>Hosť</th>
                            <th>Výsledok</th>
                            <th>Kolo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="match in allMatches" :key="match.id">
                            <td>{{ match.homePlayer.name }}</td>
                            <td>{{ match.awayPlayer.name }}</td>
                            <td>
                                <span
                                    v-if="match.status === 'FINISHED' || match.status === 'CANCELLED' && match.result">
                                    {{ match.result.score1 }} : {{ match.result.score2 }}
                                </span>
                                <span v-else>-</span>
                            </td>
                            <td>{{ match.roundNumber }}</td>
                            <td>
                                <span :class="{
                                    'badge-finished': match.status === 'FINISHED',
                                    'badge-cancelled': match.status === 'CANCELLED',
                                    'badge-pending': match.status !== 'FINISHED' && match.status !== 'CANCELLED'
                                }">
                                    {{
                                        match.status === 'FINISHED'
                                            ? 'Odohratý'
                                            : match.status === 'CANCELLED'
                                                ? 'Zrušený'
                                                : 'Neodohratý'
                                    }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script>
import api from '@/axios-interceptor';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'PlayerDetailView',
    data() {
        return {
            player: null,
            createdMatches: [],
            finishedMatches: [],
            cancelledMatches: [],
            loading: true,
            header: useHeaderStore()
        }
    },
    created() {
        this.fetchAll();
    },
    methods: {
        async fetchAll() {
            await this.fetchPlayer();
            await this.fetchPlayerMatches();
        },
        async fetchPlayer() {
            this.loading = true;
            try {
                const response = await api.get('/players/' + this.playerId);
                this.player = response.data;
                this.header.setTitle('Detail hráča', this.player.name);
            } catch (error) {
                console.error('Chyba pri načítavaní hráča:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchPlayerMatches() {
            try {
                const [createdRes, finishedRes, cancelledRes] = await Promise.all([
                    api.get(`/matches/player/${this.playerId}/status/CREATED`),
                    api.get(`/matches/player/${this.playerId}/status/FINISHED`),
                    api.get(`/matches/player/${this.playerId}/status/CANCELLED`)
                ]);

                this.createdMatches = createdRes.data;
                this.finishedMatches = finishedRes.data;
                this.cancelledMatches = cancelledRes.data;

            } catch (error) {
                console.error('Chyba pri načítavaní zápasov:', error);
            }
        }
    },
    computed: {
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches];
        },
        playerId() {
            return this.$route.params.id
        }
    }
}

</script>

<style scoped>
.player-info {
    list-style: none;
    padding: 0.5rem;
    margin: 0;
    flex: 1;
    max-width: 400px;
}

.player-info li {
    display: grid;
    grid-template-columns: 150px 1fr;
    /* 1. stĺpec pevný pre label, 2. pre hodnotu */
    gap: 0.5rem;
    margin-bottom: 0.3rem;
    word-break: break-word;
    align-items: start;
}

.label {
    text-align: left;
}

.value {
    /* font-weight: bold; */
    color: whitesmoke;
}

.matches-table {
    flex: 2;
    margin-bottom: 1rem;
    overflow-x: auto;
}

.matches-table table {
    border-collapse: collapse;
}

.matches-table th,
.matches-table td {
    padding: 0.5rem;
    border: 1px solid #ccc;
    text-align: center;
    white-space: nowrap;
}

.matches-title {
    text-align: left;
    margin-bottom: 1rem;
}

.badge-finished {
    color: greenyellow;
    /* font-weight: normal; */
}

.badge-cancelled {
    color: red;
    font-weight: bold;
}

.badge-pending {
    color: whitesmoke;
    font-style: italic;

}

@media (max-width: 768px) {
    .matches-table {
        margin-top: 1rem;
    }

    .matches-table table {
        min-width: 100%;
    }
}
</style>