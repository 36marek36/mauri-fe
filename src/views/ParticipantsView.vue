<template>
    <AppHeader title="Zoznam hráčov a tímov" />

    <div class="container">

        <!-- Ľavý stĺpec: Hráči -->
        <div class="players">
            <h2>Zoznam hráčov:</h2>

            <AppButton v-if="isAdmin" label="Vytvoriť hráča" icon="➕" type="create" htmlType="button"
                @clicked="addPlayer" />

            <div v-if="loadingPlayers">
                ... loading players...
            </div>

            <div v-else-if="players.length === 0">
                <p>Žiadni hráči nie sú k dispozícii.</p>
            </div>

            <div v-else>
                <ParticipantList :participants="players" :formatName="formatPlayerName"
                    :remove="isAdmin ? deletePlayer : null" @view-detail="(id) => goToDetail('players', id)" />
            </div>
        </div>

        <!-- Pravý stĺpec: Tímy -->
        <div class="teams">
            <h2>Zoznam tímov:</h2>

            <div v-if="loadingTeams">
                ... loading teams...
            </div>

            <div v-else>
                <AppButton v-if="isAdmin" :label="showCreateTeamForm ? 'Zavrieť formulár' : 'Vytvoriť nový tím'"
                    icon="➕" :type="showCreateTeamForm ? 'delete' : 'create'" htmlType="button"
                    @clicked="toggleCreateForm" />

                <div v-if="showCreateTeamForm">
                    <label for="player1">Hráč 1:</label>
                    <select id="player1" v-model="newTeam.player1Id">
                        <option disabled value="">-- Vyber hráča --</option>
                        <option v-for="player in players" :key="player.id" :value="player.id">
                            {{ player.firstName }} {{ player.lastName }}
                        </option>
                    </select>

                    <label for="player2">Hráč 2:</label>
                    <select id="player2" v-model="newTeam.player2Id">
                        <option disabled value="">-- Vyber hráča --</option>
                        <option v-for="player in players" :key="player.id" :value="player.id">
                            {{ player.firstName }} {{ player.lastName }}
                        </option>
                    </select>

                    <AppButton label="Vytvoriť" icon="➕" type="create" htmlType="button" @clicked="createTeam" />
                </div>

                <div v-if="teams.length === 0">
                    <p>Žiadne tímy neboli zatiaľ vytvorené.</p>
                </div>

                <div v-else>
                    <ParticipantList :participants="teams" :formatName="formatTeamName"
                        :remove="isAdmin ? deleteTeam : null" @view-detail="(id) => goToDetail('teams', id)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import ParticipantList from '@/components/ParticipantList.vue'
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUserStore } from '@/user'

export default {
    name: 'ParticipantsView',
    data() {
        return {
            players: [],
            teams: [],
            loadingPlayers: true,
            loadingTeams: true,
            showCreateTeamForm: false,
            newTeam: {
                player1Id: '',
                player2Id: ''
            }
        }

    },
    created() {
        this.fetchPlayers();
        this.fetchTeams();
    },
    methods: {

        fetchPlayers() {
            axios.get('/api/rest/players/')
                .then((response) => {
                    this.players = response.data;
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní hráčov:', error);
                })
                .finally(() => {
                    this.loadingPlayers = false;
                });
        },
        fetchTeams() {
            axios.get('/api/rest/teams/')
                .then((response) => {
                    this.teams = response.data;
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní tímov:', error);
                })
                .finally(() => {
                    this.loadingTeams = false;
                });
        },
        goToDetail(type, id) {
            if (!this.isLoggedIn) {
                alert("Musíte sa prihlásiť.");
                return;
            }
            this.$router.push(`/${type}/${id}`);
        },
        deletePlayer(id) {
            if (confirm('Naozaj chceš vymazať tohto hráča?')) {
                axios.delete('/api/rest/players/' + id)
                    .then(() => {
                        alert('Hráč bol vymazaný.');
                        this.fetchPlayers()
                    })
                    .catch((error) => {
                        alert('Nepodarilo sa vymazať hráča.');
                        console.error('Chyba pri mazaní hráča:', error);
                    });
            }
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

                // ⬇️ Zatvorenie formulára
                this.toggleCreateForm();
            } catch (error) {
                console.error('Chyba pri vytváraní tímu:', error);
            }
        },
        deleteTeam(id) {
            if (confirm('Naozaj chceš vymazať tento tým?')) {
                axios.delete('/api/rest/teams/' + id)
                    .then(() => {
                        alert('Tým bol vymazaný.');
                        this.fetchTeams()
                    })
                    .catch((error) => {
                        alert('Nepodarilo sa vymazať tým.');
                        console.error('Chyba pri mazaní týmu:', error);
                    });
            }
        },
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.formatPlayerName(team.player1)} a ${this.formatPlayerName(team.player2)}`;
        }
    },
    computed: {
        userStore() {
            return useUserStore()
        },
        isAdmin() {
            return this.userStore.isAdmin
        },
        isLoggedIn() {
            return this.userStore.isLoggedIn
        }
    },
    components: { AppButton, ParticipantList, AppHeader }
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