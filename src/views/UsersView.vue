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
                                <th>Detaily hráčov</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="user in users" :key="user.id">
                                <tr>
                                    <td class="clickable" @click="toggleUserDetails(user)">
                                        {{ user.username }}
                                        <span>
                                            {{ user.expanded ? '▲' : '▼' }}
                                        </span>
                                    </td>
                                    <td>
                                        <label class="switch">
                                            <input type="checkbox" v-model="user.showDetails"
                                                @change="updateShowDetails(user)">

                                            <span class="slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <AppButton v-if="user.role === 'USER'" icon="🗑️" type="delete"
                                            @clicked="() => confirmDeleteUser(user)" />
                                    </td>
                                </tr>
                                <tr v-if="user.expanded">
                                    <td colspan="3">
                                        <div class="user-detail">

                                            <!-- prvý riadok -->

                                            <div class="detail-row">
                                                <div class="detail-box">
                                                    <b>Rola</b>
                                                    <select v-model="user.selectedRole" @focus="storePreviousRole(user)"
                                                        @change="handleRoleChange()">
                                                        <option value="USER">
                                                            USER
                                                        </option>
                                                        <option value="ADMIN">
                                                            ADMIN
                                                        </option>
                                                    </select>
                                                </div>
                                                <div class="detail-box">
                                                    <b>Hráč</b>
                                                    <div v-if="user.playerId">
                                                        <span class="clickable"
                                                            @click="goToDetail('players', user.playerId)">
                                                            {{ user.playerName }}
                                                        </span>
                                                        <div class="player-action">
                                                            <AppButton type="delete" label="Odpojiť"
                                                                @clicked="() => openUnassignModal(user)" />
                                                        </div>
                                                    </div>
                                                    <div v-else>
                                                        <select v-model="selectedPlayers[user.id]">
                                                            <option value="">
                                                            </option>
                                                            <option v-for="player in unassignedPlayers" :key="player.id"
                                                                :value="player.id">
                                                                {{ player.name }}
                                                            </option>
                                                        </select>
                                                        <div class="player-action">

                                                            <AppButton type="edit" label="Priradiť"
                                                                :disabled="!selectedPlayers[user.id]"
                                                                @clicked="assignPlayerToUser(user)" />

                                                        </div>

                                                    </div>

                                                </div>
                                            </div>

                                            <!-- druhý riadok -->

                                            <div>
                                                <b>Posledné prihlásenie</b>
                                                <br>
                                                <span v-if="user.lastLogin">
                                                    {{ user.lastLogin }}
                                                </span>
                                                <span v-else>
                                                    Zatiaľ žiadne prihlásenie
                                                </span>
                                            </div>
                                            <AppButton label="Reset hesla" type="edit"
                                                @clicked="openResetPasswordModal(user)" />

                                            <div v-if="showResetPasswordModal" class="modal-overlay"
                                                @click.self="closeResetPasswordModal">
                                                <div class="modal">
                                                    <h3>Reset hesla používateľa {{ user?.username }}</h3>

                                                    <input v-model="newPassword" type="password"
                                                        placeholder="Nové heslo" />

                                                    <input v-model="confirmPassword" type="password"
                                                        placeholder="Potvrďte heslo" />

                                                    <div class="modal-actions">
                                                        <AppButton label="Zrušiť" type="default"
                                                            @clicked="closeResetPasswordModal" />

                                                        <AppButton label="Resetovať heslo" type="create"
                                                            @clicked="resetPassword" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
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
    <AppModal :visible="showUnassignModal" :message="unassignMessage" @confirm="unassignPlayerFromUser"
        @cancel="cancelUnassign" />
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
            showUnassignModal: false,
            user: null,
            showResetPasswordModal: false,
            newPassword: '',
            confirmPassword: '',
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
                    selectedRole: user.role, // predvolená hodnota v selecte
                    showDetails: user.showDetails,
                    expanded: false
                }));
                header.setTitle('Zoznam používateľov', '');
            } catch (error) {
                console.error('Chyba pri načítaní používateľov:', error);
            } finally {
                this.loading = false;
            }
        },
        async goToDetail(type, id) {
            try {
                await api.get(`/players/${id}`);
                this.$router.push(`/${type}/${id}`);
            } catch (error) {
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
        toggleUserDetails(user) {
            user.expanded = !user.expanded
        },
        async resetPassword() {
            if (!this.newPassword) {
                this.flash.showMessage(
                    'Zadajte nové heslo',
                    'error'
                )
                return
            }

            if (this.newPassword !== this.confirmPassword) {
                this.flash.showMessage(
                    'Heslá sa nezhodujú',
                    'error'
                )
                return
            }

            await api.patch(
                `/auth/admin/users/${this.user.id}/reset-password`,
                {
                    newPassword: this.newPassword
                }
            )

            this.flash.showMessage(
                `Heslo používateľa ${this.user.username} bolo resetované`,
                'success'
            )

            this.closeResetPasswordModal()
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
        async unassignPlayerFromUser() {
            try {
                const res = await api.patch(`/players/unassignFromUser/${this.user?.playerId}`, {
                })
                this.flash.showMessage(res.data, 'warning')
                this.selectedPlayers = []
                await this.fetchUsers()
                await this.fetchUnassignedPlayers()
            } catch (error) {
                console.error('Chyba pri vyraďovaní hráča:', error)
                alert('Nepodarilo sa vyradiť hráča.')
            } finally {
                this.cancelUnassign()
            }
        },
        openUnassignModal(user) {
            this.user = user
            this.showUnassignModal = true
        },
        cancelUnassign() {
            this.user = null
            this.showUnassignModal = false
        },
        storePreviousRole(user) {
            // toto sa zavolá ešte pred zmenou
            this.user = user
            this.previousRole = user.selectedRole
        },
        handleRoleChange() {
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
                this.fetchUsers()
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
        },
        async updateShowDetails(user) {
            try {
                const response = await api.patch('/users/showPlayerDetails', {
                    userId: user.id,
                    showDetails: user.showDetails
                })
                this.flash.showMessage(response.data, "success")
            } catch (error) {
                console.error(error)
                this.flash.showMessage("Nastala chyba pri ukladaní", "error")

                // vrátime hodnotu späť ak nastala chyba
                user.showDetails = !user.showDetails
            }
        },
        openResetPasswordModal(user) {
            this.user = user
            this.newPassword = ''
            this.confirmPassword = ''
            this.showResetPasswordModal = true
        },
        closeResetPasswordModal() {
            this.showResetPasswordModal = false
            this.user = null
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
        },
        unassignMessage() {
            return `Naozaj chceš odpojiť hráča ${this.user?.playerName} od používateľa ${this.user?.username}?`
        }
    },
    components: { AppButton, AppModal, ParticipantList }
}

</script>

<style scoped>
.users-section {
    width: 100%;
    overflow-x: auto;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th,
.users-table td {
    font-size: 1.2rem;
    padding: 8px;
}

.user-detail {
    padding: 15px;
    border-radius: 10px;
}


.detail-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 15px;
}


.detail-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}


.detail-box select {
    width: 100%;
    max-width: 120px;
}


.detail-actions {
    margin-top: 10px;
}

.player-action {
    margin-top: 8px;
}

.clickable {
    cursor: pointer;
}

.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #d1d5db;
    /* sivé pozadie */
    transition: .3s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

/* toggle ON */
.switch input:checked+.slider {
    background-color: #4ade80;
    /* pekná zelená */
}

.switch input:checked+.slider:before {
    transform: translateX(24px);
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
}

.modal {
    background: #002E2C;
    padding: 24px;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
}

.modal input {
    width: 100%;
    margin-bottom: 12px;
    padding: 8px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

@media (max-width:768px) {

    .users-table th {
        font-size: 0.8rem;
    }

    .users-table td {
        font-size: 1rem;
    }


    .detail-box select {
        font-size: 0.8rem;
        padding: 0.5rem 0.7rem;
        min-height: 36px;

    }

    /* menší toggle */
    .switch {
        width: 34px;
        height: 18px;
    }

    .slider:before {
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
    }

    .switch input:checked+.slider:before {
        transform: translateX(16px);
    }
}
</style>