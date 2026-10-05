<template>

    <div v-if="loading">
        ... loading ...
    </div>

    <div v-else-if="!season">
        <h2>
            Momentálne nie je vytvorená žiadna aktívna ani pripravovaná sezóna
        </h2>

        <div class="create-season">
            <input v-model="newSeason.year" placeholder="Rok sezóny" class="form-control" />

            <AppButton label="Vytvoriť" type="create" icon="➕" htmlType="button" @clicked="createSeason" />
        </div>
    </div>

    <div v-else class="main-layout">

        <!-- HEADER -->
        <div class="season-header">
            <h1>Sezóna {{ season.year }}</h1>

            <h4 class="season-status">
                {{ seasonStatusLabel[season.status] }}
            </h4>

            <div class="season-actions">

                <AppButton label="Zmazať" type="delete" htmlType="button"
                    @clicked="confirmSeasonAction(season, 'delete')" />

                <!-- Tlačidlo: Spustiť sezónu -->
                <AppButton v-if="season.status === 'CREATED'" label="Spustiť sezónu" type="create" htmlType="button"
                    @clicked="confirmSeasonAction(season, 'start')" />
                <!-- Tlačidlo: Ukončiť sezónu -->
                <AppButton v-if="season.status === 'ACTIVE'" label="Ukončiť sezónu" type="delete" htmlType="button"
                    @clicked="confirmSeasonAction(season, 'finish')" />

            </div>
        </div>


        <!-- SPORTS -->
        <div class="sports-layout">

            <!-- TENNIS -->
            <section class="sport-section">
                <div class="list-or-nothing">
                    <div class="sport-header">
                        <h2>🎾 Tenis</h2>

                        <AppButton label="Vytvoriť ligu" type="create" icon="➕" htmlType="button"
                            @clicked="showCreateTennisLeagueForm = !showCreateTennisLeagueForm" />
                    </div>

                    <div v-if="showCreateTennisLeagueForm" class="create-league-form">

                        <input v-model="newLeague.name" placeholder="Názov ligy" class="form-control" />

                        <select v-model="newLeague.leagueType">
                            <option value="SINGLES">Dvojhra</option>
                            <option value="DOUBLES">Štvorhra</option>
                        </select>

                        <div class="create-league-buttons">
                            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕"
                                :disabled="!newLeague.name.trim()" @clicked="createTennisLeague" />

                            <AppButton label="Zrušiť" type="default" htmlType="button"
                                @clicked="cancelCreateTennisLeague" />
                        </div>

                    </div>


                    <div v-if="!season.leagues?.length" class="empty-state">
                        Zatiaľ nie sú vytvorené žiadne tenisové ligy.
                    </div>

                    <div v-else class="league-list">

                        <!-- KATEGÓRIE: DVOJHRY / ŠTVORHRY -->
                        <div v-for="(leagues, type) in leaguesByType" :key="type">

                            <!-- NÁZOV KATEGÓRIE -->
                            <h3 v-if="leagues.length" class="league-category-title">
                                {{ leagueTypeLabels[type] }}
                            </h3>

                            <!-- LIGY V KATEGÓRII -->
                            <div v-for="league in leagues" :key="league.id" class="league-card">

                                <div class="league-card-header" @click="selectLeague(league)">

                                    <div class="league-label">
                                        <h4>{{ league.name }}</h4>
                                    </div>

                                    <div class="league-stats">

                                        <span v-if="league.leagueType === 'SINGLES'">
                                            👤 {{ inflection('player', league.players?.length) }}
                                        </span>

                                        <span v-else-if="league.leagueType === 'DOUBLES'">
                                            👥 {{ inflection('team', league.teams?.length) }}
                                        </span>

                                    </div>

                                    <div class="leagueDelete-button">
                                        <AppButton icon="🗑️" type="delete" htmlType="button" title="Vymazať ligu"
                                            @click="confirmDeleteLeague(league, 'tennis')" />
                                    </div>

                                </div>


                                <!-- ÚČASTNÍCI TEJTO LIGY -->
                                <div v-if="selectedLeague?.id === league.id" class="league-participants">

                                    <h4>Účastníci</h4>

                                    <div v-if="league.leagueType === 'SINGLES'" v-for="player in league.players"
                                        :key="player.id" class="participant-row">
                                        <span class="participant-name">
                                            {{ player.name }}
                                        </span>

                                        <div class="detail-actions">

                                            <AppButton label="Odhlásiť" type="edit" htmlType="button"
                                                @clicked.stop="confirmDropParticipant('players', player.id)" />

                                            <AppButton label="Odstrániť" type="delete" htmlType="button"
                                                @clicked.stop="confirmDeleteParticipant('players', player)" />
                                        </div>
                                    </div>

                                    <div v-if="league.leagueType === 'DOUBLES'" v-for="team in league.teams"
                                        :key="team.id" class="participant-row">
                                        <span class="participant-name">
                                            {{ team.name }}
                                        </span>
                                        <div class="detail-actions">

                                            <AppButton label="Odhlásiť" type="edit" htmlType="button"
                                                @clicked.stop="confirmDropParticipant('players', player.id)" />

                                            <AppButton label="Odstrániť" type="delete" htmlType="button"
                                                @clicked.stop="confirmDeleteParticipant('teams', team)" />
                                        </div>
                                    </div>

                                    <div v-if="league.leagueType === 'SINGLES' && !league.players?.length"
                                        class="empty-state">
                                        Liga zatiaľ nemá žiadnych hráčov.
                                    </div>

                                    <div v-if="league.leagueType === 'DOUBLES' && !league.teams?.length"
                                        class="empty-state">
                                        Liga zatiaľ nemá žiadne tímy.
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>




            </section>


            <!-- VOLLEYBALL -->
            <section class="sport-section">
                <div class="list-or-nothing">
                    <div class="sport-header">
                        <h2>🏐 Volejbal</h2>

                        <AppButton label="Vytvoriť ligu" type="create" icon="➕" htmlType="button"
                            @clicked="showCreateVolleyLeagueForm = !showCreateVolleyLeagueForm" />
                    </div>
                    <div v-if="showCreateVolleyLeagueForm" class="create-league-form">

                        <input v-model="newVolleyLeague.name" placeholder="Názov ligy" class="form-control" />

                        <div class="create-league-buttons">
                            <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕"
                                :disabled="!newVolleyLeague.name.trim()" @clicked="createVolleyLeague" />

                            <AppButton label="Zrušiť" type="default" htmlType="button"
                                @clicked="cancelCreateVolleyLeague" />
                        </div>

                    </div>

                    <div v-if="!season.volleyLeagues?.length" class="empty-state">
                        Zatiaľ nie sú vytvorené žiadne volejbalové ligy.
                    </div>

                    <div v-else class="league-list">

                        <div v-for="league in season.volleyLeagues" :key="league.id" class="league-card">

                            <div class="league-card-header" @click="selectLeague(league)">
                                <div class="league-label">
                                    <h4>{{ league.name }}</h4>
                                </div>

                                <div class="league-stats">
                                    <span>
                                        👥 {{ inflection('team', league.teams?.length) }}
                                    </span>
                                </div>

                                <div>
                                    <AppButton icon="🗑️" type="delete" htmlType="button" title="Vymazať ligu"
                                        @click="confirmDeleteLeague(league, 'volleyball')" />
                                </div>
                            </div>





                            <!-- TÍMY VO VYBRANEJ LIGE -->
                            <div v-if="selectedLeague?.id === league.id" class="league-participants">

                                <h4>Účastníci</h4>

                                <div v-for="team in league.teams" :key="team.id" class="participant-row">
                                    <span>
                                        {{ team.name }}
                                    </span>
                                </div>

                                <div v-if="!league.teams?.length" class="empty-state">
                                    Liga zatiaľ nemá žiadne tímy.
                                </div>

                            </div>

                        </div>

                    </div>

                </div>





            </section>

        </div>

    </div>
    <AppModal :visible="showSeasonModal" :message="seasonActionMessage" @confirm="executeSeasonAction"
        @cancel="cancelSeasonAction" />
    <AppModal :visible="showDeleteLeagueModal" :message="`Naozaj chcete zmazať ligu: ${leagueToDelete?.name}?`"
        @confirm="deleteLeague" @cancel="cancelDeleteLeague" />
    <AppModal :visible="showDeleteParticipantModal" title="Odstránenie z ligy" :message="`Naozaj chcete odstrániť ${participantTypeToDelete === 'players' ? 'hráča' : 'tím'
        } ${participantForAction?.name} z ligy?`" @confirm="removeParticipantFromLeague"
        @cancel="cancelDeleteParticipant" />


</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { inflection } from '@/utils/inflection';

export default {
    name: 'SeasonsView',
    data() {
        return {
            season: [],
            seasonForAction: null,
            seasonAction: null,
            leagueToDelete: null,
            leagueTypeToDelete: null,
            participantForAction: null,
            participantTypeToDelete: null,
            selectedLeague: null,
            newSeason: {
                year: ''
            },
            newLeague: {
                name: '',
                leagueType: 'SINGLES'
            },
            newVolleyLeague: {
                name: ''
            },
            showCreateTennisLeagueForm: false,
            showCreateVolleyLeagueForm: false,
            showSeasonModal: false,
            showDeleteLeagueModal: false,
            showDeleteParticipantModal: false,
            loading: true
        }
    },
    created() {
        this.fetchSeason();
    },
    methods: {
        async fetchSeason() {
            this.loading = true

            try {
                const res = await api.get('/seasons/admin/current')
                this.season = res.data
            } catch (error) {
                if (error.response?.status === 404) {
                    this.season = null
                } else {
                    console.error('Chyba pri načítavaní sezóny:', error)
                }
            } finally {
                this.loading = false
            }
        },
        inflection,
        async createSeason() {
            try {
                const res = await api.post('/seasons/create', this.newSeason);
                console.log('Sezóna: ' + res.data.year + ' bola úspešne vytvorená.')
                this.flash.showMessage('Sezóna bola úspešne vytvorená', 'success');
                this.newSeason = { year: '' };
                this.fetchSeason();
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    const data = err.response.data;
                    if (data.message) {
                        this.flash.showMessage(data.message, 'warning');
                    } else {
                        this.flash.showMessage('Chyba: neplatné dáta.', 'warning');
                    }
                } else {
                    // 👉 Iná ako 400 chyba (500, sieťová chyba atď.)
                    this.flash.showMessage('Neznáma chyba pri vytváraní sezóny.', 'error');
                    console.error('Chyba pri vytváraní sezóny:', err);
                }
            }
        },
        async executeSeasonAction() {
            try {
                const seasonId = this.seasonForAction?.id

                if (!seasonId) {
                    return
                }

                if (this.seasonAction === 'start') {
                    await api.patch(`/seasons/${seasonId}/start`)
                    this.flash.showMessage(
                        'Sezóna bola úspešne spustená.',
                        'success'
                    )
                }

                if (this.seasonAction === 'finish') {
                    await api.patch(`/seasons/${seasonId}/finish`)
                    this.flash.showMessage(
                        'Sezóna bola úspešne ukončená.',
                        'success'
                    )
                }

                if (this.seasonAction === 'delete') {
                    await api.delete(`/seasons/${seasonId}`)
                    this.flash.showMessage(
                        'Sezóna bola úspešne zmazaná.',
                        'success'
                    )
                }

                await this.fetchSeason()

            } catch (err) {
                console.error('Chyba pri akcii nad sezónou:', err)
            } finally {
                this.cancelSeasonAction()
            }
        },
        confirmSeasonAction(season, action) {
            this.seasonForAction = season
            this.seasonAction = action
            this.showSeasonModal = true
        },
        cancelSeasonAction() {
            this.seasonForAction = null
            this.seasonAction = null
            this.showSeasonModal = false
        },
        confirmDeleteLeague(league, type) {
            this.leagueToDelete = league
            this.leagueTypeToDelete = type
            this.showDeleteLeagueModal = true
        },
        cancelDeleteLeague() {
            this.leagueToDelete = null
            this.leagueTypeToDelete = null
            this.showDeleteLeagueModal = false
        },
        confirmDeleteParticipant(type, participant) {
            this.participantForAction = participant
            this.participantTypeToDelete = type
            this.showDeleteParticipantModal = true
        },
        cancelDeleteParticipant() {
            this.participantForAction = null
            this.participantTypeToDelete = null
            this.showDeleteParticipantModal = false
        },
        async removeParticipantFromLeague() {
            try {

                const response = await api.delete(`/leagues/${this.selectedLeague.id}/participants/${this.participantForAction?.id}`)
                this.flash.showMessage(response.data, 'info')
                await this.fetchSeason();
            } catch (err) {
                console.error('Chyba pri mazaní ligy:', err)
            } finally {
                this.cancelDeleteParticipant()
            }
        },
        async dropParticipantFromLeague() {
            try {

                const response = await api.patch(`/leagues/${this.selectedLeague.id}/participants/${this.participantForAction?.id}/drop`)
                this.flash.showMessage(response.data, 'info')
                await this.fetchSeason();
            } catch (err) {
                console.error('Chyba pri mazaní ligy:', err)
            } finally {
                this.cancelDeleteParticipant()
            }
        },
        async createTennisLeague() {
            try {
                const seasonId = this.season.id;

                const payload = {
                    ...this.newLeague,
                    seasonId
                };

                const res = await api.post('/leagues/create', payload);
                const { leagueName } = res.data;

                this.flash.showMessage(`✅ Liga ${leagueName} bola úspešne vytvorená a pridaná do sezóny`, 'success');
                console.log(`Liga ${leagueName} bola úspešne vytvorená.`);

                this.showCreateTennisLeagueForm = false;

                await this.fetchSeason();

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
        cancelCreateTennisLeague() {
            this.showCreateTennisLeagueForm = false
            this.newLeague = {
                name: '',
                leagueType: 'SINGLES'
            }
        },
        async createVolleyLeague() {
            try {
                const seasonId = this.season.id;

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

                await this.fetchSeason();

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
        cancelCreateVolleyLeague() {
            this.showCreateVolleyLeagueForm = false
            this.newVolleyLeague = {
                name: ''
            }
        },
        async deleteLeague() {
            try {
                const id = this.leagueToDelete?.id

                if (this.leagueTypeToDelete === 'tennis') {
                    await api.delete(`/leagues/${id}`)
                }

                if (this.leagueTypeToDelete === 'volleyball') {
                    await api.delete(`/volleyball/volley_leagues/${id}`)
                }

                await this.fetchSeason()

                this.flash.showMessage(
                    'Liga bola úspešne zmazaná.',
                    'success'
                )
            } catch (err) {
                console.error('Chyba pri mazaní ligy:', err)
            } finally {
                this.cancelDeleteLeague()
            }
        },
        toggleCreateForm() {
            this.showCreateTennisLeagueForm = !this.showCreateTennisLeagueForm
        },
        toggleCreateVolleyLeagueForm() {
            this.showCreateVolleyLeagueForm =
                !this.showCreateVolleyLeagueForm;
        },
        selectLeague(league) {
            if (this.selectedLeague?.id === league.id) {
                this.selectedLeague = null
            } else {
                this.selectedLeague = league
            }
        }
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        },
        seasonActionMessage() {
            if (!this.seasonForAction) {
                return ''
            }

            switch (this.seasonAction) {
                case 'start':
                    return `Naozaj chcete spustiť sezónu ${this.seasonForAction.year}?`

                case 'finish':
                    return `Naozaj chcete ukončiť sezónu ${this.seasonForAction.year}?`

                case 'delete':
                    return `Naozaj chcete zmazať sezónu ${this.seasonForAction.year}?`

                default:
                    return ''
            }
        },
        seasonStatusLabel() {
            return {
                CREATED: 'Pripravovaná',
                ACTIVE: "Aktuálna"
            }
        },
        leagueTypeLabels() {
            return {
                SINGLES: 'Dvojhra',
                DOUBLES: 'Štvorhra',
            };
        },
        leaguesByType() {
            return {
                SINGLES: this.season.leagues.filter(
                    league => league.leagueType === 'SINGLES'
                ),
                DOUBLES: this.season.leagues.filter(
                    league => league.leagueType === 'DOUBLES'
                ),
            };
        },
        flash() {
            return useFlashMessageStore();
        }
    },
    components: { AppButton, AppModal }
}
</script>

<style scoped>
.main-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.list-or-nothing {
    align-items: center;
}

.season-header {
    text-align: center;
}

.season-header h1 {
    margin-bottom: 10px;
}

.season-status {
    display: inline-block;
    padding: 10px 30px;
    border-radius: 10px;
    border: 1px solid whitesmoke;
    background: #000000;
    margin-bottom: 15px;
}

.season-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.sports-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
}

.sport-section {
    border-radius: 12px;
    padding: 0 20px;
}

.sport-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
}

.sport-header h2 {
    margin: 0;
}

.create-league-form {
    width: 100%;
    text-align: center;
}

.create-league-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding: 0.5rem;
}

.league-list {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.league-category-title {
    font-size: 1.3rem;
}

.league-card {
    border-bottom: 1px solid whitesmoke;
    padding: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.league-card:last-child {
    border-bottom: none;
}

.league-card-header {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.league-label {
    flex: 2;
}

.league-label h4 {
    text-align: left;
}

.league-stats {
    flex: 1;
    color: #c2c2c2;
}

.league-label h4:hover {
    color: #FFD700;
}

.league-participants {
    text-align: center;
    padding: 15px 0;
}

.participant-row {
    display: flex;
    width: 100%;
    text-align: left;
    padding-left: 5px;
}

.participant-name {
    flex: 1
}

.detail-actions {
    gap: 8px;
}

.empty-state {
    padding: 10px;
    color: #b1b1b1;
}

.create-season {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.form-control {
    padding: 0.5rem;
    font-size: 1rem;
    width: 250px;
    max-width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
}

@media (max-width: 900px) {
    .sports-layout {
        grid-template-columns: 1fr;
    }

    .league-category-title {
        font-size: 1.2rem;
    }

    .league-label h4 {
        font-size: 1rem;
    }

    .league-stats {
        font-size: 0.8rem;
    }

    .empty-state {
        font-size: 1rem;
    }
}
</style>