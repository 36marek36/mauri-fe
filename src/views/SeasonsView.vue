<template>
    <h1>Sezóny</h1>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/players">list of players</RouterLink>
    <RouterLink to="/seasons">seasons</RouterLink>
    <RouterLink to="/leagues">leagues</RouterLink>
    <div v-if="loading">... loading ...</div>
    <ul v-else>
        <li v-for="season in seasons" @click="this.$router.push('/seasons/' + season.id)">
            <h2>Sezóna {{ season.year }}</h2>
        </li>
    </ul>

</template>

<script>
import axios from 'axios';


export default {
    name: 'SeasonsView',
    data() {
        return {
            seasons: null,
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
    }
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