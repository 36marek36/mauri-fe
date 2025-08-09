<template>
    <AppHeader title="Sezóny" />

    <FlashMessage :message="message" :messageType="messageType" />

    <AppButton v-if="isAdmin" :label="showCreateSeasonForm ? 'Zavrieť formulár' : 'Vytvoriť novú sezónu'"
        :type="showCreateSeasonForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" icon="➕" />

    <div v-if="showCreateSeasonForm">
        <input v-model="newSeason.year" placeholder="Rok sezóny:" />

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
                        <th>Rok</th>
                        <th>Počet líg</th>
                        <th>Počet hráčov</th>
                        <th>Počet tímov</th>
                        <th>Status</th>
                        <th v-if="isAdmin">Akcie</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="season in seasons" :key="season.id" @click="$router.push('/seasons/' + season.id)"
                        style="cursor: pointer;">
                        <td>{{ season.year }}</td>
                        <td>{{ season.leagues.length }}</td>
                        <td>{{ season.totalPlayers }}</td>
                        <td>{{ season.totalTeams }}</td>
                        <td>{{ season.status }}</td>
                        <td v-if="isAdmin">
                            <AppButton label="Zmazať" icon="🗑️" type="delete" htmlType="button"
                                @clicked="() => confirmDeleteSeason(season)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <DeleteModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať sezónu: ${season?.year}?`"
        @confirm="deleteSeason" @cancel="cancelDelete" />
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
        this.fetchSeasons()
    },
    mixins: [flashMessageMixin],
    methods: {
        fetchSeasons() {
            axios.get('/api/rest/seasons/')
                .then((res) => {
                    this.seasons = res.data
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
                this.showMessage('Sezóna bola úspešne vytvorená','success');
                this.showCreateSeasonForm = false;
                this.newSeason = { year: '' };
                this.fetchSeasons();
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    const data = err.response.data;

                    // 👉 1. Validácia polí – napr. { "year": "Year is required" }
                    if (data.year) {
                        this.showMessage(data.year,'warning');

                        // 👉 2. Iná chyba – napr. { "message": "Invalid value for field 'year'. Expected a number." }
                    } else if (data.message) {
                        this.showMessage(data.message,'warning');

                        // 👉 3. Neznáma 400 chyba
                    } else {
                        this.showMessage('Chyba: neplatné dáta.','warning');
                    }

                } else {
                    // 👉 Iná ako 400 chyba (500, sieťová chyba atď.)
                    this.showMessage('Neznáma chyba pri vytváraní sezóny.','error');
                    console.error('Chyba pri vytváraní sezóny:', err);
                }
            }
        },
        async deleteSeason() {
            try {
                await axios.delete('/api/rest/seasons/' + this.season?.id);
                this.fetchSeasons();
                this.showMessage('Sezóna bola úspešne zmazaná.','success')
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
        isAdmin() {
            return this.userStore.isAdmin
        }
    },
    components: { AppButton, AppHeader, DeleteModal, FlashMessage }
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
</style>