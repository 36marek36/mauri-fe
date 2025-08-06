<template>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <AppHeader :title="season.year.toString()" />
        <AppButton v-if="isAdmin" :label="showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu'"
            :type="showCreateLeagueForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" icon="➕" />

        <div v-if="showCreateLeagueForm">
            <input v-model="newLeague.name" placeholder="Názov ligy" />
            <select v-model="newLeague.leagueType">
                <option value="SINGLES">DVOJHRA</option>
                <option value="DOUBLES">ŠTVORHRA</option>
            </select>

            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕" @clicked="createLeague" />

        </div>

        <table v-if="hasLeagues" class="league-table">
            <thead>
                <tr>
                    <th>Názov ligy</th>
                    <th>Typ ligy</th>
                    <th>Status</th>
                    <th>Progres</th>
                    <th>Účasť</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="league in season.leagues" :key="league.id" @click="$router.push('/leagues/' + league.id)"
                    style="cursor: pointer;">
                    <td>{{ league.name }}</td>
                    <td>{{ leagueTypeLabels[league.leagueType] || league.leagueType }}</td>
                    <td>{{ leagueStatusLabels[league.status] }}</td>
                    <td>
                        <span>{{ league.progress }}%</span>
                        <div class="league-progress-bar">
                            <div class="league-progress-fill" :style="{ width: league.progress + '%' }"></div>
                        </div>
                    </td>
                    <td>
                        {{  inflection(league) }}
                    </td>
                    <td>
                        <AppButton v-if="isAdmin" label="Zmazať" icon="🗑️" type="delete" htmlType="button"
                            @clicked="() => confirmDeleteLeague(league)" />
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else>Sezóna neobsahuje žiadne ligy.</p>

    </div>

    <ConfirmModal :visible="showConfirmModal" :message="`Naozaj chcete zmazať ligu ${leagueToDelete?.name}?`"
        @confirm="deleteLeague" @cancel="cancelDelete" />

</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useUserStore } from '@/user';
import ConfirmModal from '@/components/ConfirmModal.vue';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            seasonId: null,
            showCreateLeagueForm: false,
            newLeague: {
                name: '',
                leagueType: 'SINGLES',
                seasonId: ''
            },
            showConfirmModal: false,
            leagueToDelete: null,
            loading: true
        }
    },
    created() {
        this.seasonId = this.$route.params.id;
        this.fetchSeason(this.seasonId);
    },

    methods: {
        async fetchSeason(seasonId) {
            try {
                const response = await axios.get('/api/rest/seasons/' + seasonId);
                const season = response.data;

                for (const league of season.leagues) {
                    league.progress = await this.fetchLeagueProgress(league.id)
                }

                this.season = season;
                this.loading = false;
            } catch (err) {
                console.error('Chyba pri načítavaní sezóny:', err);
                this.loading = false;
            }
        },

        async createLeague() {
            try {
                const res = await axios.post('/api/rest/leagues/create', this.newLeague);
                await this.addLeagueToSeason(res.data.id)
                console.log('Liga: ' + res.data.name + ' bola úspešne vytvorená.')
                this.showCreateLeagueForm = false;
                this.newLeague = { name: '', leagueType: 'SINGLES', seasonId: '' };
            } catch (err) {
                console.error('Chyba pri vytváraní ligy:', err);
            }
        },
        toggleCreateForm() {
            this.showCreateLeagueForm = !this.showCreateLeagueForm
        },
        async addLeagueToSeason(leagueId) {
            try {
                await axios.patch('/api/rest/seasons/' + this.seasonId + '/addLeague', {
                    leagueId: leagueId
                });
                console.log('Liga bola pridaná do sezóny.');
                await this.fetchSeason(this.seasonId);
            } catch (err) {
                console.error('Chyba pri priraďovaní ligy:', err);
            }
        },

        async fetchLeagueProgress(leagueId) {
            try {
                const response = await axios.get(`/api/rest/leagues/${leagueId}/progress`);
                return response.data;
            } catch (error) {
                console.error('Chyba pri načítaní progressu:', error);
                return 0;
            }
        },
        // vyvoláš modál, keď chceš zmazať ligu
        confirmDeleteLeague(league) {
            this.leagueToDelete = league;
            this.showConfirmModal = true;
        },
        async deleteLeague() {
            try {
                await axios.delete('/api/rest/leagues/' + this.leagueToDelete.id);
                await this.fetchSeason(this.seasonId);
                console.log('Liga bola úspešne zmazaná.');
            } catch (err) {
                console.error('Chyba pri mazaní ligy:', err);
            } finally {
                this.cancelDelete();
            }
        },

        cancelDelete() {
            this.showConfirmModal = false;
            this.leagueToDelete = null;
        },
        inflection(league) {
            const count = league.leagueType === 'SINGLES'
                ? league.players.length
                : league.teams.length;

            if (league.leagueType === 'SINGLES') {
                if (count === 1) return '1 hráč';
                if (count >= 2 && count <= 4) return `${count} hráči`;
                return `${count} hráčov`;
            } else {
                if (count === 1) return '1 tím';
                if (count >= 2 && count <= 4) return `${count} tímy`;
                return `${count} tímov`;
            }
        }
    },
    computed: {
        userStore() {
            return useUserStore()
        },
        isAdmin() {
            return this.userStore.isAdmin
        },
        hasLeagues() {
            return this.season.leagues.length > 0;
        },
        leagueTypeLabels() {
            return {
                SINGLES: 'DVOJHRA',
                DOUBLES: 'ŠTVORHRA',
            };
        },
        leagueStatusLabels() {
            return {
                CREATED: 'VYTVORENÁ',
                ACTIVE: 'PRIEBEHA',
                FINISHED: 'UKONČENÁ'
            };
        }
    },
    components: { AppButton, AppHeader, ConfirmModal }
}

</script>

<style scoped>
.league-table {
    width: 50%;
    border-collapse: collapse;
}

.league-table th,
.league-table td {
    border-bottom: 1px solid #eee;
    padding: 0.5rem;
    text-align: left;

}

.league-table th {
    text-transform: uppercase;
    font-size: 0.85rem;
    color: whitesmoke;
}

.league-table tbody tr:hover {
    background-color: #363537;
}

.league-progress-bar {
    height: 8px;
    width: 200px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.league-progress-fill {
    height: 100%;
    background-color: #FFCC00;
    transition: width 0.3sease-in-out;
}
</style>