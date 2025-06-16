<template>

    <AppHeader title="Zoznam používatelov:" />

    <ul v-if="!loading">
        <li v-for="user in users">

            <span> {{ user.username }} </span><br>
            <span> {{ user.role }} </span>

        </li>
    </ul>

    <div v-else>... loading ...</div>
    <div v-else>
        ... loading ...
    </div>

</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import axios from 'axios';

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
                    console.error('Chyba pri načítaní userov:', error)
                    this.loading = false
                })
        }
    },
    components: { AppHeader }
}

</script>

<style scoped>
:deep(ul) {
    width: 50%;
}
</style>