<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="list-or-nothing">
                <div class="first">
                    <div class="list-row">
                        <h3 class="value">Kapitán:</h3>
                        <h3 @click="goToDetail('players', team.captain?.id)" class="captain">{{ team.captain?.name }}
                        </h3>
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

                    <div v-if="canManagePlayers" class="player-add">

                        <AppButton v-if="!showAddPlayer" label="Pridať hráča" type="create" icon="+"
                            @clicked="showAddPlayer = true" />

                        <div v-else>

                            <input v-model="newPlayer" type="text" placeholder="Meno hráča" />

                            <div class="buttons">
                                <AppButton label="Pridať" type="create" icon="+" @clicked="addPlayer" />

                                <AppButton label="Zrušiť" type="delete" @clicked="cancelAddPlayer" />
                            </div>

                        </div>

                    </div>
                </div>

                <div class="second">
                    <div class="matches">
                        <section v-if="allMatches.length > 0">
                            <div class="list-or-nothing">

                                <!-- tabuľka zápasov -->
                                <h3 @click="showMatches = !showMatches">
                                    Zápasy
                                    <span v-if="showMatches">▲</span>
                                    <span v-else>▼</span>
                                </h3>

                                <transition name="fade">
                                    <table v-show="showMatches" class="matches-table">

                                        <thead>
                                            <tr>
                                                <th colspan="2">Zápas</th>
                                                <th>Výsledok</th>
                                                <th>Kolo</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <template v-for="match in allMatches" :key="match.id">

                                                <!-- 🔹 HLAVNÝ RIADOK -->
                                                <tr>

                                                    <td colspan="2" data-label="Zápas">
                                                        <div class="match-cell">
                                                            <div :class="getTeamClass(match, 'home')">
                                                                <strong>{{ match.volleyHomeTeam.name }}</strong>
                                                            </div>
                                                            <div class="vs">
                                                                vs
                                                            </div>
                                                            <div :class="getTeamClass(match, 'away')">
                                                                <strong>{{ match.volleyAwayTeam.name }}</strong>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    <td data-label="Výsledok">
                                                        <span
                                                            v-if="['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status) && match.result">
                                                            {{ match.result.homeTeamScore }} : {{
                                                                match.result.awayTeamScore }}
                                                            <span v-if="match.result.setScores?.length"
                                                                class="set-scores">
                                                                (
                                                                <span v-for="(set, i) in match.result.setScores"
                                                                    :key="i">
                                                                    {{ set.score1 }} : {{ set.score2 }}<span
                                                                        v-if="i < match.result.setScores.length - 1">,
                                                                    </span>
                                                                </span>
                                                                )
                                                            </span>
                                                        </span>

                                                        <span v-else-if="(isAdmin || isUserPlayerInMatch(match))">
                                                            <AppButton
                                                                :label="activeMatchId === match.id ? 'Zavrieť' : 'Zadať'"
                                                                :type="activeMatchId === match.id ? 'delete' : 'edit'"
                                                                html-type="button" @clicked="toggleForm(match.id)" />
                                                        </span>

                                                        <span v-else>-</span>
                                                    </td>

                                                    <td data-label="Kolo">
                                                        {{ match.roundNumber }}
                                                    </td>

                                                    <td data-label="Status">
                                                        <span :class="{
                                                            'badge-finished': match.status === 'FINISHED',
                                                            'badge-cancelled': match.status === 'CANCELLED',
                                                            'badge-scratched': match.status === 'SCRATCHED',
                                                            'badge-pending': !['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(match.status)
                                                        }">
                                                            {{
                                                                match.status === 'FINISHED' ? 'Odohratý' :
                                                                    match.status === 'CANCELLED' ? 'Zrušený' :
                                                                        match.status === 'SCRATCHED' ? 'Skrečovaný' :
                                                                            'Neodohratý'
                                                            }}
                                                        </span>
                                                    </td>

                                                </tr>

                                                <!-- 🔥 FORMULÁR -->
                                                <tr v-if="activeMatchId === match.id">
                                                    <td colspan="6" class="form-cell">
                                                        <div class="form-wrapper">
                                                            <AddMatchResult :match="match" :leagueType="'VOLLEYBALL'"
                                                                @result-submitted="fetchMatchesAndClose" />
                                                        </div>
                                                    </td>
                                                </tr>

                                            </template>
                                        </tbody>
                                    </table>
                                </transition>
                            </div>

                        </section>
                    </div>
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
import AddMatchResult from '@/components/AddMatchResult.vue';

export default {
    name: 'TeamDetailView.vue',
    data() {
        return {
            team: null,
            loading: true,
            newPlayer: '',
            showAddPlayer: false,
            createdMatches: [],
            finishedMatches: [],
            cancelledMatches: [],
            scratchedMatches: [],
            activeMatchId: null,
            showMatches: window.innerWidth > 768,
            header: useHeaderStore(),
            userStore: useUserStore()
        }
    },
    created() {
        this.fetchAll();
    },
    methods: {
        async fetchAll() {
            this.loading = true;

            try {
                await this.fetchTeam();
                await this.fetchTeamMatches();

                this.header.setTitle(this.team.name, '');

            } finally {
                this.loading = false;
            }
        },
        async fetchTeam() {
            try {
                const response = await api.get('/volleyball/teams/' + this.teamId);
                this.team = response.data;
            } catch (error) {
                console.error('Chyba pri načítavaní tímu:', error);
            }
        },
        async fetchTeamMatches() {
            try {
                const [createdRes, finishedRes, cancelledRes, scratchedRes] = await Promise.all([
                    api.get(`/volleyball/volley-matches/team/${this.teamId}/status/CREATED`),
                    api.get(`/volleyball/volley-matches/team/${this.teamId}/status/FINISHED`),
                    api.get(`/volleyball/volley-matches/team/${this.teamId}/status/CANCELLED`),
                    api.get(`/volleyball/volley-matches/team/${this.teamId}/status/SCRATCHED`)
                ]);

                this.createdMatches = createdRes.data;
                this.finishedMatches = finishedRes.data;
                this.cancelledMatches = cancelledRes.data;
                this.scratchedMatches = scratchedRes.data;
            } catch (error) {
                console.error('Chyba pri načítavaní zápasov:', error);
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
                this.showAddPlayer = false;

                this.flash.showMessage(
                    '✅ Hráč ' + playerName + ' bol úspešne pridaný do tímu!',
                    'success'
                );

            } catch (error) {
                console.error('Chyba pri pridávaní hráča:', error);
            }
        },
        cancelAddPlayer() {
            this.newPlayer = '';
            this.showAddPlayer = false;
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
        async goToDetail(type, id) {
            try {
                // Skúsi načítať detail hráča – backend overí prihlásenie a práva
                await api.get(`/${type}/${id}`);
                // Ak request prešiel, presmerujeme na detail
                this.$router.push(`/volleyball/${type}/${id}`);
            } catch (error) {
                // Chyby sa riešia automaticky v axios interceptore
            }
        },
        getTeamClass(match, side) {
            if (!match.result) return '';

            const home = match.result.homeTeamScore;
            const away = match.result.awayTeamScore;

            const isDraw = home === away;

            if (isDraw) return '';

            const isHomeWinner = home > away;

            if (side === 'home' && isHomeWinner) return 'winner';
            if (side === 'away' && !isHomeWinner) return 'winner';

            return 'loser';
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        async fetchMatchesAndClose() {
            await this.fetchAll();
            this.activeMatchId = null;
            this.flash.showMessage('✅ Výsledok bol úspešne uložený!', 'success')
        },
        isUserPlayerInMatch(match) {
            const playerId = this.userStore.playerId;

            return (
                match.volleyHomeTeam?.captain?.id === playerId ||
                match.volleyAwayTeam?.captain?.id === playerId
            );
        }
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
        teamId() {
            return this.$route.params.id
        },
        allMatches() {
            return [...this.createdMatches, ...this.finishedMatches, ...this.cancelledMatches, ...this.scratchedMatches];
        },
    },
    components: { AppButton, AddMatchResult }
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

.first {
    width: 100%;
    text-align: center;
}

.second {
    width: 100%;
    padding: 0.5rem;
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

.player-add {
    display: flex;
    justify-content: center;
    padding: 10px 0;
}

.player-add input {
    padding: 0.65rem 0.8rem;
    border: 1px solid #3a815c;
    border-radius: 8px;
    background: #fff;
    color: #222;
    font-size: 0.95rem;
    outline: none;
}

.player-add .buttons {
    display: flex;
    justify-content: space-between;
    padding: 10px;
}

.captain {
    color: #ffd700;
    font-size: 1.3rem;
    cursor: pointer;
}

.label {
    color: #ffd700;
    font-size: 1.3rem;
}

.value {
    font-size: 1.4rem;
}

.matches {
    width: 100%;

}

.matches h3 {
    cursor: pointer;
}

.matches-table {
    width: 100%;
    border-collapse: collapse;
}

.matches-table th,
.matches-table td {
    padding: 0.5rem;
}

.matches-table th {
    line-height: 1.2;
}

.matches-table td {
    white-space: normal;
}

.form-cell {
    text-align: center;
}

.form-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

/* match cell */
.match-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
}

.vs {
    font-size: 0.8rem;
    opacity: 0.7;
    text-transform: lowercase;
}

.set-scores {
    margin-left: 8px;
    display: inline-flex;
    gap: 4px;
    font-size: 0.85em;
    opacity: 0.9;
}

.winner {
    color: #ADFF2F;
    text-shadow: 0 0 6px rgba(173, 255, 47, 0.3);
}

/* statusy */
.badge-finished {
    color: #ADFF2F;
}

.badge-cancelled {
    color: #FF4C4C;
}

.badge-scratched {
    color: #FFC107;
}

.badge-pending {
    color: #f5f5f5;
    font-style: italic;
}

@media (max-width: 768px) {
    .label {
        font-size: 1.2rem;
    }

    .value {
        font-size: 1rem;
    }

    .matches h3 {
        font-size: 1.4rem;
    }

    .matches-table,
    .matches-table tbody {
        display: block;
        width: 100%;
    }

    .matches-table thead {
        display: none;
    }

    .matches-table tr {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.6rem;
        background: #1e1e1e;
        border-radius: 8px;
        padding: 0.8rem;
        border: 1px solid wheat;
    }

    .matches-table td {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 0.3rem 0;
        border: none;
        font-size: 0.9rem;
    }

    .matches-table td::before {
        content: attr(data-label);
        color: #ffd700;
    }
}
</style>