<template>
    <AppHeader title="Všetky ligy:" />

    <AppButton v-if="isAdmin" :label="showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu'"
        :type="showCreateLeagueForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" icon="➕" />

    <div v-if="showCreateLeagueForm">
        <input v-model="newLeague.name" placeholder="Názov ligy" />
        <select v-model="newLeague.leagueType">
            <option value="SINGLES">SINGLES</option>
            <option value="DOUBLES">DOUBLES</option>
        </select>

        <AppButton label="Vytvoriť" type="create" htmlType="button" icon="➕" @clicked="createLeague" />

    </div>

    <div v-if="loading">
        ... loading ...
    </div>

    <div v-else>
        <div v-if="sortedLeagues.length === 0">
            <p>Žiadne ligy neboli nájdené.</p>
        </div>

        <ul v-else style="width: fit-content">
            <li v-for="league in sortedLeagues" :key="league.id" @click="$router.push('/leagues/' + league.id)">
                {{ league.name }} {{ league.leagueType }} {{ league.progress + '%' }}

                <div class="league-progress-bar">
                    <div class="league-progress-fill" :style="{ width: league.progress + '%' }"></div>
                </div>

                <AppButton v-if="isAdmin" label="Zmazať" icon="🗑️" type="delete" htmlType="button"
                    @clicked="() => deleteLeague(league.id)" />
            </li>
        </ul>
    </div>

</template>

<script>
import AppButton from '@/components/AppButton.vue';
import AppHeader from '@/components/AppHeader.vue';
import axios from 'axios';
import { useUserStore } from '@/user';


export default {
    name: 'LeaguesView',
    data() {
        return {
            leagues: [],
            loading: true,
            showCreateLeagueForm: false,
            newLeague: {
                name: '',
                leagueType: 'SINGLES'
            }
        }
    },
    created() {
        this.fetchLeagues()
    },
    computed: {
        sortedLeagues() {
            return this.leagues.slice().sort((a, b) => {
                if (a.leagueType < b.leagueType) return -1
                if (a.leagueType > b.leagueType) return 1

                return a.name.localeCompare(b.name)
            })
        },
        userStore() {
            return useUserStore()
        },
        isAdmin() {
            return this.userStore.isAdmin
        }
    },

    methods: {
        fetchLeagues() {
            axios.get('/api/rest/leagues/')
                .then(async (res) => {
                    const leagues = res.data; // pole líg bez progressu

                    // Pre každú ligu zavoláme fetchLeagueProgress a pridáme progress
                    for (const league of leagues) {
                        league.progress = await this.fetchLeagueProgress(league.id);
                    }

                    this.leagues = leagues;   // nastavíme ligy vrátane progressu
                    this.loading = false;
                })
                .catch((error) => {
                    console.error('Chyba pri načítavaní líg:', error);
                    this.loading = false;
                })
        },
        fetchLeagueProgress(leagueId) {
            return axios.get(`/api/rest/leagues/${leagueId}/progress`)
                .then(response => response.data)
                .catch(error => {
                    console.error('Chyba pri načítaní progressu:', error);
                    return 0; // fallback hodnota, ak sa niečo pokazí
                });
        },
        toggleCreateForm() {

            this.showCreateLeagueForm = !this.showCreateLeagueForm
        },

        async createLeague() {
            try {
                const res = await axios.post('/api/rest/leagues/create', this.newLeague);
                console.log('Liga: ' + res.data.name + ' bola úspešne vytvorená.')
                this.showCreateLeagueForm = false;
                this.newLeague = { name: '', leagueType: 'SINGLES' };
                this.fetchLeagues();
            } catch (err) {
                console.error('Chyba pri vytváraní ligy:', err);
            }
        },

        // createLeague() {
        //     axios.post('/api/rest/leagues/create', this.newLeague)
        //         .then((res) => {
        //             alert('Liga bola vytvorená: ' + res.data.name);
        //             this.showCreateLeagueForm = false;
        //             this.newLeague = { name: '', leagueType: 'SINGLES' };

        //             return this.fetchLeagues()
        //         })
        //         .then((response) => {
        //             this.leagues = response.data
        //         })
        //         .catch((err) => {
        //             console.error('Chyba pri vytváraní ligy:', err);
        //         });
        // },


        deleteLeague(id) {
            console.log('Mažem ligu s ID:', id)
            axios.delete('/api/rest/leagues/' + id)
                .then(() => {
                    this.fetchLeagues()
                    console.log('Liga bola úspešne zmazaná.')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní ligy:', err)
                })

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

li:hover {
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
    /* zlatožltá */
    transition: width 0.3sease-in-out;
}
</style>
