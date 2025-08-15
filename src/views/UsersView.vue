<template>

    <div v-if="!loading">
        <table class="users-table">
            <thead>
                <tr>
                    <th>Meno používateľa</th>
                    <th>Rola</th>
                    <th>Hráč</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.role }}</td>
                    <td>
                        <RouterLink v-if="user.player" :to="`/players/${user.player.id}`">
                            {{ user.player.firstName }} {{ user.player.lastName }}
                        </RouterLink>
                        <div v-else-if="user.role === 'USER'">
                            <select v-model="selectedPlayers[user.id]">
                                <option disabled value="">-- Vyber hráča --</option>
                                <option v-for="player in unassignedPlayers" :key="player.id" :value="player.id">
                                    {{ player.firstName }} {{ player.lastName }}
                                </option>
                            </select>
                            <AppButton type="submit" label="Priradiť" @clicked="() => assignPlayerToUser(user)" />
                        </div>
                        <span v-else>Bez možnosti priradiť hráča</span>
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
                    :formatName="formatPlayerName" @view-detail="(id) => goToDetail('players', id)" />
            </div>
            <div class="inactive-participants">
                <ParticipantList :title="'Neaktívne (vymazané) tími'" :participants="inactiveTeams"
                    :formatName="formatTeamName" @view-detail="(id) => goToDetail('teams', id)" />
            </div>
        </div>

    </div>

    <div v-else>Načítavam používateľov...</div>

    <AppModal :visible="showDeleteModal" :message="`Naozaj chcete zmazať používateľa: ${user?.username}?`"
        @confirm="deleteUser" @cancel="cancelDelete" />
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
            showDeleteModal: false,
            user: null,
            loading: true
        }
    },
    created() {
        this.fetchUsers();
        this.fetchUnassignedPlayers();
        this.fetchInactivePlayers();
        this.fetchInactiveTeams();
    },
    methods: {

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
        async fetchInactivePlayers() {
            this.loading = true;
            try {
                const response = await axios.get('/api/rest/players/inactive')
                this.inactivePlayers = response.data
            } catch (error) {
                console.error('Chyba pri načítaní hráčov:', error)
            } finally {
                this.loading = false
            }
        },
        async fetchInactiveTeams() {
            this.loading = true;
            try {
                const response = await axios.get('/api/rest/teams/inactive')
                this.inactiveTeams = response.data
            } catch (error) {
                console.error('Chyba pri načítaní hráčov:', error)
            } finally {
                this.loading = false
            }
        },
        async assignPlayerToUser(user) {
            const playerId = this.selectedPlayers[user.id]

            if (!playerId) {
                this.flash.showMessage('Najprv vyber hráča!', 'error')
                return
            }

            try {
                await axios.patch(`/api/rest/players/assignToUser/${user.id}`, {
                    playerId: playerId
                })
                this.flash.showMessage('Hráč bol úspešne priradený.', 'success')

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
                this.fetchUsers();
                this.flash.showMessage('Užívatel ' + this.user?.username + ' úspešne vymazaný', 'success')
                console.log('Používatel vymazaný.');
            } catch (err) {
                console.error('Chyba pri mazaní používateľa:', err);
            } finally {
                this.cancelDelete();
            }
        },
        confirmDeleteUser(user) {
            this.user = user;
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.user = null;
            this.showDeleteModal = false;
        },
        goToDetail(type, id) {
            this.$router.push(`/${type}/${id}`);
        },
        formatPlayerName(player) {
            return player.firstName + ' ' + player.lastName
        },
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.formatPlayerName(team.player1)} a ${this.formatPlayerName(team.player2)}`;
        }
    }, computed: {
        flash() {
            return useFlashMessageStore();
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