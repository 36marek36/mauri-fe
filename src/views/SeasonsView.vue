<template>

    <FlashMessage />

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

        <div v-else>
            <table class="season-table">
                <thead>
                    <tr>
                        <th>Sezóna</th>
                        <th>Ligy</th>
                        <th>Hráči</th>
                        <th>Tími</th>
                        <th v-if="isAdmin">Akcie</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="season in seasons" :key="season.id" @click="$router.push('/seasons/' + season.id)"
                        style="cursor: pointer;">
                        <td class="season-name">
                            <span class="status-dot" :class="season.status.toLowerCase()"></span>
                            {{ season.year }}
                        </td>
                        <td>{{ season.leagues.length }}</td>
                        <td>{{ season.totalPlayers }}</td>
                        <td>{{ season.totalTeams }}</td>
                        <td v-if="isAdmin">
                            <AppButton icon="🗑️" type="delete" htmlType="button"
                                @clicked="() => confirmDeleteSeason(season)" />
                        </td>
                    </tr>
                </tbody>
            </table>
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
import FlashMessage from '@/components/FlashMessage.vue';
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
        fetchSeasons() {
            axios.get('/api/rest/seasons/')
                .then((res) => {
                    this.seasons = res.data
                    const header = useHeaderStore()
                    header.setTitle('Sezóny', '')
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri nacitavani sezon:', error)
                    this.loading = false
                })
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

                    // 👉 1. Validácia polí – napr. { "year": "Year is required" }
                    if (data.year) {
                        this.flash.showMessage(data.year, 'warning');

                        // 👉 2. Iná chyba – napr. { "message": "Invalid value for field 'year'. Expected a number." }
                    } else if (data.message) {
                        this.flash.showMessage(data.message, 'warning');

                        // 👉 3. Neznáma 400 chyba
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
    components: { AppButton, AppModal, FlashMessage }
}
</script>

<style scoped>
ul {
    list-style-type: none;
    border: 1px solid #cdcdcd;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}

li:not(:last-child) {
    border-bottom: 1px solid #cdcdcd;
}

.season-table {
    width: 50%;
    border-collapse: collapse;
}

.season-table th,
.season-table td {
    border-bottom: 1px solid #eee;
    padding: 0.5rem;
    text-align: left;

}

.season-table th {
    text-transform: uppercase;
    font-size: 0.85rem;
    color: whitesmoke;
}

.season-table tbody tr:hover {
    background-color: #363537;
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

.season-input {
    padding: 0.5rem;
    font-size: 1rem;
    width: 250px;
    max-width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.5rem;
    vertical-align: middle;
}

.status-dot.created {
    background-color: #FFC107;
}

.status-dot.active {
    background-color: #4CAF50;
}

.status-dot.finished {
    background-color: #f44336;
}

@media (max-width: 768px) {
    .season-table {
        width: 100%;
        table-layout: fixed;
    }

    .season-table th,
    .season-table td {
        /* font-size: 0.9rem; */
        /* menšie písmo na mobiloch */
        padding: 0.2rem;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        /* 💡 umožní lámanie riadkov */
    }
}
</style>