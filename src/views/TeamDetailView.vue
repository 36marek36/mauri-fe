<template>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <!-- Hráči vedľa seba -->
        <div class="players-container">
            <!-- Hráč 1 -->
            <div class="player-card">
                <h3>Hráč 1:</h3>
                <p><span>Meno:</span> <span>{{ team.player1.name }}</span></p>
                <p><span>Email:</span> <span>{{ team.player1.email || 'nezadaný' }}</span></p>
            </div>

            <!-- Hráč 2 -->
            <div class="player-card">
                <h3>Hráč 2:</h3>
                <p><span>Meno:</span> <span>{{ team.player2.name }}</span></p>
                <p><span>Email:</span> <span>{{ team.player2.email || 'nezadaný' }}</span></p>
            </div>
        </div>

        <!-- Zápasy -->
        <div>
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

        <h3>{{ 'Založenie tímu: ' + team.registrationDate }}</h3>
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
                this.header.setTitle('Detail tímu', this.team.name);
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
        }
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
    justify-content: space-between;
    width: 60%;
    gap: 2rem;
    margin-bottom: 2rem;
    margin-left: auto;
    margin-right: auto;
}

.player-card {
    flex: 1;
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
}

.player-card p {
    display: flex;
    justify-content: space-between;
    margin: 0.3rem 0;
    /* Trochu medzery medzi riadkami */
}

.player-card p span:first-child {
    font-weight: 600;
}

.table-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

table {
    border-collapse: collapse;
}

table th,
table td {
    padding: 0.5rem;
    border: 1px solid #ccc;
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