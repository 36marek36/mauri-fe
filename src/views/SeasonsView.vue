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

    <div v-else>
        <div v-if="seasons.length === 0">
            <p>Žiadne sezóny nie sú k dispozícii.</p>
        </div>

        <div v-else class="seasons-grid">
            <div v-for="season in seasons" :key="season.id" class="season-card"
                @click="$router.push('/seasons/' + season.id)" role="button" tabindex="0">
                <h3 class="season-year">{{ season.year }}</h3>

                <div class="season-info">
                    <p><strong>Ligy:</strong> {{ season.leagues.length }}</p>
                    <p><strong>Hráči:</strong> {{ season.totalPlayers }}</p>
                    <p><strong>Tímy:</strong> {{ season.totalTeams }}</p>
                </div>

                <div v-if="isAdmin" class="season-actions">
                    <AppButton icon="🗑️" type="delete" htmlType="button" @clicked="confirmDeleteSeason(season)"
                        title="Vymazať sezónu" />
                </div>
            </div>
        </div>
    </div>

    <AppModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať sezónu: ${season?.year}?`"
        @confirm="deleteSeason" @cancel="cancelDelete" />
</template>

<script>
import axios from 'axios';
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
            loading: true
        }
    },
    created() {
        this.fetchSeasons();
    },
    methods: {
        async fetchSeasons() {
            this.loading = true
            try {
                const res = await axios.get('/api/rest/seasons/')
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
                const res = await axios.post('/api/rest/seasons/create', this.newSeason);
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
                await axios.delete('/api/rest/seasons/' + this.season?.id);
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
        userStore() {
            return useUserStore()
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin
        }
    },
    components: { AppButton, AppModal }
}
</script>

<style scoped>
.seasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}

.season-card {
    backdrop-filter: blur(5px);
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.season-card:hover,
.season-card:focus {
    background-color: #363537;
    outline: 2px solid #FFD700;
}

.season-year {
    margin: 0 0 12px 0;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
}

.season-info p {
    /* display: flex;
    justify-content: center; */
    margin: 6px 0;
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

.create-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
}

@media (max-width: 768px) {
    .seasons-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .season-card {
        width: 90%;
    }
}
</style>