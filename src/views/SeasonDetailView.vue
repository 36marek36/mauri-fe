<template>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ season.year }}</h1>

        <ul>
            <li v-for="league in season.leagues" :key="league.id" @click="this.$router.push('/leagues/' + league.id)">
                <span>
                    {{ league.name }}
                </span>
            </li>
        </ul>
    </div>

    <h2>Všetky dostupné ligy</h2>
    <ul>
        <li v-for="league in noSeasonLeagues" :key="league.id">
            {{ league.name }}
            <button @click="addLeagueToSeason(league.id)">Pridať do sezóny</button>
        </li>
    </ul>



</template>

<script>
import axios from 'axios';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: {},
            noSeasonLeagues: [],
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
    }
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