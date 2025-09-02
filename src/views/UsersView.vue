<template>

    <div v-if="!loading">
        <table class="users-table">
            <thead>
                <tr>
                    <th>Meno používateľa</th>
                    <th>Rola</th>
                    <th>Hráč</th>
                    <th>Posledne prihlasenie</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                        <RouterLink v-if="user.playerId" :to="`/players/${user.playerId}`">
                            {{ user.playerName }}
                        </RouterLink>
                        <div v-else-if="user.role === 'USER'">
                            <select v-model="selectedPlayers[user.id]">
                                <option disabled value="">-- Vyber hráča --</option>
                                <option v-for="player in unassignedPlayers" :key="player.id" :value="player.id">
                                    {{ player.name }}
                                </option>
                            </select>
                            <AppButton type="submit" label="Priradiť" @clicked="() => assignPlayerToUser(user)" />
                        </div>
                        <span v-else>Bez možnosti priradiť hráča</span>
                    </td>
                    <td>
                        <span v-if="user.lastLogin"> {{ formatDate(user.lastLogin) }} </span>
                        <span v-else>Zatial žiadne prihlásenie</span>
                    </td>
                    <td>
                        <AppButton v-if="user.role === 'USER'" icon="🗑️" type="delete" htmltype="button"
                            @clicked="() => confirmDeleteUser(user)" />
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="ip-wrapper">
            <div class="inactive-participants">
                <ParticipantList :title="'Neaktívni (vymazaní) hráči'" :participants="inactivePlayers"
                    @view-detail="(id) => goToDetail('players', id)"
                    :remove="(id) => confirmDeleteParticipant('players', id)" />
            </div>
            <div class="inactive-participants">
                <ParticipantList :title="'Neaktívne (vymazané) tími'" :participants="inactiveTeams"
                    @view-detail="(id) => goToDetail('teams', id)"
                    :remove="(id) => confirmDeleteParticipant('teams', id)" />
            </div>
        </div>

    </div>

    <div v-else>Načítavam používateľov...</div>

    <AppModal :visible="showDeleteModal" :message="deleteModalMessage" @confirm="handleDeleteConfirm"
        @cancel="cancelDelete" />
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import ParticipantList from '@/components/ParticipantList.vue';

export default {
    name: 'UsersView',
    data() {
        return {
            users: [],
            unassignedPlayers: [],
            selectedPlayers: {},
            inactivePlayers: [],
            inactiveTeams: [],
            participant: null,
            showDeleteModal: false,
            user: null,
            loading: true
        }
    },
    created() {
        this.loadInitialData()
    },
    methods: {
        async loadInitialData() {
            this.loading = true;
            try {
                await this.fetchUsers();
                await this.fetchUnassignedPlayers();
                await this.fetchAllInactiveParticipants();
            } catch (error) {
                console.error('Chyba pri načítaní údajov:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchUsers() {
            this.loading = true;
            const header = useHeaderStore();
            try {
                const response = await axios.get('/api/rest/users/');
                this.users = response.data;
                header.setTitle('Zoznam používateľov', '');
            } catch (error) {
                console.error('Chyba pri načítaní používateľov:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchUnassignedPlayers() {
            this.loading = true;
            try {
                const response = await axios.get('/api/rest/players/without-user')
                this.unassignedPlayers = response.data
            } catch (error) {
                console.error('Chyba pri načítaní hráčov:', error)
            } finally {
                this.loading = false;
            }
        },
        async fetchAllInactiveParticipants() {
            this.loading = true;
            try {
                const [playersRes, teamsRes] = await Promise.all([
                    axios.get('/api/rest/players/inactive'),
                    axios.get('/api/rest/teams/inactive')
                ]);
                this.inactivePlayers = playersRes.data;
                this.inactiveTeams = teamsRes.data;
            } catch (error) {
                console.error('Chyba pri načítaní hráčov alebo tímov:', error);
            } finally {
                this.loading = false;
            }
        },
        async assignPlayerToUser(user) {
            const playerId = this.selectedPlayers[user.id]

            if (!playerId) {
                this.flash.showMessage('Najprv vyber hráča!', 'error')
                return
            }

            try {
                const res = await axios.patch(`/api/rest/players/assignToUser/${user.id}`, {
                    playerId: playerId
                })
                this.flash.showMessage(res.data, 'success')

                // Obnov zoznamy
                await this.fetchUsers()
                await this.fetchUnassignedPlayers()
            } catch (error) {
                console.error('Chyba pri priraďovaní hráča:', error)
                alert('Nepodarilo sa priradiť hráča.')
            }
        },
        async deleteUser() {
            try {
                await axios.delete('/api/rest/users/' + this.user?.id);
                this.loadInitialData()
                this.flash.showMessage('Užívatel ' + this.user?.username + ' úspešne vymazaný', 'success')
                console.log('Používatel vymazaný.');
            } catch (err) {
                console.error('Chyba pri mazaní používateľa:', err);
            } finally {
                this.cancelDelete();
            }
        },
        async deleteParticipant() {
            try {
                const response = await axios.delete('/api/rest/' + this.participant.type + '/' + this.participant.id);
                const status = response.data.status;
                const type = this.participant.type === 'players' ? 'Hráč' : 'Tím';

                if (status === 'deleted') {
                    this.flash.showMessage(`${type} ${this.participant.name} bol úspešne vymazaný.`, 'success');
                } else if (status === 'deactivated') {
                    this.flash.showMessage(`${type} ${this.participant.name} ostáva deaktivovaný, pretože je stále súčasťou líg a zápasov. `, 'warning');
                } else if (status === 'deactivated_player_in_team') {
                    this.flash.showMessage(`${type} ${this.participant.name} nie je možné vymazať, pretože je stále súčasťou tímu.`, 'warning');
                } else {
                    this.flash.showMessage(`Nastala chyba pri mazaní ${type.toLowerCase()}.`, 'error');
                }

                await this.fetchAllInactiveParticipants();

            } catch (err) {
                console.error(`Chyba pri mazaní ${this.participant.type.slice(0, -1)}a:`, err);
                this.flash.showMessage(`Nepodarilo sa vymazať ${this.participant.name}.`, 'error');
            } finally {
                this.cancelDelete();
            }
        },
        handleDeleteConfirm() {
            if (this.user) {
                this.deleteUser();
            } else if (this.participant) {
                this.deleteParticipant();
            }
        },
        confirmDeleteUser(user) {
            this.user = user;
            this.showDeleteModal = true;
        },
        confirmDeleteParticipant(type, id) {
            let name = '';

            if (type === 'players') {
                const player = this.inactivePlayers.find(p => p.id === id);
                name = player ? player.name : '';
            } else if (type === 'teams') {
                const team = this.inactiveTeams.find(t => t.id === id);
                name = team ? team.name : '';
            }

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.user = null;
            this.participant = null;
            this.showDeleteModal = false;
        },
        goToDetail(type, id) {
            this.$router.push(`/${type}/${id}`);
        },
        // formatPlayerName(player) {
        //     return player.firstName + ' ' + player.lastName
        // },
        // formatTeamName(team) {
        //     if (!team || !team.player1 || !team.player2) return '';
        //     return `${this.formatPlayerName(team.player1)} a ${this.formatPlayerName(team.player2)}`;
        // },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleString();
        }
    }, computed: {
        flash() {
            return useFlashMessageStore();
        },
        deleteModalMessage() {
            if (this.user) {
                return `Naozaj chcete zmazať používateľa: ${this.user.username}?`;
            } else if (this.participant) {
                const type = this.participant.type === 'players' ? 'hráča' : 'tím';
                return `Naozaj chcete zmazať ${type}: ${this.participant.name}?`;
            }
            return '';
        }
    },
    components: { AppButton, AppModal, ParticipantList }
}

</script>

<style scoped>
.users-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.users-table th,
.users-table td {
    padding: 8px;
    text-align: left;
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

@media (max-width: 768px) {
    .ip-wrapper {
        flex-direction: column;
        align-items: center;
    }

    .inactive-participants {
        width: 90%;
        max-height: 200px;
    }
}
</style>