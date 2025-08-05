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
                        <AppButton v-if="user.role==='USER'" label="Vymazat" icon="🗑️" type="delete" html-type="button"
                            @clicked="() => deleteUser(user.id)" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-else>Načítavam používateľov...</div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';

export default {
    name: 'UsersView',
    data() {
        return {
            users: [],
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
        deleteUser(userId) {
            if (confirm('Naozaj chceš vymazať tohto používatela?')) {
                axios.delete('/api/rest/users/' + userId)
                    .then(() => {
                        alert('Používatel bol vymazaný.')
                        this.fetchUsers()
                    })
                    .catch((error) => {
                        alert('Nepodarilo sa vymazať používatela.')
                        console.error('Chyba pri mazaní používatela:', error);
                    })
            }
        }
    },
    components: { AppHeader, AppButton }
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