<template>
    <div class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="participants-columns">
                <!-- 🧍 Hráči -->
                <div class="column">

                    <AppButton v-if="isAdmin" label="Vytvoriť hráča" icon="➕" type="create" htmlType="button"
                        @clicked="addPlayer" />

                    <div v-if="loadingPlayers">
                        ... loading players...
                    </div>

                    <div v-else-if="players.length === 0" class="list-or-nothing">
                        <p>Žiadni hráči nie sú k dispozícii.</p>
                    </div>

                    <!-- Aktívni hráči -->
                    <div v-else class="list-or-nothing">
                        <ParticipantList class="participants" :title="'Zoznam hráčov'" :participants="paginatedPlayers"
                            :remove="isAdmin ? (id) => confirmDeleteParticipant('players', id) : null"
                            :showProgress="false" @view-detail="(id) => goToDetail('players', id)" />
                        <div v-if="totalPagesPlayers > 1" class="pagination">
                            <AppButton label="Predošlá" icon="←" type="edit" htmlType="button"
                                @clicked="currentPagePlayers--" :disabled="currentPagePlayers === 1" />
                            <span>{{ currentPagePlayers }} / {{ totalPagesPlayers }}</span>
                            <AppButton label="Ďalšia" icon="→" type="edit" htmlType="button"
                                @clicked="currentPagePlayers++" :disabled="currentPagePlayers === totalPagesPlayers" />
                        </div>
                    </div>

                    <!-- Neaktívni hráči -->
                    <div v-if="isAdmin" class="list-or-nothing">
                        <ParticipantList v-if="inactivePlayers.length > 0" class="participants"
                            :title="'Neaktívni (vymazaní) hráči'" :participants="inactivePlayers"
                            @view-detail="(id) => goToDetail('players', id)" :showProgress="false"
                            :remove="(id) => confirmDeleteParticipant('players', id)" />

                        <p v-else>Žiadni neaktívni hráči nie sú k dispozícii.</p>

                    </div>
                </div>

                <!-- 🧑‍🤝‍🧑 Tímy -->
                <div class="column">

                    <AppButton v-if="isAdmin" :label="showCreateTeamForm ? 'Zavrieť formulár' : 'Vytvoriť nový tím'"
                        icon="➕" :type="showCreateTeamForm ? 'delete' : 'create'" htmlType="button"
                        @clicked="toggleCreateForm" />

                    <!-- Formulár na vytvorenie tímu -->
                    <div v-if="showCreateTeamForm" class="list-or-nothing">
                        <div class="create-team-form">
                            <label for="player1">Hráč 1:</label>
                            <select id="player1" v-model="newTeam.player1Id">
                                <option value="">-- Vyber hráča --</option>
                                <option v-for="player in players" :key="player.id" :value="player.id">
                                    {{ player.firstName }} {{ player.lastName }}
                                </option>
                            </select>
                            <label for="player2">Hráč 2:</label>
                            <select id="player2" v-model="newTeam.player2Id">
                                <option value="">-- Vyber hráča --</option>
                                <option v-for="player in players" :key="player.id" :value="player.id">
                                    {{ player.firstName }} {{ player.lastName }}
                                </option>
                            </select>

                            <AppButton label="Vytvoriť" icon="➕" type="create" htmlType="button"
                                @clicked="createTeam" />
                        </div>

                    </div>

                    <!-- Načítavanie -->
                    <div v-if="loadingTeams">
                        ... loading teams...
                    </div>

                    <!-- Ak žiadne tímy -->
                    <div class="list-or-nothing" v-else-if="teams.length === 0">
                        <p>Žiadne tímy neboli zatiaľ vytvorené.</p>
                    </div>

                    <!-- Aktívne tímy -->
                    <div v-else class="list-or-nothing">
                        <ParticipantList class="participants" :title="'Zoznam tímov'" :participants="paginatedTeams"
                            :remove="isAdmin ? (id) => confirmDeleteParticipant('teams', id) : null"
                            :showProgress="false" @view-detail="(id) => goToDetail('teams', id)" />
                        <div v-if="totalPagesTeams > 1" class="pagination">
                            <AppButton label="Predošlá" icon="←" type="edit" htmlType="button"
                                @clicked="currentPageTeams--" :disabled="currentPageTeams === 1" />
                            <span>{{ currentPageTeams }} / {{ totalPagesTeams }}</span>
                            <AppButton label="Ďalšia" icon="→" type="edit" htmlType="button"
                                @clicked="currentPageTeams++" :disabled="currentPageTeams === totalPagesTeams" />
                        </div>
                    </div>

                    <!-- Neaktívne tímy -->
                    <div v-if="isAdmin" class="list-or-nothing">
                        <ParticipantList v-if="inactiveTeams.length > 0" class="participants"
                            :title="'Neaktívne (vymazané) tímy'" :participants="inactiveTeams"
                            @view-detail="(id) => goToDetail('teams', id)" :showProgress="false"
                            :remove="(id) => confirmDeleteParticipant('teams', id)" />
                        <p v-else>Žiadne neaktívne tími nie sú k dispozícii.</p>
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
            header: useHeaderStore(),
            userStore: useUserStore()
        }

    },
    created() {
        this.header.setTitle('Zoznam hráčov a tímov', '')
        this.fetchAllData()
    },
    methods: {
        async fetchAllData() {
            this.loadingPlayers = true
            this.loadingTeams = true
            this.loading = true

            try {
                const [playersRes, teamsRes] = await Promise.all([
                    api.get('/players/'),
                    api.get('/teams/')
                ])
                this.players = playersRes.data
                this.teams = teamsRes.data

                // 👉 Ak je admin, načítaj aj neaktívnych
                if (this.isAdmin) {
                    await this.fetchAllInactiveParticipants()
                }
            } catch (error) {
                // console.error('Chyba pri načítaní hráčov alebo tímov:', error)
            } finally {
                this.loadingPlayers = false
                this.loadingTeams = false
                this.loading = false
            }
        },

        async fetchAllInactiveParticipants() {
            try {
                const [inactivePlayersRes, inactiveTeamsRes] = await Promise.all([
                    api.get('/players/inactive'),
                    api.get('/teams/inactive')
                ])
                this.inactivePlayers = inactivePlayersRes.data
                this.inactiveTeams = inactiveTeamsRes.data
            } catch (error) {
                // console.error('Chyba pri načítaní neaktívnych hráčov alebo tímov:', error)
            }
        },
        async goToDetail(type, id) {
            try {
                // Skúsi načítať detail hráča – backend overí prihlásenie a práva
                await api.get(`/${type}/${id}`);
                // Ak request prešiel, presmerujeme na detail
                this.$router.push(`/${type}/${id}`);
            } catch (error) {
                // Chyby sa riešia automaticky v axios interceptore
            }
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

                // Resetovanie výberu hráčov
                this.newTeam = { player1Id: '', player2Id: '' }

                // Načítanie aktualizovaného zoznamu tímov
                this.fetchAllData();

                // ⬇️ Zatvorenie formulára
                this.toggleCreateForm();
            } catch (err) {
            }
        },
        async deleteParticipant() {
            try {
                const response = await api.delete(`/${this.participant.type}/${this.participant.id}`);
                const status = response.data?.status;
                const typeName = this.participant.type === 'players' ? 'Hráč' : 'Tím';

                switch (status) {
                    case 'deleted':
                        this.flash.showMessage(`${typeName} ${this.participant.name} bol úspešne vymazaný.`, 'success');
                        break;
                    case 'deactivated':
                        this.flash.showMessage(`${typeName} ${this.participant.name} ostáva deaktivovaný, pretože je stále súčasťou líg a zápasov.`, 'warning');
                        break;
                    case 'deactivated_player_in_team':
                        this.flash.showMessage(`${typeName} ${this.participant.name} nie je možné vymazať, pretože je stále súčasťou tímu.`, 'warning');
                        break;
                    default:
                        this.flash.showMessage(`Nastala chyba pri mazaní ${typeName.toLowerCase()}.`, 'error');
                }

                // Refresh dát podľa typu
                if (this.participant.type === 'teams') {
                    this.currentPageTeams = 1;
                } else if (this.participant.type === 'players') {
                    this.currentPagePlayers = 1;
                }
                await this.fetchAllData();

            } catch (err) {
                console.error(`Chyba pri mazaní ${this.participant.type.slice(0, -1)}a:`, err);
                this.flash.showMessage(`Nepodarilo sa vymazať ${this.participant.name}.`, 'error');
            } finally {
                this.cancelDelete();
            }
        },
        confirmDeleteParticipant(type, id) {
            let name = '';

            if (type === 'players') {
                const player = this.players.find(p => p.id === id) || this.inactivePlayers.find(p => p.id === id);
                name = player ? player.name : '';
            } else if (type === 'teams') {
                const team = this.teams.find(t => t.id === id) || this.inactiveTeams.find(t => t.id === id);
                name = team ? team.name : '';
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
.participants-columns {
    display: flex;
    gap: 2rem;
    align-items: stretch;
    width: 100%;
}

.column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 100%;
}

.list-or-nothing {
    align-items: center;
    font-size: 1.5rem;
}

.participants {
    width: 100%;
    padding-top: 1rem;
    flex-grow: 1;
}

.create-team-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
}


.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 1rem;
    margin-bottom: 1rem;
}

.pagination span {
    font-size: 1rem;
}

@media (max-width: 768px) {
    .participants-columns {
        flex-direction: column;
        gap: 1.5rem;
    }

    .pagination :deep(.app-button) {
        padding: 0.5rem 0.8rem;
        font-size: 0.8rem;
        gap: 0.3rem;
    }
}
</style>