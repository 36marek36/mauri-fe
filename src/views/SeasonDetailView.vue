<template>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <AppHeader :title="season.year.toString()" />
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

        <ul>
            <li v-for="league in season.leagues" :key="league.id" @click="this.$router.push('/leagues/' + league.id)">
                <span>
                    {{ league.name }} {{ league.leagueType }}
                </span>
            </li>
        </ul>
    </div>

    <div v-if="isAdmin">
        <h2>Všetky dostupné ligy</h2>
        <ul>
            <li v-for="league in noSeasonLeagues" :key="league.id">
                {{ league.name }}
                <button @click="addLeagueToSeason(league.id)">Pridať do sezóny</button>
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
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            noSeasonLeagues: [],
            showCreateLeagueForm: false,
            newLeague: {
                name: '',
                leagueType: 'SINGLES',
                seasonId: ''
            },
            loading: true
        }
    },
    created() {
        const seasonId = this.$route.params.id;
        this.fetchSeason(seasonId);
        this.fetchNoSeasonLeagues();
    },

    methods: {

        fetchSeason(seasonId) {
            axios.get('/api/rest/seasons/' + seasonId)
                .then((response) => {
                    this.season = response.data
                    this.loading = false
                })
                .catch((err) => {
                    console.error('Chyba pri nacitavani sezony', err)
                })
        },

        fetchNoSeasonLeagues() {
            axios.get('/api/rest/leagues/no-season')
                .then(res => {
                    this.noSeasonLeagues = res.data;
                })
                .catch((err) => {
                    console.error('Chyba pri nacitavani lig', err)
                })
        },
        async createLeague() {
            try {
                const res = await axios.post('/api/rest/leagues/create', this.newLeague);
                this.addLeagueToSeason(res.data.id)
                console.log('Liga: ' + res.data.name + ' bola úspešne vytvorená.')
                this.showCreateLeagueForm = false;
                this.newLeague = { name: '', leagueType: 'SINGLES', seasonId: '' };
            } catch (err) {
                console.error('Chyba pri vytváraní ligy:', err);
            }
        },
        toggleCreateForm() {

            this.showCreateLeagueForm = !this.showCreateLeagueForm
        },

        addLeagueToSeason(leagueId) {
            const seasonId = this.$route.params.id;
            axios.patch('/api/rest/seasons/' + seasonId + '/addLeague', {
                leagueId: leagueId
            })
                .then(() => {
                    console.log('Liga bola pridaná do sezóny.')
                    this.fetchSeason(seasonId); // znovu načítaj sezónu
                    this.fetchNoSeasonLeagues();
                })
                .catch(err => {
                    console.error('Chyba pri priraďovaní ligy:', err);
                });
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
    display: flex;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}
</style>