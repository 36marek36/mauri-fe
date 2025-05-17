<template>
    <h1>Všetky ligy</h1>

    <div v-if="loading">... loading ...</div>

    <ul v-else>
        <li v-for="league in sortedLeagues" @click="this.$router.push('/leagues/' + league.id)">
            {{ league.name }} {{ league.leagueType }}
        </li>
    </ul>

    <button @click="showCreateLeagueForm = !showCreateLeagueForm">
        {{ showCreateLeagueForm ? 'Zavrieť formulár' : 'Vytvoriť novú ligu' }}
    </button>

    <div v-if="showCreateLeagueForm">
        <input v-model="newLeague.name" placeholder="Názov ligy" />
        <select v-model="newLeague.leagueType">
            <option value="SINGLES">SINGLES</option>
            <option value="DOUBLES">DOUBLES</option>
        </select>
        <button @click="createLeague">Vytvoriť</button>
    </div>




</template>

<script>
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
    computed:{
        sortedLeagues(){
            return this.leagues.slice().sort((a,b)=>{
                if(a.leagueType<b.leagueType) return -1
                if(a.leagueType>b.leagueType) return 1

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
        createLeague() {
                axios.post('/api/rest/leagues/create', this.newLeague)
                    .then((res) => {
                        alert('Liga bola vytvorená: ' + res.data.name);
                        this.showCreateLeagueForm = false;
                        this.newLeague = { name: '', leagueType: 'SINGLES' };

                        this.fetchLeagues()
                    })
                    .then((response)=>{
                        this.leagues = response.data
                    })
                    .catch((err) => {
                        console.error('Chyba pri vytváraní ligy:', err);
                    });
        }
    }
}


</script>
