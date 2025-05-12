<template>

    <h1>list of players</h1>
    <RouterLink to="/">home</RouterLink>

    <TTable v-if="!loading" :headers="headers" :tableData="playersToDisplay"/>

    <div v-else>... loading ...</div>

</template>

<script>
import TTable from '@/components/TTable.vue';
import axios from 'axios';

export default{
    name:'PlayersView',
    data() {
        return{
            players: [],
            loading: true,
            headers: ['first name', 'last name', 'email', 'phone', 'registration date']
        }
    },
    computed:{
        playersToDisplay (){
            return this.players.map((player) => {
                return {
                firstName: player.firstName,
                lastName: player.lastName,
                email: player.email,
                phone: player.phone,
                registrationDate: player.registrationDate
                }
               
            })
        }
    },
    created () {
        axios.get('/api/rest/players/')
        .then((response) =>{
            this.players = response.data
            this.loading = false
        })
    },
    components: {TTable}
}

</script>