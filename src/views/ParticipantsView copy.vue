<template>

    <div class="main-layout">

        <div class="left-side">
        </div>
        <div class="right-side">
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
                    <ParticipantList :participants="paginatedPlayers"
                        :remove="isAdmin ? (id) => confirmDeleteParticipant('players', id) : null" :showProgress="false"
                        @view-detail="(id) => goToDetail('players', id)" />
                    <div v-if="totalPagesPlayers > 1" class="pagination">
                        <AppButton label="Predošlá" icon="←" type="default" htmlType="button"
                            @clicked="currentPagePlayers--" :disabled="currentPagePlayers === 1" />
                        <span>{{ currentPagePlayers }} / {{ totalPagesPlayers }}</span>
                        <AppButton label="Ďalšia" icon="→" type="default" htmlType="button"
                            @clicked="currentPagePlayers++" :disabled="currentPagePlayers === totalPagesPlayers" />
                    </div>
                </div>
                <div class="inactive-participants">
                    <ParticipantList :title="'Neaktívni (vymazaní) hráči'" :participants="inactivePlayers"
                        @view-detail="(id) => goToDetail('players', id)" :showProgress="false"
                        :remove="(id) => confirmDeleteParticipant('players', id)" />
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
                        <ParticipantList :participants="paginatedTeams"
                            :remove="isAdmin ? (id) => confirmDeleteParticipant('teams', id) : null"
                            :showProgress="false" @view-detail="(id) => goToDetail('teams', id)" />
                        <div v-if="totalPagesTeams > 1" class="pagination">
                            <AppButton label="Predošlá" icon="←" type="default" htmlType="button"
                                @clicked="currentPageTeams--" :disabled="currentPageTeams === 1" />
                            <span>Strana {{ currentPageTeams }} z {{ totalPagesTeams }}</span>
                            <AppButton label="Ďalšia" icon="→" type="default" htmlType="button"
                                @clicked="currentPageTeams++" :disabled="currentPageTeams === totalPagesTeams" />
                        </div>
                    </div>
                    <div class="inactive-participants">
                        <ParticipantList :title="'Neaktívne (vymazané) tími'" :participants="inactiveTeams"
                            @view-detail="(id) => goToDetail('teams', id)" :showProgress="false"
                            :remove="(id) => confirmDeleteParticipant('teams', id)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppModal :visible="showDeleteModal" :message="deleteMessage" @confirm="deleteParticipant" @cancel="cancelDelete" />
</template>

<script>
import api from '@/axios-interceptor'
import ParticipantList from '@/components/ParticipantList.vue'
import AppButton from '@/components/AppButton.vue'
import { useUserStore } from '@/stores/user'
import AppModal from '@/components/AppModal.vue'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header'

export default {
    name: 'ParticipantsView',
    data() {
        return {
            players: [],
            teams: [],
            inactivePlayers: [],
            inactiveTeams: [],
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
            currentPageTeams: 1,
            header: useHeaderStore()
        }

    },
    created() {
        this.header.setTitle('Zoznam hráčov a tímov', '')
        this.fetchPlayers();
        this.fetchTeams();
        this.fetchAllInactiveParticipants();
    },
    methods: {

        async fetchPlayers() {
            this.loadingPlayers = true;
            try {
                const response = await api.get('/players/')
                this.players = response.data
            } catch (error) {
                console.error('Chyba pri načítaní hráčov:', error)
            } finally {
                this.loadingPlayers = false
            }
        },
        async fetchTeams() {
            this.loadingTeams = true;
            try {
                const response = await api.get('/teams/')
                this.teams = response.data
            }
            catch (error) {
                console.error('Chyba pri načítaní tímov:', error);
            } finally {
                this.loadingTeams = false;
            }
        },
        async fetchAllInactiveParticipants() {
            this.loading = true;
            try {
                const [playersRes, teamsRes] = await Promise.all([
                    api.get('/players/inactive'),
                    api.get('/teams/inactive')
                ]);
                this.inactivePlayers = playersRes.data;
                this.inactiveTeams = teamsRes.data;
            } catch (error) {
                console.error('Chyba pri načítaní hráčov alebo tímov:', error);
            } finally {
                this.loading = false;
            }
        },
        goToDetail(type, id) {
            if (!this.isLoggedIn) {
                this.flash.showMessage('Musíte sa prihlásiť.', 'warning');
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
                const res = await api.post('/teams/create', payload);

                this.flash.showMessage('Tim bol úspešne vytvoreny.', 'success')
                console.log('Tim: ' + res.data.id + ' bol úspešne vytvoreny.')

                // Resetovanie výberu hráčov
                this.newTeam = { player1Id: '', player2Id: '' }

                // Načítanie aktualizovaného zoznamu tímov
                this.fetchTeams();

                // ⬇️ Zatvorenie formulára
                this.toggleCreateForm();
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    const data = err.response.data;
                    if (data.message) {
                        this.flash.showMessage(data.message, 'warning');
                    } else {
                        this.flash.showMessage('Chyba: neplatné dáta.', 'warning');
                    }
                } else {
                    // 👉 Iná ako 400 chyba (500, sieťová chyba atď.)
                    this.flash.showMessage('Neznáma chyba pri vytváraní tímu.', 'error');
                    console.error('Chyba pri vytváraní tímu:', err);
                }
            }
        },
        async deleteParticipant() {
            try {
                await api.delete('/' + this.participant.type + '/' + this.participant.id);
                const type = this.participant.type === 'players' ? 'Hráč' : 'Tím';
                this.flash.showMessage(`${type} ${this.participant.name} bol úspešne vymazaný`, 'success');
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
                name = player?.name || '';
            } else if (type === 'teams') {
                const team = this.teams.find(t => t.id === id);
                name = team.name || '';
            }

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.participant = null;
            this.showDeleteModal = false;
        }
    },
    computed: {
        userStore() {
            return useUserStore()
        },
        flash() {
            return useFlashMessageStore();
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
        },
        deleteMessage() {
            return `Naozaj chcete zmazať ${this.participant?.type === 'players' ? 'hráča' : 'tím'}: ${this.participant?.name}?`;
        }
    },
    components: { AppButton, ParticipantList, AppModal }
}

</script>

<style scoped>
.players {
    flex: 1;
    border-right: 1px solid #ccc;
    padding-right: 1rem;
}

.teams {
    flex: 1;
    padding-left: 1rem;
}

.ip-wrapper {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.inactive-participants {
    width: 400px;
    height: auto;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
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

    .players {
        border-right: none;
        border-bottom: 1px solid #ccc;
        padding-right: 0;
        width: 100%;
        padding-bottom: 1rem;
        text-align: center;
    }

    .teams {
        padding-left: 0;
        /* padding-top: 1rem; */
        width: 100%;
        text-align: center;
    }

    .ip-wrapper {
        flex-direction: column;
        align-items: center;
    }

    .inactive-participants {
        width: 90%;
        max-height: 200px;
    }

    .pagination :deep(.app-button) {
        padding: 0.5rem 0.8rem;
        font-size: 0.8rem;
        gap: 0.3rem;
    }
}
</style>