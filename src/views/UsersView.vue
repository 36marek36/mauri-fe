<template>
    <AppHeader title="Zoznam používateľov:" />

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
                        <span v-else>Užívateľ nemá svojho hráča</span>
                    </td>
                    <td>
                        <AppButton v-if="user.role === 'USER'" label="Vymazat" icon="🗑️" type="delete"
                            htmltype="button" @clicked="() => confirmDeleteUser(user)" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-else>Načítavam používateľov...</div>

    <ConfirmModal :visible="showConfirmModal" :message="`Naozaj chcete zmazať používateľa: ${user?.username}?`"
        @confirm="deleteUser" @cancel="cancelDelete" />
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

export default {
    name: 'UsersView',
    data() {
        return {
            users: [],
            showConfirmModal: false,
            user: null,
            loading: true
        }
    },
    created() {
        this.fetchUsers()
    },
    methods: {

        fetchUsers() {
            axios.get('/api/rest/users/')
                .then((response) => {
                    this.users = response.data
                    this.loading = false
                })
                .catch((error) => {
                    console.error('Chyba pri načítaní používatelov:', error)
                    this.loading = false
                })
        },
        async deleteUser() {
            try {
                await axios.delete('/api/rest/users/' + this.user?.id);
                this.fetchUsers();
                console.log('Používatel vymazaný.');
            } catch (err) {
                console.error('Chyba pri mazaní používateľa:', err);
            } finally {
                this.cancelDelete();
            }
        },
        confirmDeleteUser(user) {
            this.user = user;
            this.showConfirmModal = true;
        },
        cancelDelete() {
            this.user = null;
            this.showConfirmModal = false;
        }
    },
    components: { AppHeader, AppButton, ConfirmModal }
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
</style>