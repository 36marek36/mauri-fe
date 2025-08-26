<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="player-detail-layout">
        <!-- Ľavý stĺpec – údaje o hráčovi -->
        <ul class="player-info">
            <li>
                <span>Meno: </span>
                <span>{{ player.firstName }}</span>
            </li>
            <li>
                <span>Priezvisko: </span>
                <span>{{ player.lastName }}</span>
            </li>
            <li>
                <span>Email: </span>
                <span>{{ player.email || 'nezadaný' }}</span>
            </li>
            <li>
                <span>Telefón: </span>
                <span>{{ player.phone || 'nezadaný' }}</span>
            </li>
            <li>
                <span>Dátum registrácie: </span>
                <span>{{ formatDate(player.registrationDate) }}</span>
            </li>
            <li v-if="player.deletedDate">
                <span>Dátum zmazania: </span>
                <span>{{ formatDate(player.deletedDate) }}</span>
            </li>
            <li>
                <span>Zoznam líg:</span>
                <span class="league-names">
                    <span v-for="league in playerLeagues" :key="league.leagueName">
                        {{ league.leagueName }} ({{ league.seasonYear }})
                    </span>
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
                        <td>{{ match.homePlayer.firstName + ' ' + match.homePlayer.lastName }}</td>
                        <td>{{ match.awayPlayer.firstName + ' ' + match.awayPlayer.lastName }}</td>
                        <td>
                            <span v-if="match.status === 'FINISHED' && match.result">
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
</template>

<script>

import axios from 'axios';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'PlayerDetailView',
    data() {
        return {
            player: null,
            playerLeagues: [],
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
            await this.loadPlayerLeagues();
            await this.fetchPlayerMatches();
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('sk-SK', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        async fetchPlayer() {
            this.loading = true;
            try {
                const response = await axios.get('/api/rest/players/' + this.playerId);
                this.player = response.data;
                this.header.setTitle('Detail hráča', this.player.name);
            } catch (error) {
                console.error('Chyba pri načítavaní hráča:', error);
            } finally {
                this.loading = false;
            }
        },
        async loadPlayerLeagues() {
            try {
                const response = await axios.get('/api/rest/players/'+ this.playerId +'/leagues');
                this.playerLeagues = response.data;
            } catch (err) {
                console.error('Chyba pri načítaní líg hráča:', err);
            }
        },
        async fetchPlayerMatches() {
            try {
                const [createdRes, finishedRes, cancelledRes] = await Promise.all([
                    axios.get(`/api/rest/matches/player/${this.playerId}/status/CREATED`),
                    axios.get(`/api/rest/matches/player/${this.playerId}/status/FINISHED`),
                    axios.get(`/api/rest/matches/player/${this.playerId}/status/CANCELLED`)
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
        playerId(){
            return this.$route.params.id
        }
    }
}

</script>

<style scoped>
li {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
    word-break: break-word;
}

li span:nth-child(2) {
    font-weight: bold;
}

.league-names {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* Toto zarovná vnútorné span-y doprava */
}

.league-names span {
    font-weight: bold;
}

.player-detail-layout {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    justify-content: flex-start;
}

.player-info {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    max-width: 300px;
}

.matches-table {
    flex: 2;
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
    color: green;
    font-weight: bold;
}

.badge-cancelled {
    color: red;
    font-weight: bold;
}

.badge-pending {
    color: gray;
    font-style: italic;
}

@media (max-width: 768px) {
    .player-detail-layout {
        flex-direction: column;
    }

    .matches-table {
        margin-top: 1rem;
    }

    .matches-table table {
        min-width: 100%;
    }
}
</style>