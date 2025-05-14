<template>

    <h1>list of players</h1>
    <RouterLink to="/">home</RouterLink>
    <RouterLink to="/seasons">seasons</RouterLink>

    <ul v-if="!loading" >
        <li v-for="player in players"
        @click="this.$router.push('/players/'+player.id)">
            {{ player.firstName + ' ' + player.lastName }}
        </li>
    </ul>

    <div v-else>... loading ...</div>

</template>

<script>
import axios from 'axios';

export default {
    name: 'PlayersView',
    data() {
        return {
            players: [],
            loading: true
        }
    },
    created() {
        axios.get('/api/rest/players/')
            .then((response) => {
                this.players = response.data
                this.loading = false
            })
    }
}

</script>

<style scoped>
ul{
    list-style-type: none;
    border: 1px solid #cdcdcd;
}
li{
    padding: .3em .6em;
    cursor: pointer;
}
li:not(:last-child){
    border-bottom: 1px solid #cdcdcd;
}

</style>