<template>
    <div class="container">
        <!-- Ľavý stĺpec: Hráči -->
        <div class="players">
            <h1>Zoznam hráčov:</h1>

            <AppButton label="Vytvoriť hráča" icon="➕" type="create" @clicked="addPlayer" />

            <div v-if="!loading">
                <ParticipantList :participants="players" :formatName="formatPlayerName" :remove="deletePlayer" />
            </div>

            <div v-else>
                ... loading ...
            </div>
        </div>

        <!-- Pravý stĺpec: Tímy -->
        <div class="teams">
            <h1>Zoznam tímov:</h1>

            <div v-if="!loading">
                <AppButton :label="showCreateTeamForm ? 'Zavrieť formulár' : 'Vytvoriť nový tím'" icon="➕"
                    :type="showCreateTeamForm ? 'delete' : 'create'" @clicked="toggleCreateForm" />

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

                    <AppButton label="Vytvoriť" icon="➕" type="create" @clicked="() => createTeam()" />
                </div>

                <ParticipantList :participants="teams" :formatName="formatTeamName" :remove="deleteTeam" />
            </div>

            <div v-else>... loading ...</div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import ParticipantList from '@/components/ParticipantList.vue'
import AppButton from '@/components/AppButton.vue'

export default {
    name: 'ParticipantsView',
    data() {
        return {
            players: [],
            teams: [],
            loading: true,
            showCreateTeamForm: false,
            newTeam: {
                player1Id: '',
                player2Id: ''
            }
        }

    },
    created() {
        this.fetchPlayers(),
            this.fetchTeams()
    },
    methods: {
        fetchPlayers() {
            axios.get('/api/rest/players/')
                .then((response) => {
                    this.players = response.data
                    this.loading = false
                })
                .catch((err) => {
                    console.err('Chyba pri načítaní hráčov:', error)
                    this.loading = false
                })
        },
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
        goToDetail(id) {
            this.$router.push('/players/' + id)
        },
        deletePlayer(id) {
            console.log('Mažem hráča s ID:', id)
            axios.delete('/api/rest/players/' + id)
                .then(() => {
                    this.fetchPlayers()
                    console.log('Hráč bol úspešne zmazaný.')
                })
                .catch(err => {
                    console.error('Chyba pri mazaní hráča:', err)
                })
        },
        addPlayer() {
            this.$router.push('/players/create')
        },
        formatPlayerName(player) {
            return player.firstName + ' ' + player.lastName
        },
        toggleCreateForm() {
            this.showCreateTeamForm = !this.showCreateTeamForm
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
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.formatPlayerName(team.player1)} a ${this.formatPlayerName(team.player2)}`;
        }
    },
    components: { AppButton, ParticipantList }
}

</script>

<style scoped>
.container {
    display: flex;
    gap: 2rem;
    /* Medzera medzi stĺpcami */
    align-items: flex-start;
    /* Zarovná obsah hore */
}

.players {
    flex: 1;
    border-right: 1px solid #ccc;
    padding-right: 1rem;
}

/* Pravý stĺpec – tímy */
.teams {
    flex: 1;
    padding-left: 1rem;
}

:deep(ul) {
    width: 50%;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
        /* pod seba */
    }

    .players {
        border-right: none;
        border-bottom: 1px solid #ccc;
        padding-right: 0;
        padding-bottom: 1rem;
    }

    .teams {
        padding-left: 0;
        padding-top: 1rem;
    }
}
</style>