<template>
    <h1>Všetky tými:</h1>

    <div v-if="!loading">
        <h2>Vytvoriť nový tím</h2>

        <label for="player1">Hráč 1:</label>
        <select id="player1" v-model="newTeam.player1Id">
            <option disabled value="">-- Vyber hráča --</option>
            <option v-for="player in players" :value="player.id">
                {{ player.firstName }} {{ player.lastName }}
            </option>
        </select>

        <label for="player2">Hráč 2:</label>
        <select id="player2" v-model="newTeam.player2Id">
            <option disabled value="">-- Vyber hráča --</option>
            <option v-for="player in players" :value="player.id">
                {{ player.firstName }} {{ player.lastName }}
            </option>
        </select>

        <button @click="createTeam">Vytvoriť tím</button>

        <ul>
            <li v-for="team in teams" :key="team.id">
                <strong>Hráč 1:</strong> {{ team.player1.firstName }} {{ team.player1.lastName }}<br>
                <strong>Hráč 2:</strong> {{ team.player2.firstName }} {{ team.player2.lastName }}
            </li>
        </ul>
    </div>

    <div v-else>... loading ...</div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'TeamsView',

    data() {
        return {
            teams: [],
            players: [],
            loading: true,
            newTeam: {
                player1Id: '',
                player2Id: ''
            }
        }
    },

    created() {
        this.fetchTeams()
        this.fetchPlayers()

    },

    methods: {
        fetchTeams() {
            axios.get('/api/rest/teams/')
                .then((response) => {
                    this.teams = response.data
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní týmov', error)
                    this.loading = false
                })
        },
        fetchPlayers() {
            axios.get('/api/rest/players/')
                .then((response) => {
                    this.players = response.data
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní hráčov', error)
                })
        },
        async createTeam() {
            const payload = {
                player1Id: this.newTeam.player1Id,
                player2Id: this.newTeam.player2Id
            };

            try {
                const res = await axios.post('/api/rest/teams/create', payload);
                console.log('Tim: ' + res.data.id + ' bol úspešne vytvoreny.')
                
                // Resetovanie výberu hráčov
                this.newTeam={player1Id:'',player2Id:''}

                // Načítanie aktualizovaného zoznamu tímov
                this.fetchTeams();
            } catch (error) {
                console.error('Chyba pri vytváraní tímu:', error);
            }
        },
        // createTeam() {
        //     const payload = {
        //         player1Id: this.newTeam.player1Id,
        //         player2Id: this.newTeam.player2Id
        //     }

        //     axios.post('/api/rest/teams/create', payload)
        //         .then(() => {
        //             this.newTeam.player1Id = ''
        //             this.newTeam.player2Id = ''
        //             this.fetchTeams() // refresh tímov po vytvorení
        //         })
        //         .catch((error) => {
        //             console.error('Chyba pri vytváraní tímu:', error)
        //         })
        // }
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