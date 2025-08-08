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
                <ParticipantList :participants="paginatedPlayers" :formatName="formatPlayerName"
                    :remove="isAdmin ? (id) => confirmDeleteParticipant('players', id) : null"
                    @view-detail="(id) => goToDetail('players', id)" />
                <div v-if="totalPagesPlayers > 1" class="pagination">
                    <AppButton label="Predošlá" icon="←" type="default" htmlType="button"
                        @clicked="currentPagePlayers--" :disabled="currentPagePlayers === 1" />
                    <span>Strana {{ currentPagePlayers }} z {{ totalPagesPlayers }}</span>
                    <AppButton label="Ďalšia" icon="→" type="default" htmlType="button" @clicked="currentPagePlayers++"
                        :disabled="currentPagePlayers === totalPagesPlayers" />
                </div>
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
                    <ParticipantList :participants="paginatedTeams" :formatName="formatTeamName"
                        :remove="isAdmin ? (id) => confirmDeleteParticipant('teams', id) : null"
                        @view-detail="(id) => goToDetail('teams', id)" />
                    <div v-if="totalPagesTeams > 1" class="pagination">
                        <AppButton label="Predošlá" icon="←" type="default" htmlType="button"
                            @clicked="currentPageTeams--" :disabled="currentPageTeams === 1" />
                        <span>Strana {{ currentPageTeams }} z {{ totalPagesTeams }}</span>
                        <AppButton label="Ďalšia" icon="→" type="default" htmlType="button" @clicked="currentPageTeams++"
                        :disabled="currentPageTeams === totalPagesTeams" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <DeleteModal :visible="showDeleteModal"
        :message="`Naozaj chcete zmazať ${participant?.type === 'players' ? 'hráča' : 'tím'}: ${participant?.name}?`"
        @confirm="deleteParticipant" @cancel="cancelDelete" />
</template>

<script>
import axios from 'axios'
import ParticipantList from '@/components/ParticipantList.vue'
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useUserStore } from '@/user'
import DeleteModal from '@/components/DeleteModal.vue'

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
            },
            showDeleteModal: false,
            participant: null,
            participantsPerPage: 5,
            currentPagePlayers: 1,
            currentPageTeams: 1
        }

    },
    created() {
        this.fetchPlayers();
        this.fetchTeams();
    },
    methods: {

        fetchPlayers() {
            this.loadingPlayers = true;
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
            this.loadingTeams = true;
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
        addPlayer() {
            this.$router.push('/players/create')
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
        async deleteParticipant() {
            try {
                await axios.delete('/api/rest/' + this.participant.type + '/' + this.participant.id);
                console.log(`${this.participant.type.slice(0, -1)} bol vymazaný.`);

                if (this.participant.type === 'teams') {
                    this.currentPageTeams = 1;
                    this.fetchTeams();
                } else if (this.participant.type === 'players') {
                    this.currentPagePlayers = 1;
                    this.fetchPlayers();
                }
            } catch (err) {
                console.error(`Chyba pri mazaní ${this.participant.type.slice(0, -1)}a:`, err);
            } finally {
                this.cancelDelete();
            }
        },
        confirmDeleteParticipant(type, id) {
            let name = '';

            if (type === 'players') {
                const player = this.players.find(p => p.id === id);
                name = player ? this.formatPlayerName(player) : '';
            } else if (type === 'teams') {
                const team = this.teams.find(t => t.id === id);
                name = team ? this.formatTeamName(team) : '';
            }

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.participant = null;
            this.showDeleteModal = false;
        },
        formatPlayerName(player) {
            return player.firstName + ' ' + player.lastName
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
        },
        totalPagesPlayers() {
            return Math.ceil(this.players.length / this.participantsPerPage);
        },
        paginatedPlayers() {
            const start = (this.currentPagePlayers - 1) * this.participantsPerPage;
            const end = start + this.participantsPerPage;
            return this.players.slice(start, end);
        },
        totalPagesTeams() {
            return Math.ceil(this.teams.length / this.participantsPerPage);
        },
        paginatedTeams() {
            const start = (this.currentPageTeams - 1) * this.participantsPerPage;
            const end = start + this.participantsPerPage;
            return this.teams.slice(start, end);
        }
    },
    components: { AppButton, ParticipantList, AppHeader, DeleteModal }
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

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    font-family: Arial, sans-serif;
}

.pagination button {
    background-color: #3498db;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.pagination button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.pagination span {
    font-size: 1rem;
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