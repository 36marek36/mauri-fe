<template>
    <div class="create-button-wrapper">
        <AppButton v-if="isAdmin" :label="showCreateSeasonForm ? 'Zavrieť formulár' : 'Vytvoriť novú sezónu'"
            :type="showCreateSeasonForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" icon="➕" />
    </div>

    <div v-if="showCreateSeasonForm" class="create-form">
        <input v-model="newSeason.year" placeholder="Rok sezóny:" class="season-input" />
        <AppButton label="Vytvoriť" type="create" icon="➕" htmlType="button" @clicked="createSeason" />
    </div>

    <div v-if="loading">
        ... loading ...
    </div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="seasons">

                <!-- AKTUÁLNA SEZÓNA -->
                <div v-if="currentSeason">
                    <div class="season-center">
                        <div class="season-card highlight" @click="$router.push('/seasons/' + currentSeason.id)">
                            <h3>Aktuálna</h3>
                            <h3 class="season-year">{{ currentSeason.year }}</h3>
                            <p class="season-date start">{{ currentSeason.startDate }}</p>

                            <div class="season-info">
                                <p><strong>Ligy:</strong> {{ currentSeason.leagues.length }}</p>
                                <p><strong>Hráči:</strong> {{ currentSeason.totalPlayers }}</p>
                                <p><strong>Tímy:</strong> {{ currentSeason.totalTeams }}</p>
                            </div>

                            <div v-if="isAdmin" class="season-actions">
                                <AppButton icon="🗑️" type="delete" @clicked="confirmDeleteSeason(currentSeason)" />
                            </div>

                        </div>
                    </div>

                </div>

                <!-- PRIPRAVOVANÉ -->
                <div v-if="upcomingSeason">


                    <div class="season-center">
                        <div class="season-card highlight" @click="$router.push('/seasons/' + upcomingSeason.id)">
                            <h3>Pripravovaná</h3>
                            <h3 class="season-year">{{ upcomingSeason.year }}</h3>

                            <div class="season-info">
                                <p><strong>Ligy:</strong> {{ upcomingSeason.leagues.length }}</p>
                                <p><strong>Hráči:</strong> {{ upcomingSeason.totalPlayers }}</p>
                                <p><strong>Tímy:</strong> {{ upcomingSeason.totalTeams }}</p>
                            </div>

                            <div v-if="isAdmin" class="season-actions">
                                <AppButton icon="🗑️" type="delete" htmlType="button"
                                    @clicked="confirmDeleteSeason(upcomingSeason)" title="Vymazať sezónu" />
                            </div>

                        </div>
                    </div>
                </div>

                <!-- ARCHÍV -->
                <div>

                    <h3 class="section-title" @click="showArchived = !showArchived">
                        Dokončené
                        <span class="toggle-icon">
                            {{ showArchived ? '▲' : '▼' }}
                        </span>
                    </h3>

                    <div v-if="showArchived">
                        <div v-if="archivedSeasons.length === 0">
                            Žiadne dokončené sezóny
                        </div>

                        <div v-else class="seasons-grid">
                            <div v-for="season in archivedSeasons" :key="season.id" class="season-card"
                                @click="$router.push('/seasons/' + season.id)">
                                <h3 class="season-year">{{ season.year }}</h3>
                                <p class="season-date start">{{ season.startDate }}</p>
                                <p class="season-date end">{{ season.endDate }}</p>

                                <div class="season-info">
                                    <p><strong>Ligy:</strong> {{ season.leagues.length }}</p>
                                    <p><strong>Hráči:</strong> {{ season.totalPlayers }}</p>
                                    <p><strong>Tímy:</strong> {{ season.totalTeams }}</p>
                                </div>

                                <div v-if="isAdmin" class="season-actions">
                                    <AppButton icon="🗑️" type="delete" htmlType="button"
                                        @clicked="confirmDeleteSeason(season)" title="Vymazať sezónu" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
    <AppModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať sezónu: ${season?.year}?`"
        @confirm="deleteSeason" @cancel="cancelDelete" />
</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'SeasonsView',
    data() {
        return {
            seasons: [],
            showCreateSeasonForm: false,
            showArchived: false,
            newSeason: {
                year: ''
            },
            showDeleteModal: false,
            season: null,
            loading: true,
            userStore: useUserStore()
        }
    },
    created() {
        this.fetchSeasons();
    },
    methods: {
        async fetchSeasons() {
            this.loading = true
            try {
                const res = await api.get('/seasons/')
                this.seasons = Array.isArray(res.data) ? res.data : []

                const header = useHeaderStore()
                header.setTitle('Sezóny', '')
            } catch (error) {
                console.error('Chyba pri načítavaní sezón:', error)
            } finally {
                this.loading = false
            }
        },
        toggleCreateForm() {
            this.showCreateSeasonForm = !this.showCreateSeasonForm
        },
        async createSeason() {
            try {
                const res = await api.post('/seasons/create', this.newSeason);
                console.log('Sezóna: ' + res.data.year + ' bola úspešne vytvorená.')
                this.flash.showMessage('Sezóna bola úspešne vytvorená', 'success');
                this.showCreateSeasonForm = false;
                this.newSeason = { year: '' };
                this.fetchSeasons();
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
        async deleteSeason() {
            try {
                await api.delete('/seasons/' + this.season?.id);
                this.fetchSeasons();
                this.flash.showMessage('Sezóna bola úspešne zmazaná.', 'success')
                console.log('Sezóna bola úspešne zmazaná.');
            } catch (err) {
                console.error('Chyba pri mazaní sezóny:', err);
            } finally {
                this.cancelDelete();
            }

        },
        confirmDeleteSeason(season) {
            this.season = season;
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.season = null;
            this.showDeleteModal = false;
        }
    },
    computed: {
        currentSeason() {
            return this.seasons?.find(s => s.status === 'ACTIVE') || null
        },

        upcomingSeason() {
            return this.seasons?.find(s => s.status === 'CREATED') || null
        },

        archivedSeasons() {
            return this.seasons?.filter(s => s.status === 'FINISHED') || []
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin
        },
    },
    components: { AppButton, AppModal }
}
</script>

<style scoped>
.seasons {
    width: 100%;
}

.list-or-nothing {
    align-items: center;
    /* font-size: 1.5rem; */
}

.season-center {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.season-center .season-card {
    max-width: 320px;
    width: 100%;
}

.seasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    width: 100%;
}

.season-card {
    background-color: #002E2C;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    padding: 16px;
    display: flex;
    text-align: center;
    flex-direction: column;
    justify-content: space-between;
}

.season-card:hover,
.season-card:focus {
    background-color: #004744;
    outline: 2px solid #FFD700;
}

.season-card h3 {
    transition: transform 0.8s ease;
}

.toggle-icon {
    font-size: 1rem;
    opacity: 0.7;
}

.season-card:hover .season-year,
.season-card:focus .season-year {
    transform: translateY(-2px) scale(1.2);
}

.season-actions {
    margin-top: 12px;
    align-self: flex-end;
}

.season-input {
    padding: 0.5rem;
    font-size: 1rem;
    width: 250px;
    max-width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.create-button-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.highlight {
    border: 2px solid gold;
    transform: scale(1.03);
}

.season-days {
    margin-top: 6px;
    font-size: 0.9rem;
    opacity: 0.8;
}

.season-date {
    padding: 4px 10px;
    font-size: 1.2rem;
    color: #d9ff00;
}

/* začiatok */
.season-date.start::before {
    content: "▶";
    margin-right: 6px;
}

/* koniec */
.season-date.end::before {
    content: "■";
    margin-right: 6px;
    color: #ff0000;
}

.season-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 10px;
}

.season-info p {
    margin: 0;
    padding: 8px 10px;
    background: #4b5563;
    /* tmavý card look */
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    color: #e2e2e2;
}

.season-info strong {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 2px;
}

.section-title {
    border-radius: 10px;
    background: #002E2C;
    border: 2px solid gold;
    margin: 20px 0 10px;
    cursor: pointer;
    transition: background 0.2s ease;
}

@media (max-width: 768px) {
    .seasons-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin: 0 auto;
    }

    .season-card {
        width: 100%;
    }
}
</style>