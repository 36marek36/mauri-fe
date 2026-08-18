<template>

    <div class="admin-buttons">

        <!-- Tlačidlo: Spustiť sezónu -->
        <AppButton v-if="isAdmin && season.status === 'CREATED' && !showCreateTennisLeagueForm" label="Spustiť sezónu"
            type="create" htmlType="button" icon="" @clicked="confirmSeasonAction(season, 'start')" />

        <!-- Tlačidlo: Ukončiť sezónu -->
        <AppButton v-if="isAdmin && season.status === 'ACTIVE' && !showCreateTennisLeagueForm" label="Ukončiť sezónu"
            type="delete" htmlType="button" icon="" @clicked="confirmSeasonAction(season, 'finish')" />

        <!-- Tlačidlo: Vytvoriť tenisovú novú ligu / Zavrieť formulár -->
        <AppButton v-if="isAdmin && season.status !== 'FINISHED'"
            :label="showCreateTennisLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú tenisovú ligu'"
            :type="showCreateTennisLeagueForm ? 'delete' : 'default'" htmlType="button" @clicked="toggleCreateForm"
            icon="➕" />

        <div v-if="showCreateTennisLeagueForm" class="create-form">
            <input v-model="newLeague.name" placeholder="Názov ligy" class="form-control" />
            <select v-model="newLeague.leagueType" class="form-control">
                <option value="SINGLES">DVOJHRA</option>
                <option value="DOUBLES">ŠTVORHRA</option>
            </select>

            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕" @clicked="createTennisLeague" />

        </div>

        <!-- Tlačidlo: Vytvoriť novú volejbalovú ligu / Zavrieť formulár -->
        <AppButton v-if="isAdmin && season.status !== 'FINISHED'" :label="showCreateVolleyLeagueForm
            ? 'Zavrieť formulár'
            : 'Vytvoriť novú volejbalovú ligu'" :type="showCreateVolleyLeagueForm ? 'delete' : 'default'"
            htmlType="button" @clicked="toggleCreateVolleyLeagueForm" icon="➕" />

        <div v-if="showCreateVolleyLeagueForm" class="create-form">
            <input v-model="newVolleyLeague.name" placeholder="Názov volejbalovej ligy" class="form-control" />

            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕"
                :disabled="!newVolleyLeague.name.trim()" @clicked="createVolleyLeague" />
        </div>
    </div>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="leagues">
                <div class="list-or-nothing">

                    <!-- SINGLES -->
                    <h3>Dvojhry</h3>
                    <table v-if="singleLeagues.length" class="league-table">
                        <tbody>
                            <tr v-for="league in singleLeagues" :key="league.id"
                                @click="$router.push('/tennis/leagues/' + league.leagueId)" class="league-row">

                                <td>{{ league.leagueName }}</td>

                                <td>{{ inflection(league) }}</td>


                                <td v-if="season.status === 'ACTIVE'">
                                    <CircularProgress :progress="league.leagueProgress" />
                                </td>


                                <td v-if="season.status === 'FINISHED'">
                                    <span v-if="league.leagueStatus === 'FINISHED' && league.winner">
                                        🏆 {{ league.winner }}
                                    </span>
                                </td>

                                <td v-if="isAdmin">
                                    <AppButton icon="🗑️" type="delete" htmlType="button"
                                        @clicked="() => confirmDeleteLeague(league)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- DOUBLES -->
                    <h3>Štvorhry</h3>
                    <table v-if="doubleLeagues.length" class="league-table">
                        <tbody>
                            <tr v-for="league in doubleLeagues" :key="league.id"
                                @click="$router.push('/tennis/leagues/' + league.leagueId)" class="league-row">

                                <td>{{ league.leagueName }}</td>

                                <td>{{ inflection(league) }}</td>


                                <td v-if="season.status === 'ACTIVE'">
                                    <CircularProgress :progress="league.leagueProgress" />
                                </td>


                                <td v-if="season.status === 'FINISHED'">
                                    <span v-if="league.leagueStatus === 'FINISHED' && league.winner">
                                        🏆 {{ league.winner }}
                                    </span>
                                </td>

                                <td v-if="isAdmin">
                                    <AppButton icon="🗑️" type="delete" htmlType="button"
                                        @clicked="() => confirmDeleteLeague(league)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p v-if="!singleLeagues.length && !doubleLeagues.length">
                        Sezóna neobsahuje žiadne ligy.
                    </p>

                </div>
            </div>
            <!-- <div class="leagues">
                <div class="list-or-nothing">
                    <table v-if="hasLeagues" class="league-table">
                        <tbody>
                            <tr v-for="league in season.leagues" :key="league.id"
                                @click="$router.push('/leagues/' + league.leagueId)" class="league-row">
                                <td>{{ league.leagueName }}</td>
                                <td>
                                    <img v-for="n in leagueTypeLabels[league.leagueType].count" :key="n"
                                        src="/images/icon-racket.png" class="icon" />
                                </td>
                                <td v-if="season.status === 'ACTIVE'">
                                    <CircularProgress :progress="league.leagueProgress" />
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
                                        :preventPropagation="true" @clicked="() => confirmDeleteLeague(league)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else>Sezóna neobsahuje žiadne ligy.</p>
                </div>
            </div> -->
        </div>
    </div>

    <AppModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať ligu ${leagueToDelete?.leagueName}?`"
        @confirm="deleteLeague" @cancel="cancelDelete" />
    <AppModal :visible="showSeasonModal" :message="seasonModalType === 'start'
        ? `Naozaj chceš spustiť sezónu ${seasonToAction?.year}?`
        : `Naozaj chceš ukončiť sezónu ${seasonToAction?.year}?`" @confirm="performSeasonAction"
        @cancel="cancelSeasonAction" />

</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import CircularProgress from '@/components/CircularProgress.vue';
import { inflection } from '@/utils/inflection';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            showCreateTennisLeagueForm: false,
            newLeague: {
                name: '',
                leagueType: 'SINGLES'
            },
            showCreateVolleyLeagueForm: false,
            newVolleyLeague: {
                name: ''
            },
            showDeleteModal: false,
            leagueToDelete: null,
            showSeasonModal: false,
            seasonToAction: null,
            seasonModalType: null,
            loading: true,
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        const seasonId = this.$route.params.id;
        this.fetchSeason(seasonId);
    },

    methods: {
        async fetchSeason(seasonId) {
            try {
                const response = await api.get('/seasons/' + seasonId + '/stats');
                const season = response.data;

                this.season = season;

                this.header.setTitle('Sezóna', season.year)

                this.loading = false;
            } catch (err) {
                console.error('Chyba pri načítavaní sezóny:', err);
                this.loading = false;
            }
        },

        async createTennisLeague() {
            try {
                const seasonId = this.$route.params.id; // id sezóny z URL

                // ...this.newLeague skopíruje všetky vlastnosti objektu newLeague
                // Potom tam ešte pridáš alebo prepíšeš seasonId
                //  Výsledkom je nový objekt s kombinovanými údajmi
                const payload = {
                    ...this.newLeague,
                    seasonId // pridáme do payloadu
                };

                const res = await api.post('/leagues/create', payload);
                const { leagueName } = res.data;

                this.flash.showMessage(`✅ Liga ${leagueName} bola úspešne vytvorená a pridaná do sezóny`, 'success');
                console.log(`Liga ${leagueName} bola úspešne vytvorená.`);

                this.showCreateTennisLeagueForm = false;

                // Obnovíme sezónu, aby sa nová liga zobrazila v tabuľke
                await this.fetchSeason(seasonId);

                // Reset formulára
                this.newLeague = { name: '', leagueType: 'SINGLES' };

            } catch (err) {
                if (err.response?.status === 400) {
                    const msg = err.response.data?.message || 'Chyba: neplatné dáta.';
                    this.flash.showMessage(msg, 'warning');
                } else {
                    this.flash.showMessage('❌ Neznáma chyba pri vytváraní ligy.', 'error');
                    console.error('Chyba pri vytváraní ligy:', err);
                }
            }
        },
        async createVolleyLeague() {
            try {
                const seasonId = this.$route.params.id;

                const payload = {
                    leagueName: this.newVolleyLeague.name.trim(),
                    seasonId
                };

                const res = await api.post('/volleyball/volley_leagues/create', payload);

                this.flash.showMessage(
                    `✅ Liga ${res.data.leagueName} bola úspešne vytvorená a pridaná do sezóny`,
                    'success'
                );

                this.newVolleyLeague = {
                    name: ''
                };

                this.showCreateVolleyLeagueForm = false;

                await this.fetchSeason(seasonId);

            } catch (err) {
                if (err.response?.status === 400) {
                    const msg = err.response.data?.message ||
                        'Chyba: neplatné dáta.';

                    this.flash.showMessage(msg, 'warning');
                } else {
                    this.flash.showMessage(
                        '❌ Chyba pri vytváraní volejbalovej ligy.',
                        'error'
                    );

                    console.error(
                        'Chyba pri vytváraní volejbalovej ligy:',
                        err
                    );
                }
            }
        },
        toggleCreateVolleyLeagueForm() {
            this.showCreateVolleyLeagueForm =
                !this.showCreateVolleyLeagueForm;
        },

        toggleCreateForm() {
            this.showCreateTennisLeagueForm = !this.showCreateTennisLeagueForm
        },

        confirmDeleteLeague(league) {
            this.leagueToDelete = league;
            this.showDeleteModal = true;
        },
        async deleteLeague() {
            try {
                await api.delete('/leagues/' + this.leagueToDelete.leagueId);
                await this.fetchSeason(this.season.id);
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

        inflection,

        async performSeasonAction() {
            if (!this.seasonToAction || !this.seasonModalType) return;

            this.loading = true;

            const id = this.seasonToAction.id;
            const action = this.seasonModalType; // 'start' alebo 'finish'

            try {
                const response = await api.patch(`/seasons/${id}/${action}`);
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
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin
        },
        hasLeagues() {
            return this.season.leagues.length > 0;
        },
        singleLeagues() {
            return this.season.leagues.filter(l => l.leagueType === 'SINGLES')
        },
        doubleLeagues() {
            return this.season.leagues.filter(l => l.leagueType === 'DOUBLES')
        }
    },
    components: { AppButton, AppModal, CircularProgress }
}

</script>

<style scoped>
h3 {
    font-size: 1.2rem;
}

.leagues {
    width: 100%;
}

.list-or-nothing {
    align-items: center;
}

.league-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

.league-table td {
    padding-left: 2rem;
    text-align: left;
    white-space: normal;
}

.league-row {
    font-size: x-large;
    height: 60px;
    cursor: pointer;
}

.league-table tbody tr:hover {
    background-color: #363537;
}

.admin-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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
    }

    .league-table td {
        font-size: 0.9rem;
        /* padding: 0.2rem; */
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        /* 💡 umožní lámanie riadkov */
    }
}
</style>