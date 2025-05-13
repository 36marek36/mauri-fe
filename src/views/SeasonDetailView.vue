<template>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/seasons">seasons</RouterLink>

    <div v-if="loading">... loading ...</div>

    <div v-else>
        <h1>{{ season.year }}</h1>

        <ul v-for="league in season.leagues">
            <li @click="this.$router.push('/leagues/'+league.id)">
                <span>{{ league.name + ' ' + league.leagueType }}</span>
            </li>
        </ul>
    </div>



</template>

<script>
import axios from 'axios';


export default {
    name: 'SeasonDetail',
    data() {
        return {
            season: [],
            loading: true
        }
    },
    created() {
        axios.get('/api/rest/seasons/' + this.$route.params.id)
            .then((response) => {
                this.season = response.data
                this.loading = false
            })
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