<template>

    <h1>Všetci users:</h1>

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
    }
}

</script>

<style scoped>
:deep(ul) {
    width: 50%;
}

</style>