<template>
    <AppHeader :title="'Sezóna'" :subtitle="season.year.toString()" />

    <FlashMessage :message="message" :messageType="messageType" />

    <div v-if="loading">... loading ...</div>

    <div v-else>

        <AppButton v-if="isAdmin" :label="showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu'"
            :type="showCreateLeagueForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" icon="➕" />

        <AppButton v-if="season.status === 'CREATED'" label="Spustiť sezónu" type="default" htmlType="button" icon=""
            @clicked="startSeason" />
        <AppButton v-if="season.status === 'ACTIVE'" label="Ukončiť sezónu" type="default" htmlType="button" icon=""
            @clicked="finishSeason" />

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
                    <th>Víťaz</th>
                    <th v-if="isAdmin">Akcie</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="league in season.leagues" :key="league.id"
                    @click="$router.push('/leagues/' + league.leagueId)" style="cursor: pointer;">
                    <td>{{ league.leagueName }}</td>
                    <td>{{ leagueTypeLabels[league.leagueType] || league.leagueType }}</td>
                    <td>{{ leagueStatusLabels[league.leagueStatus] }}</td>
                    <td>
                        <span>{{ league.progress }}%</span>
                        <div class="league-progress-bar">
                            <div class="league-progress-fill" :style="{ width: league.progress + '%' }"></div>
                        </div>
                    </td>
                    <td>
                        {{ inflection(league) }}
                    </td>

                    <td>
                        <span v-if="league.leagueStatus === 'FINISHED' && league.winner">
                            🏆 {{ league.winner }}
                        </span>
                    </td>
                    <td v-if="isAdmin">
                        <AppButton v-if="isAdmin" label="Zmazať" icon="🗑️" type="delete" htmlType="button"
                            @clicked="() => confirmDeleteLeague(league)" />
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else>Sezóna neobsahuje žiadne ligy.</p>

    </div>

    <DeleteModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať ligu ${leagueToDelete?.leagueName}?`"
        @confirm="deleteLeague" @cancel="cancelDelete" />

</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useUserStore } from '@/user';
import DeleteModal from '@/components/DeleteModal.vue';
import { flashMessageMixin } from '@/flashMessageMixin';
import FlashMessage from '@/components/FlashMessage.vue';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            seasonId: null,
            showCreateLeagueForm: false,
            newLeague: {
                name: '',
                leagueType: 'SINGLES'
            },
            showDeleteModal: false,
            leagueToDelete: null,
            loading: true
        }
    },
    created() {
        this.seasonId = this.$route.params.id;
        this.fetchSeason(this.seasonId);
    },
    mixins: [flashMessageMixin],
    methods: {
        async fetchSeason(seasonId) {
            try {
                const response = await axios.get('/api/rest/seasons/' + seasonId + '/stats');
                const season = response.data;

                for (const league of season.leagues) {
                    league.progress = await this.fetchLeagueProgress(league.leagueId)
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
                this.showMessage('✅ Liga ' + res.data.name + ' bola úspešne vytvorená a pridaná do sezóny', 'success');
                console.log('Liga: ' + res.data.name + ' bola úspešne vytvorená.')
                this.showCreateLeagueForm = false;
                this.newLeague = { name: '', leagueType: 'SINGLES', seasonId: '' };
            } catch (err) {
                this.showMessage(err.response.data.name, 'error');
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
            this.showDeleteModal = true;
        },
        async deleteLeague() {
            try {
                await axios.delete('/api/rest/leagues/' + this.leagueToDelete.leagueId);
                await this.fetchSeason(this.seasonId);
                this.showMessage('Liga bola úspešne vymazaná', 'info')
                console.log('Liga bola úspešne zmazaná.');
            } catch (err) {
                console.error('Chyba pri mazaní ligy:', err);
            } finally {
                this.cancelDelete();
            }
        },

        cancelDelete() {
            this.showDeleteModal = false;
            this.leagueToDelete = null;
        },

        inflection(league) {
            const count = league.leagueType === 'SINGLES'
                ? league.totalPlayers
                : league.totalTeams;

            if (league.leagueType === 'SINGLES') {
                if (count === 1) return '1 hráč';
                if (count >= 2 && count <= 4) return `${count} hráči`;
                return `${count} hráčov`;
            } else {
                if (count === 1) return '1 tím';
                if (count >= 2 && count <= 4) return `${count} tímy`;
                return `${count} tímov`;
            }
        },
        async startSeason() {
            this.loading = true;

            try {
                const response = await axios.patch(`/api/rest/seasons/${this.seasonId}/start`);
                this.showMessage(response.data, 'info');
                await this.fetchSeason(this.seasonId);
            } catch (err) {
                if (err.response && err.response.status === 409) {
                    this.showMessage('⚠️ ' + err.response.data.message, 'warning');
                } else {
                    this.showMessage('❌ Nastala chyba pri štartovaní sezóny.', 'error');
                    console.error('Chyba pri štartovaní sezóny:', err);
                }
            } finally {
                this.loading = false;
            }
        },
        async finishSeason() {
            this.loading = true;

            try {
                const response = await axios.patch(`/api/rest/seasons/${this.seasonId}/finish`);
                this.showMessage(response.data, 'success');
                await this.fetchSeason(this.seasonId);
            } catch (err) {
                if (err.response && err.response.status === 409) {
                    this.showMessage(`⚠️ ${err.response.data.message}`, 'warning');
                } else {
                    this.showMessage('❌ Nastala chyba pri ukončovaní sezóny.', 'error');
                    console.error('Chyba pri ukončovaní sezóny:', err);
                }
            } finally {
                this.loading = false;
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
    components: { AppButton, AppHeader, DeleteModal, FlashMessage }
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