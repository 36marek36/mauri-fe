<template>
    <h1>Všetky tými:</h1>

    <div v-if="!loading">
        <AppButton :label="showCreateTeamForm ? 'Zavrieť formulár' : 'Vytvoriť nový tím'" icon="➕"
            :type="showCreateTeamForm ? 'delete' : 'create'" htmlType="button" @clicked="toggleCreateForm" />

        <div v-if="showCreateTeamForm">
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

            <AppButton label="Vytvoriť" icon="➕" type="create" htmlType="button" @clicked="() => createTeam()" />
                
        </div>

        <ParticipantList :title="'Tými v lige'" :participants="teams" :formatName="formatTeamName"
            :remove="deleteTeam" />

        <!-- <ul>
            <li v-for="team in teams" :key="team.id">
                <div>
                    <strong>Hráč 1:</strong> {{ team.player1.firstName }} {{ team.player1.lastName }}<br>
                    <strong>Hráč 2:</strong> {{ team.player2.firstName }} {{ team.player2.lastName }}
                </div>
                <AppButton label="Zmazať" icon="🗑️" type="delete" @clicked="() => deleteTeam(team.id)" />
            </li>
        </ul> -->
    </div>

    <div v-else>... loading ...</div>
</template>

<script>
import axios from 'axios'
import AppButton from '@/components/AppButton.vue'
import ParticipantList from '@/components/ParticipantList.vue'

export default {
    name: 'TeamsView',

    data() {
        return {
            teams: [],
            players: [],
            loading: true,
            showCreateTeamForm: false,
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
        toggleCreateForm() {
            this.showCreateTeamForm = !this.showCreateTeamForm
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
                this.newTeam = { player1Id: '', player2Id: '' }

                // Načítanie aktualizovaného zoznamu tímov
                this.fetchTeams();
            } catch (error) {
                console.error('Chyba pri vytváraní tímu:', error);
            }
        },
        deleteTeam(id) {
            console.log('Mažem tým s ID:', id)
            axios.delete('/api/rest/teams/' + id)
                .then(() => {
                    this.fetchTeams()
                    console.log('Tým bol úspešne zmazaný.')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní tímu:', err)
                })
        },
        fullName(player) {
            if (!player) return 'Neznámy';
            return `${player.firstName || ''} ${player.lastName || ''}`.trim();
        },
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.fullName(team.player1)} a ${this.fullName(team.player2)}`;
        }
    },
    components: { AppButton, ParticipantList }
}

</script>

<style scoped>
:deep(ul) {
    width: 50%;
}
</style>