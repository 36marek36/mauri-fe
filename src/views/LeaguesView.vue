<template>
    <h1>Všetky ligy</h1>

    <AppButton :label="showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu'"
        :type="showCreateLeagueForm ? 'delete' : 'create'" @clicked="toggleCreateForm" icon="➕" />

    <div v-if="showCreateLeagueForm">
        <input v-model="newLeague.name" placeholder="Názov ligy" />
        <select v-model="newLeague.leagueType">
            <option value="SINGLES">SINGLES</option>
            <option value="DOUBLES">DOUBLES</option>
        </select>

        <AppButton label="Vytvoriť" type="create" icon="➕" @clicked="createLeague"/>
        
    </div>

    <div v-if="loading">... loading ...</div>

    <ul v-else>
        <li v-for="league in sortedLeagues" @click="this.$router.push('/leagues/' + league.id)">
            {{ league.name }} {{ league.leagueType }}

            <AppButton label="Zmazať" icon="🗑️" type="delete" @clicked="() => deleteLeague(league.id)" />

        </li>
    </ul>

</template>

<script>
import AppButton from '@/components/AppButton.vue';
import axios from 'axios';


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
        }
    },

    methods: {
        fetchLeagues() {
            axios.get('/api/rest/leagues/')
                .then((res) => {
                    this.leagues = res.data
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri nacitavani lig:', error)
                    this.loading = false
                })
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
    components: { AppButton }
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
    background-color: #f5f5f5;
}
</style>
