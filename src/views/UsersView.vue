<template>

    <FlashMessage />

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
                        <span v-else>Bez hráča</span>
                    </td>
                    <td>
                        <AppButton v-if="user.role === 'USER'" icon="🗑️" type="delete" htmltype="button"
                            @clicked="() => confirmDeleteUser(user)" />
                    </td>
                </tr>
            </tbody>
        </table>
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
import FlashMessage from '@/components/FlashMessage.vue';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'UsersView',
    data() {
        return {
            users: [],
            showDeleteModal: false,
            user: null,
            loading: true
        }
    },
    created() {
        this.fetchUsers()
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
        }
    }, computed: {
        flash() {
            return useFlashMessageStore();
        }
    },
    components: { AppButton, AppModal, FlashMessage }
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