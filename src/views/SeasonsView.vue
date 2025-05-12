<template>
    <h1>Sezóny</h1>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/players">list of players</RouterLink>
    <div v-if="loading">... loading ...</div>
    <ul v-else>
        <li v-for="season in seasons"
        @click="this.$router.push('/seasons/'+season.id)">
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
        axios.get('/api/rest/seasons/')
            .then((response) => {
                this.seasons = response.data
                this.loading = false
            })
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