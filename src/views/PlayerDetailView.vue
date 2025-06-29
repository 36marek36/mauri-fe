<template>

    <AppHeader title="Detail hráča" />

    <div v-if="loading">... loading ...</div>

    <ul v-else>
        <li>
            <span>first name: </span>
            <span>{{ player.firstName }}</span>
        </li>
        <li>
            <span>last name: </span>
            <span>{{ player.lastName }}</span>
        </li>
        <li>
            <span>email: </span>
            <span>{{ player.email ? player.email : 'nezadaný' }}</span>
        </li>
        <li>
            <span>telefón: </span>
            <span>{{ player.phone ? player.phone : 'nezadaný' }}</span>
        </li>
        <li>
            <span>dátum registrácie: </span>
            <span>{{ formatDate(player.registrationDate) }}</span>
        </li>
        <li>
            <span>zoznam líg:</span>
            <span class="league-names">
                <span v-for="league in playerLeagues" :key="league.leagueName">
                    {{ league.leagueName }} ({{ league.seasonYear }})</span>
            </span>
        </li>
    </ul>

</template>

<script>

import AppHeader from '@/components/AppHeader.vue';
import axios from 'axios';

export default {
    name: 'PlayerDetailView.vue',
    data() {
        return {
            player: null,
            playerLeagues: [],
            loading: true
        }
    },
    created() {
        axios.get('/api/rest/players/' + this.$route.params.id)
            .then((response) => {
                this.player = response.data
                this.loadPlayerLeagues()
                this.loading = false
            })
    },
    methods: {
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('sk-SK', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        loadPlayerLeagues() {
            axios.get(`/api/rest/players/${this.player.id}/leagues`)
                .then(response => {
                    this.playerLeagues = response.data;
                })
                .catch(err => {
                    console.error('Chyba pri načítaní líg hráča:', err);
                });
        }
    },
    components: { AppHeader }
}

</script>

<style scoped>
ul {
    list-style-type: none;
    max-width: 250px;
}

li {
    display: flex;
    justify-content: space-between;
}

li span:nth-child(2) {
    font-weight: bold;
}

.league-names {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* Toto zarovná vnútorné span-y doprava */
}

.league-names span {
    font-weight: bold;
}
</style>