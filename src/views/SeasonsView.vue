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
                <div class="list-or-nothing" v-if="seasons.length === 0">
                    <p>Žiadne sezóny nie sú k dispozícii.</p>
                </div>

                <div v-else class="seasons-grid">
                    <div v-for="season in seasons" :key="season.id" class="season-card"
                        @click="$router.push('/seasons/' + season.id)" role="button" tabindex="0">
                        <h3 class="season-year">{{ season.year }}</h3>

                        <div class="season-info">
                            <h4>{{ season.startDate }}</h4>
                            <p><strong>Ligy:</strong> {{ season.leagues.length }}</p>
                            <p><strong>Hráči:</strong> {{ season.totalPlayers }}</p>
                            <p><strong>Tímy:</strong> {{ season.totalTeams }}</p>
                        </div>

                        <div v-if="isAdmin" class="season-actions">
                            <AppButton icon="🗑️" type="delete" htmlType="button" :preventPropagation="true"
                                @clicked="confirmDeleteSeason(season)" title="Vymazať sezónu" />
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
            seasons: null,
            showCreateSeasonForm: false,
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
                this.seasons = res.data

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
    font-size: 1.5rem;
}

.seasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    width: 100%;
}

.season-card {
    backdrop-filter: blur(5px);
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
    background-color: #002E2C;
    outline: 2px solid #FFD700;
}

.season-card h3 {
    transition: transform 0.8s ease;
}

.season-card:hover h3,
.season-card:focus h3 {
    transform: scale(1.5);
}

.season-year {
    margin: 0 0 12px 0;
    font-size: 2rem;
    font-weight: bold;
}

.season-card .season-info {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: all 0.8s ease;
}

.season-card:hover .season-info,
.season-card:focus .season-info {
    opacity: 1;
    max-height: 220px;
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

@media (max-width: 768px) {
    .seasons-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 80%;
    }

    .season-card {
        width: 100%;
    }
}
</style>