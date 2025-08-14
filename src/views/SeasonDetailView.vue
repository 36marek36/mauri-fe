<template>

    <div class="admin-buttons">

        <AppButton v-if="season.status === 'CREATED' && !showCreateLeagueForm" label="Spustiť sezónu" type="create"
            htmlType="button" icon="" @clicked="confirmSeasonAction(season, 'start')" />
        <AppButton v-if="season.status === 'ACTIVE' && !showCreateLeagueForm" label="Ukončiť sezónu" type="delete"
            htmlType="button" icon="" @clicked="confirmSeasonAction(season, 'finish')" />

        <AppButton v-if="isAdmin" :label="showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu'"
            :type="showCreateLeagueForm ? 'delete' : 'default'" htmlType="button" @clicked="toggleCreateForm"
            icon="➕" />

        <div v-if="showCreateLeagueForm" class="create-form">
            <input v-model="newLeague.name" placeholder="Názov ligy" class="form-control" />
            <select v-model="newLeague.leagueType" class="form-control">
                <option value="SINGLES">DVOJHRA</option>
                <option value="DOUBLES">ŠTVORHRA</option>
            </select>

            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕" @clicked="createLeague" />

        </div>
    </div>

    <div v-if="loading">... loading ...</div>

    <div v-else>

        <table v-if="hasLeagues" class="league-table">
            <thead>
                <tr>
                    <th>Liga</th>
                    <th>Typ</th>
                    <!-- <th>Status</th> -->
                    <th v-if="season.status === 'ACTIVE'">Progres</th>
                    <th>Účasť</th>
                    <th v-if="season.status === 'FINISHED'">Víťaz</th>
                    <th v-if="isAdmin">Akcie</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="league in season.leagues" :key="league.id"
                    @click="$router.push('/leagues/' + league.leagueId)" style="cursor: pointer;">
                    <td>{{ league.leagueName }}</td>
                    <td>{{ leagueTypeLabels[league.leagueType] || league.leagueType }}</td>
                    <!-- <td>{{ leagueStatusLabels[league.leagueStatus] }}</td> -->
                    <td v-if="season.status === 'ACTIVE'">
                        <span>{{ league.progress }}%</span>
                        <div class="league-progress-bar">
                            <div class="league-progress-fill" :style="{ width: league.progress + '%' }"></div>
                        </div>
                    </td>
                    <td>
                        {{ inflection(league) }}
                    </td>

                    <td v-if="season.status === 'FINISHED'">
                        <span v-if="league.leagueStatus === 'FINISHED' && league.winner">
                            🏆 {{ league.winner }}
                        </span>
                    </td>

                    <td v-if="isAdmin">
                        <AppButton v-if="isAdmin" icon="🗑️" type="delete" htmlType="button"
                            @clicked="() => confirmDeleteLeague(league)" />
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else>Sezóna neobsahuje žiadne ligy.</p>

    </div>

    <AppModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať ligu ${leagueToDelete?.leagueName}?`"
        @confirm="deleteLeague" @cancel="cancelDelete" />
    <AppModal :visible="showSeasonModal" :message="seasonModalType === 'start'
        ? `Naozaj chceš spustiť sezónu ${seasonToAction?.year}?`
        : `Naozaj chceš ukončiť sezónu ${seasonToAction?.year}?`" @confirm="performSeasonAction"
        @cancel="cancelSeasonAction" />

</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';


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
            showSeasonModal: false,
            seasonToAction: null,
            seasonModalType: null,
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
                const response = await axios.get('/api/rest/seasons/' + seasonId + '/stats');
                const season = response.data;

                for (const league of season.leagues) {
                    league.progress = await this.fetchLeagueProgress(league.leagueId)
                }

                this.season = season;
                const header = useHeaderStore()
                header.setTitle('Sezóna', season.year)
                
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
                this.flash.showMessage('✅ Liga ' + res.data.name + ' bola úspešne vytvorená a pridaná do sezóny', 'success');
                console.log('Liga: ' + res.data.name + ' bola úspešne vytvorená.')
                this.showCreateLeagueForm = false;
                this.newLeague = { name: '', leagueType: 'SINGLES', seasonId: '' };
            } catch (err) {
                this.flash.showMessage(err.response.data.name, 'error');
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
                this.flash.showMessage('Liga bola úspešne vymazaná', 'info')
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
        async performSeasonAction() {
            if (!this.seasonToAction || !this.seasonModalType) return;

            this.loading = true;

            const id = this.seasonToAction.id;
            const action = this.seasonModalType; // 'start' alebo 'finish'

            try {
                const response = await axios.patch(`/api/rest/seasons/${id}/${action}`);
                this.flash.showMessage(response.data, 'success');

                await this.fetchSeason(id);
            } catch (err) {
                if (err.response && err.response.status === 409) {
                    this.flash.showMessage(`⚠️ ${err.response.data.message}`, 'warning');
                } else {
                    const errorText = action === 'start'
                        ? '❌ Nastala chyba pri štartovaní sezóny.'
                        : '❌ Nastala chyba pri ukončovaní sezóny.';

                    this.flash.showMessage(errorText, 'error');
                    console.error('Chyba pri spracovaní sezóny:', err);
                }
            } finally {
                this.loading = false;
                this.cancelSeasonAction();
            }
        },
        confirmSeasonAction(season, type) {
            this.seasonToAction = season;
            this.seasonModalType = type; // 'start' alebo 'finish'
            this.showSeasonModal = true;
        },

        cancelSeasonAction() {
            this.showSeasonModal = false;
            this.seasonToAction = null;
            this.seasonModalType = null;
        }
    },
    computed: {
        userStore() {
            return useUserStore()
        },
        flash() {
            return useFlashMessageStore();
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
        },
    },
    components: { AppButton, AppModal }
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

.league-table td:nth-child(2) {
    white-space: nowrap;
}

.league-table tbody tr:hover {
    background-color: #363537;
}

.league-progress-bar {
    height: 8px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.league-progress-fill {
    height: 100%;
    background-color: #FFCC00;
    transition: width 0.3sease-in-out;
}

.admin-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.create-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
}

.form-control {
    padding: 0.5rem;
    font-size: 1rem;
    width: 250px;
    max-width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .league-table {
        width: 100%;
        table-layout: fixed;
    }

    .league-table th,
    .league-table td {
        font-size: 0.9rem;
        /* menšie písmo na mobiloch */
        padding: 0.2rem;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        /* 💡 umožní lámanie riadkov */
    }
}
</style>