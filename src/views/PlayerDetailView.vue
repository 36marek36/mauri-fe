<template>
    <div v-if="loading">... loading ...</div>
    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <!-- Ľavý stĺpec – údaje o hráčovi -->
            <div class="player-info">
                <div>
                    <h3 class="value">{{ player.email || 'email nezadaný' }}</h3>
                    <h3 class="value">{{ player.phone || 'telefón nezadaný' }}</h3>
                </div>
                <div>
                    <h3 class="label">Dátum registrácie: </h3>
                    <h3 class="value">{{ player.registrationDate }}</h3>
                </div>
                <div v-if="player.deletedDate">
                    <h3 class="label">Dátum zmazania: </h3>
                    <h3 class="value">{{ player.deletedDate }}</h3>
                </div>
                <div>
                    <h3 class="label">Moje tímy:</h3>
                    <h3>
                        <div class="teams" v-for="team in player.teams" :key="team.id">
                            {{ team.name }}
                        </div>
                    </h3>
                </div>
                <div>
                    <h3 class="label">Moje ligy:</h3>
                    <h3>
                        <div class="value" v-for="league in player.leagues" :key="league.leagueId">
                            {{ league.leagueName }} ({{ league.seasonYear }})
                        </div>
                    </h3>
                </div>



            </div>

            <!-- Pravý stĺpec – tabuľka zápasov -->
            <div v-if="leagueId" class="matches-table">
                <h3>{{ activeLeague.leagueName }}</h3>
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

                            <!-- Výsledok -->
                            <td>
                                <span
                                    v-if="['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status) && match.result">
                                    {{ match.result.score1 }} : {{ match.result.score2 }}
                                </span>
                                <span v-else>-</span>
                            </td>

                            <!-- Kolo -->
                            <td>{{ match.roundNumber }}</td>

                            <!-- Status badge -->
                            <td>
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
            stats: null,
            createdMatches: [],
            finishedMatches: [],
            cancelledMatches: [],
            scratchedMatches: [],
            loading: true,
            header: useHeaderStore()
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

                // Paralelne načítaj zápasy a štatistiky (ak existuje liga)
                const promises = [this.fetchPlayerMatches()];
                if (this.leagueId) promises.push(this.fetchPlayerStats(this.leagueId));

                await Promise.all(promises);

            } finally {
                this.loading = false;
            }
        },
        async fetchPlayer() {
            try {
                const response = await api.get('/players/' + this.playerId);
                this.player = response.data;
                this.header.setTitle(this.player.firstName, this.player.lastName);
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
        async fetchPlayerStats() {

            if (!this.leagueId) return;

            try {
                const response = await api.get(`/leagues/${this.leagueId}/players/${this.playerId}/stats`);
                this.stats = response.data;
            } catch (error) {
                console.error('Chyba pri načítavaní štatistík hráča:', error);
            }
        }
    },
    computed: {
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches, ...this.scratchedMatches];
        },
        playerId() {
            return this.$route.params.id
        },
        activeLeague() {
            return this.player?.leagues?.find(l => l.leagueStatus === 'ACTIVE') || null;
        },
        leagueId() {
            return this.activeLeague?.leagueId || null;
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

.label {
    text-align: center;
    font-size: 1.6rem;
}

.value {
    color: whitesmoke;
}

.teams {
    color: whitesmoke;
    border-bottom: 1px solid wheat;
    font-size: 1.5rem;
}

.matches-table {
    flex: 2;
    margin-bottom: 1rem;
    overflow-x: auto;
    width: 100%;
}

.matches-table table {
    border-collapse: collapse;
}


.matches-table td {
    padding: 0.5rem;
    border: 1px solid #ccc;
    text-align: center;
    white-space: nowrap;
}

.badge-finished {
    color: #ADFF2F;
    /* font-weight: normal; */
}

.badge-cancelled {
    color: #FF4C4C;
    /* font-weight: bold; */
}

.badge-scratched {
    color: #FFC107;
    /* font-weight: bold; */
}

.badge-pending {
    color: #f5f5f5;
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