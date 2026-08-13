<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="list-or-nothing">
                <div class="list-row">
                    <h3 class="label">Kapitán:</h3>
                    <h3 class="value">{{ team.captain?.name }}</h3>
                </div>

                <div class="list-row">
                    <h3 class="label">Hráči:</h3>
                    <div>
                        <div v-for="player in team.players" :key="player" class="player-row">
                            <h3 class="value">
                                {{ player }}
                            </h3>
                            <AppButton v-if="canManagePlayers" label="" icon="🗑" type="delete"
                                @clicked="removePlayer(player)" />
                        </div>
                    </div>
                </div>
                <div v-if="canManagePlayers">
                    <input v-model="newPlayer" type="text" placeholder="Meno hráča" />
                    <AppButton label="Pridať hráča" type="create" icon="+" @clicked="addPlayer" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import { useFlashMessageStore } from '@/stores/flashMessage';

export default {
    name: 'TeamDetailView.vue',
    data() {
        return {
            team: null,
            loading: true,
            newPlayer: '',
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        this.fetchTeam();
    },
    methods: {
        async fetchTeam() {
            try {
                const response = await api.get('/volleyball/teams/' + this.$route.params.id);
                this.team = response.data;
                this.header.setTitle(this.team.name, '');
                this.loading = false
            } catch (error) {
                console.error('Chyba pri načítavaní tímu:', error);
            }
        },
        async addPlayer() {
            if (!this.newPlayer.trim()) {
                return;
            }

            try {
                const playerName = this.newPlayer.trim();

                await api.patch(
                    '/volleyball/teams/' + this.team.id + '/add',
                    {
                        playerName: playerName
                    }
                );

                this.team.players.push(playerName);
                this.newPlayer = '';

                this.flash.showMessage(
                    '✅ Hráč ' + playerName + ' bol úspešne pridaný do tímu!',
                    'success'
                );

            } catch (error) {
                console.error('Chyba pri pridávaní hráča:', error);
            }
        },
        async removePlayer(player) {
            try {
                await api.patch(
                    '/volleyball/teams/' + this.team.id + '/remove',
                    {
                        playerName: player
                    }
                );

                this.team.players = this.team.players.filter(
                    p => p !== player
                );

                this.flash.showMessage(
                    '🗑️ Hráč ' + player + ' bol úspešne odstránený z tímu!',
                    'warning'
                );

            } catch (error) {
                console.error('Chyba pri odstraňovaní hráča:', error);
            }
        },
    },
    computed: {
        isAdmin() {
            return this.userStore.isAdmin
        },
        isCaptain() {
            return this.userStore.playerId === this.team?.captain?.id
        },
        canManagePlayers() {
            return this.isAdmin || this.isCaptain
        },
        flash() {
            return useFlashMessageStore();
        },
    },
    components: { AppButton }
}

</script>

<style scoped>
.right-side {
    flex-direction: column;
}

.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
}

.list-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 1px 10px;
}

.player-row {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
}

.label {
    color: #ffd700;
    font-size: 1.3rem;
}

.value {
    font-size: 1.4rem;
}

@media (max-width: 768px) {
    .label {
        font-size: 1.2rem;
    }

    .value {
        font-size: 1rem;
    }
}
</style>