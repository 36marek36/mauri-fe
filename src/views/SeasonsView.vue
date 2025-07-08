<template>
    <AppHeader title="Sezóny" />
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

        <ul v-else>
            <li v-for="season in seasons" :key="season.id" @click="$router.push('/seasons/' + season.id)">
                Sezóna {{ season.year }}

                <AppButton v-if="isAdmin" label="Zmazať" icon="🗑️" type="delete" htmlType="button"
                    @clicked="() => deleteSeason(season.id)" />
            </li>
        </ul>
    </div>

</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useUserStore } from '@/user';


export default {
    name: 'SeasonsView',
    data() {
        return {
            seasons: null,
            showCreateSeasonForm: false,
            newSeason: {
                year: ''
            },
            loading: true
        }
    },
    created() {
        this.fetchSeasons()
    },
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
                this.showCreateSeasonForm = false;
                this.newSeason = { year: '' };
                this.fetchSeasons();
            } catch (err) {
                console.error('Chyba pri vytváraní sezóny:', err);
            }
        },
        deleteSeason(id) {
            console.log('Mažem sezónu s ID:', id)
            axios.delete('/api/rest/seasons/' + id)
                .then(() => {
                    this.fetchSeasons()
                    console.log('Sezóna bola úspešne zmazaná.')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní sezóny:', err)
                })

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
    components: { AppButton, AppHeader }
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
</style>