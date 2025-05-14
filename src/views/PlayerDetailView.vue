<template>
<RouterLink to="/">home</RouterLink>
<RouterLink to="/players">list of players</RouterLink>
<RouterLink to="/seasons">seasons</RouterLink>

<div v-if="loading">... loading ...</div>

<ul v-else>
    <li>
        <span>first name: </span>
        <span>{{ player.firstName }}</span>
    </li>
    <li>
        <span>last name: </span>
        <span>{{ player.lastName }}</span>
    </li>
</ul>

</template>

<script>

import axios from 'axios';

export default{
    name: 'PlayerDetailView.vue',
    data(){
        return{
            player: null,
            loading: true
        }
    },
    created(){
        axios.get('/api/rest/players/' + this.$route.params.id)
        .then((response) =>{
            this.player = response.data
            this.loading = false
        })
    }
}

</script>

<style scoped>
ul{
    list-style-type: none;
    max-width: 250px;
}
li{
    display: flex;
    justify-content: space-between;
}
li span:nth-child(2){
    font-weight: bold;
}

</style>