<template>

    <div class="main-layout" v-if="!loading">

        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="users-section">
                <div class="list-or-nothing">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Používateľ</th>
                                <th>Rola</th>
                                <th>Hráč</th>
                                <th>Prihlásený</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id">
                                <td>{{ user.username }}</td>
                                <td>
                                    <select v-model="user.selectedRole" @focus="storePreviousRole(user)"
                                        @change="handleRoleChange(user)">
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                                <td>
                                    <RouterLink v-if="user.playerId" :to="`/players/${user.playerId}`">
                                        {{ user.playerName }}
                                    </RouterLink>
                                    <div v-else>
                                        <select v-model="selectedPlayers[user.id]">
                                            <option value=""></option>
                                            <option v-for="player in unassignedPlayers" :key="player.id"
                                                :value="player.id">
                                                {{ player.name }}
                                            </option>
                                        </select>
                                        <AppButton html-type="submit" label="Priradiť"
                                            :disabled="!selectedPlayers[user.id]"
                                            @clicked="() => assignPlayerToUser(user)" />
                                    </div>
                                </td>
                                <td>
                                    <span v-if="user.lastLogin"> {{ user.lastLogin }} </span>
                                    <span v-else>Zatial žiadne prihlásenie</span>
                                </td>
                                <td>
                                    <AppButton v-if="user.role === 'USER'" icon="🗑️" type="delete" htmltype="button"
                                        @clicked="() => confirmDeleteUser(user)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div v-else>Načítavam používateľov...</div>

    <AppModal :visible="showDeleteModal" :message="deleteMessage" @confirm="deleteUser" @cancel="cancelDelete" />
    <AppModal :visible="showChangeRoleModal" :message="changeRoleMessage" @confirm="confirmChange"
        @cancel="cancelChange" />
</template>

<script>
import api from '@/axios-interceptor';
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
            showDeleteModal: false,
            previousRole: null,
            showChangeRoleModal: false,
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
                const response = await api.get('/users/');
                this.users = response.data.map(user => ({
                    ...user,
                    selectedRole: user.role // predvolená hodnota v selecte
                }));
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
                const response = await api.get('/players/without-user')
                this.unassignedPlayers = response.data
            } catch (error) {
                console.error('Chyba pri načítaní hráčov:', error)
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
                const res = await api.patch(`/players/assignToUser/${user.id}`, {
                    playerId: playerId
                })
                this.flash.showMessage(res.data, 'success')
                await this.fetchUsers()
                await this.fetchUnassignedPlayers()
            } catch (error) {
                console.error('Chyba pri priraďovaní hráča:', error)
                alert('Nepodarilo sa priradiť hráča.')
            }
        },
        storePreviousRole(user) {
            // toto sa zavolá ešte pred zmenou
            this.user = user
            this.previousRole = user.selectedRole
        },
        handleRoleChange(user) {
            // otvoríme modal, role už máme uloženú
            this.showChangeRoleModal = true
        },
        confirmChange() {
            this.updateUserRole(this.user)
            this.resetModal()
        },
        cancelChange() {
            if (this.user) {
                this.user.selectedRole = this.previousRole
            }
            this.resetModal()
        },
        resetModal() {
            this.showChangeRoleModal = false
            this.user = null
            this.previousRole = null
        },
        async updateUserRole(user) {
            try {
                const response = await api.patch('/users/updateRole', {
                    userId: user.id,
                    updateUserRole: user.selectedRole
                })
                // Tu sa vypíše správa z backendu
                this.flash.showMessage(response.data, 'success')
            } catch (error) {
                console.error(error)
                // Backend môže posielať message aj pri chybe
                const msg = error.response?.data?.message || 'Chyba pri zmene role.'
                alert(msg)
            }
        },
        async deleteUser() {
            try {
                await api.delete('/users/' + this.user?.id);
                this.loadInitialData()
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
        }
    }, computed: {
        flash() {
            return useFlashMessageStore();
        },
        deleteMessage() {
            return `Naozaj chcete zmazať používatela ${this.user?.username}?`;
        },
        changeRoleMessage() {
            return 'Naozaj chcete zmenit rolu používatela ' + this.user?.username + ' na ' + this.user?.selectedRole + ' ?';
        }
    },
    components: { AppButton, AppModal, ParticipantList }
}

</script>

<style scoped>
.users-section {
    width: 100%;
}

.users-table {
    min-width: 600px;
    width: 100%;
    border-collapse: collapse;
}

.users-table th,
.users-table td {
    font-size: 1.2rem;
    padding: 8px;
    text-align: left;
}
</style>