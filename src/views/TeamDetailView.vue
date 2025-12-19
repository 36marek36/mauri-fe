<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="players-container">
                <!-- Hráč 1 -->
                <div class="player-card">
                    <h3 @click="goToDetail(team.player1.id)">{{ team.player1.name }}</h3>
                </div>

                <!-- Hráč 2 -->
                <div class="player-card">
                    <h3 @click="goToDetail(team.player2.id)">{{ team.player2.name }}</h3>
                </div>

                <h3>{{ 'Založenie tímu: ' + team.registrationDate }}</h3>
            </div>

            <!-- Zápasy -->
            <div class="list-or-nothing">
                <h3>Všetky zápasy aktuálnej sezóny</h3>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Domáci</th>
                                <th>Hostia</th>
                                <th>Výsledok</th>
                                <th>Kolo</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="match in allMatches" :key="match.id">
                                <td>{{ match.homeTeam.name }}</td>
                                <td>{{ match.awayTeam.name }}</td>
                                <td>
                                    <span
                                        v-if="['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status) && match.result">
                                        {{ match.result.score1 }} : {{ match.result.score2 }}
                                    </span>
                                    <span v-else>-</span>
                                </td>
                                <td>{{ match.roundNumber }}</td>
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


    </div>
</template>

<script>
import api from '@/axios-interceptor';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'TeamDetailView.vue',
    data() {
        return {
            team: null,
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
            await this.fetchTeam();
            await this.fetchTeamMatches();
        },

        async fetchTeam() {
            try {
                const response = await api.get('/teams/' + this.teamId);
                this.team = response.data;
                this.header.setTitle('Detail tímu', '');
                this.loading = false
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
        async goToDetail(id) {
            try {
                await api.get(`/players/${id}`);
                this.$router.push(`/players/${id}`);
            } catch (error) {
            }
        },
    },
    computed: {
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches, ...this.scratchedMatches];
        },
        teamId() {
            return this.$route.params.id
        }
    }
}

</script>

<style scoped>
.players-container {
    display: flex;
    flex-direction: column;
    width: 40%;
    gap: 2rem;
}

.player-card {
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 8px;
    background: linear-gradient(to left,
            rgba(0, 0, 0, 1),
        
            rgba(0, 0, 0, 0.05)
            /* takmer priehľadné napravo */
        );
}

.player-card:hover {
    cursor: pointer;
}

.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
}

.table-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    width: 100%;
}

table {
    border-collapse: collapse;
}

table th {
    font-weight: 100;
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
</style>