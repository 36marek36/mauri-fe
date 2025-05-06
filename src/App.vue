<template>

    <h1>players</h1>
    
    <!-- <ul>
        <li v-for="player in players">
            {{player.firstName}} {{player.lastName}} {{ player.registrationDate }}
        </li>
    </ul> -->
    <table>
        <thead>
            <tr>
                <th>firstName</th>
                <th>lastName</th>
                <th>email</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="player in players">
                <td>{{ player.firstName }}</td>
                <td>{{ player.lastName }}</td>
                <td>{{ player.email }}</td>
            </tr>
        </tbody>
    </table>
    
    </template>
    
    
    <script>
    import axios from 'axios';
    
    export default{
        name: 'playersList',
        data(){
            return {
                players: []
            };
        }
        ,
        mounted(){
            axios.get('/api/rest/players/')
            .then(response => {
                this.players = response.data
            })
            .catch(error => {
                console.error("chyba pri nacitavani")
            });
        
        }
    
    }
    </script>
    
    <style scoped>
    
    </style>