<template>
    <div class="main-layout">

        <div class="left-side">
        </div>

        <div class="right-side">
            <div class="list-or-nothing">

                <!-- VYTVORENIE ZÁPASU -->
                <div v-if="!createdMatch" class="create-match">

                    <div v-if="hasPlayer">

                        <!-- PREPÍNANIE TYPU ZÁPASU -->
                        <div class="matchType-switch">
                            <div class="switch-buttons">
                                <AppButton label="Dvojhra" type="default"
                                    :class="{ active: selectedMatchType === 'SINGLES' }"
                                    @clicked="changeMatchType('SINGLES')" />

                                <AppButton label="Štvorhra" type="default"
                                    :class="{ active: selectedMatchType === 'DOUBLES' }"
                                    @clicked="changeMatchType('DOUBLES')" />
                            </div>
                        </div>

                        <!-- DVOJHRA -->
                        <template v-if="selectedMatchType === 'SINGLES'">

                            <div class="me">
                                <h3>
                                    {{ userStore.user?.playerName }}
                                </h3>
                            </div>

                            <h3 class="vs">vs</h3>

                        </template>

                        <!-- ŠTVORHRA -->
                        <template v-else>

                            <div class="my-team-selection">



                                <!-- EŠTE NIE JE VYBRANÝ TÍM -->
                                <div v-if="!selectedMyTeam">

                                    <h3>Môj tím</h3>

                                    <select v-model="selectedMyTeam">
                                        <option :value="null" disabled>
                                            Vyber svoj tím
                                        </option>

                                        <option v-for="team in myTeams" :key="team.id" :value="team">
                                            {{ team.name }}
                                        </option>
                                    </select>

                                    <div v-if="!myTeams.length && !loading" class="empty-message">
                                        Nie si členom žiadneho tímu.
                                    </div>

                                </div>

                                <!-- VYBRANÝ TÍM -->
                                <div v-else class="my-team-name">

                                    <h3>{{ selectedMyTeam.name }}</h3>

                                    <AppButton class="change-button" label="Zmeniť tím" type="edit"
                                        @clicked="selectedMyTeam = null" />

                                </div>

                            </div>

                            <h3 class="vs">vs</h3>

                        </template>

                        <!-- VÝBER SÚPERA -->
                        <div class="opponent">

                            <div v-if="!selectedOpponent" class="opponent-selection">

                                <h3>
                                    {{ selectedMatchType === 'SINGLES'
                                        ? 'Oponent'
                                        : 'Súperov tím' }}
                                </h3>

                                <input v-model="search" type="text" :placeholder="selectedMatchType === 'SINGLES'
                                    ? 'Začni písať meno hráča...'
                                    : 'Začni písať názov tímu...'" autocomplete="off" class="opponent-search" />

                                <div v-if="loading" class="empty-message">
                                    Načítavam...
                                </div>

                                <!-- ZOZNAM HRÁČOV -->
                                <template v-else-if="selectedMatchType === 'SINGLES'">

                                    <div v-if="search.trim() && !filteredPlayers.length" class="empty-message">
                                        Žiadny hráč sa nenašiel.
                                    </div>

                                    <ul v-if="filteredPlayers.length" class="player-list">
                                        <li v-for="player in filteredPlayers" :key="player.id ?? player.playerId"
                                            @click="selectOpponent(player)">
                                            {{ player.name ?? player.playerName }}
                                        </li>
                                    </ul>

                                </template>

                                <!-- ZOZNAM TÍMOV -->
                                <template v-else>

                                    <div v-if="search.trim() && !filteredTeams.length" class="empty-message">
                                        Žiadny tím sa nenašiel.
                                    </div>

                                    <ul v-if="filteredTeams.length" class="player-list">
                                        <li v-for="team in filteredTeams" :key="team.id" @click="selectOpponent(team)">
                                            {{ team.name }}
                                        </li>
                                    </ul>

                                </template>

                            </div>

                            <!-- VYBRANÝ SÚPER -->
                            <div v-else class="opponent-name">

                                <h3>
                                    {{ selectedOpponent.name ?? selectedOpponent.playerName }}
                                </h3>

                                <AppButton class="change-button" :label="selectedMatchType === 'SINGLES'
                                    ? 'Zmeniť hráča'
                                    : 'Zmeniť tím'" type="edit" @clicked="clearOpponent" />

                            </div>

                        </div>

                    </div>

                    <div v-else class="empty-message">
                        Aby si mohol vytvoriť zápas, musíš byť prihlásený
                        a mať priradeného hráča.
                    </div>

                    <p v-if="error" class="error-message">
                        {{ error }}
                    </p>

                    <AppButton v-if="hasPlayer" class="create-match-button" label="Vytvoriť zápas" type="create"
                        @clicked="createMatch" />

                </div>

                <!-- ROZHODNUTIE O ZADANÍ VÝSLEDKU -->
                <div v-else-if="createdMatch && !showResultForm" class="match-created">

                    <h3>Zápas bol úspešne vytvorený!</h3>

                    <p>Chceš teraz zadať výsledok zápasu?</p>

                    <div class="result-choice-buttons">

                        <AppButton label="Áno, zadať výsledok" type="create" @clicked="showResultForm = true" />

                        <AppButton label="Nie, neskôr" type="default" @clicked="skipResult" />

                    </div>

                </div>

                <!-- ZADANIE VÝSLEDKU -->
                <div v-else-if="createdMatch && showResultForm">

                    <h3>Zadanie výsledku</h3>

                    <AddMatchResult :key="createdMatch.id" :match="createdMatch" :leagueType="selectedMatchType"
                        @result-submitted="onResultSubmitted" />

                </div>

            </div>
        </div>

    </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import { useFlashMessageStore } from '@/stores/flashMessage';
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';

export default {
    name: 'NewMatch',

    data() {
        return {
            header: useHeaderStore(),
            userStore: useUserStore(),

            players: [],
            teams: [],
            myTeams: [],

            search: '',

            selectedOpponent: null,
            selectedMyTeam: null,

            selectedMatchType: 'SINGLES',

            createdMatch: null,
            showResultForm: false,

            loading: false,
            error: null
        };
    },

    async created() {
        this.header.setTitle('Nový priateľský zápas');

        if (this.userStore.token && !this.userStore.user) {
            await this.userStore.fetchCurrentUser();
        }

        if (this.hasPlayer) {
            await this.loadPlayers();
            await this.loadMyTeams();
        }
    },

    methods: {

        // NAČÍTANIE HRÁČOV
        async loadPlayers() {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.get('/players/');
                this.players = response.data;
            } catch (err) {
                this.error = 'Nepodarilo sa načítať hráčov.';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        // NAČÍTANIE VLASTNÝCH TÍMOV
        async loadMyTeams() {
            try {
                const playerId = this.userStore.user?.playerId;

                if (!playerId) {
                    this.myTeams = [];
                    return;
                }

                const response = await api.get(
                    `/teams/by-player/${playerId}`
                );

                this.myTeams = response.data;

            } catch (err) {
                console.error('Nepodarilo sa načítať moje tímy.', err);
                this.error = 'Nepodarilo sa načítať tvoje tímy.';
            }
        },

        // NAČÍTANIE VŠETKÝCH TÍMOV
        async loadTeams() {
            this.loading = true;
            this.error = null;

            try {
                // Prispôsob URL svojmu TeamControlleru.
                const response = await api.get('/teams/');

                this.teams = response.data;

            } catch (err) {
                this.error = 'Nepodarilo sa načítať tímy.';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        // PREPÍNANIE DVOJHRA / ŠTVORHRA
        async changeMatchType(matchType) {

            if (this.selectedMatchType === matchType) {
                return;
            }

            this.selectedMatchType = matchType;

            this.selectedOpponent = null;
            this.selectedMyTeam = null;
            this.search = '';
            this.error = null;

            if (matchType === 'SINGLES') {
                if (!this.players.length) {
                    await this.loadPlayers();
                }
            } else {
                await this.loadMyTeams();
                await this.loadTeams();
            }
        },

        selectOpponent(opponent) {
            this.selectedOpponent = opponent;
            this.search = '';
        },

        clearOpponent() {
            this.selectedOpponent = null;
            this.search = '';
        },

        // VYTVORENIE ZÁPASU
        async createMatch() {
            this.error = null;

            if (!this.selectedOpponent) {
                this.flash.showMessage('Vyber si súpera.', 'warning');
                return;
            }

            let matchData;

            if (this.selectedMatchType === 'SINGLES') {

                matchData = {
                    matchType: 'SINGLES',
                    leagueId: null,
                    player1Id: this.userStore.user.playerId,
                    player2Id: this.selectedOpponent.id ?? this.selectedOpponent.playerId
                };

            } else {

                if (!this.selectedMyTeam) {
                    this.flash.showMessage('Vyber svoj tím.', 'warning');
                    return;
                }

                matchData = {
                    matchType: 'DOUBLES',
                    leagueId: null,
                    team1Id: this.selectedMyTeam.id,
                    team2Id: this.selectedOpponent.id
                };
            }

            try {
                const response = await api.post(
                    '/matches/create',
                    matchData
                );

                this.createdMatch = response.data;
                this.showResultForm = false;

                this.flash.showMessage(
                    'Zápas bol úspešne vytvorený.',
                    'success'
                );

                console.log('Vytvorený zápas:', response.data);

            } catch (err) {
                this.error = err.response?.data?.message
                    || 'Nepodarilo sa vytvoriť zápas.';

                console.error(err);
            }
        },
        skipResult() {
            this.showResultForm = false;
            this.createdMatch = null;

            this.selectedOpponent = null;
            this.selectedMyTeam = null;
            this.search = '';

            this.$router.push('/tennis/friendly-matches');
        },

        // PO ÚSPEŠNOM ZADANÍ VÝSLEDKU
        onResultSubmitted() {
            this.showResultForm = false;
            this.createdMatch = null;
            this.selectedOpponent = null;
            this.selectedMyTeam = null;
            this.search = '';

            this.$router.push('/tennis/friendly-matches');
        }
    },

    computed: {

        hasPlayer() {
            return !!this.userStore.user?.playerId;
        },

        flash() {
            return useFlashMessageStore();
        },

        // VYHĽADÁVANIE HRÁČOV
        filteredPlayers() {
            const query = this.search.trim().toLowerCase();

            if (!query) {
                return [];
            }

            return this.players.filter(player => {

                const playerId = player.id ?? player.playerId;
                const playerName = player.name ?? player.playerName ?? '';

                // Vylúčime vlastného hráča.
                if (
                    String(playerId) ===
                    String(this.userStore.user?.playerId)
                ) {
                    return false;
                }

                return playerName.toLowerCase().includes(query);

            }).slice(0, 10);
        },

        // VYHĽADÁVANIE SÚPEROVÝCH TÍMOV
        filteredTeams() {
            const query = this.search.trim().toLowerCase();

            if (!query) {
                return [];
            }

            const myTeamIds = this.myTeams.map(team =>
                String(team.id)
            );

            return this.teams.filter(team => {

                // Vylúčime vlastné tímy.
                if (myTeamIds.includes(String(team.id))) {
                    return false;
                }

                const teamName = team.name ?? '';

                return teamName.toLowerCase().includes(query);

            }).slice(0, 10);
        }
    },

    components: {
        AppButton,
        AddMatchResult
    }
};
</script>

<style scoped>
.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
}

.create-match {
    display: flex;
    width: 100%;
    flex-direction: column;
    /* justify-content: space-between; */
}

.matchType-switch {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: flex-end;
    width: 100%;
    margin-top: 8px;
}

.switch-buttons {
    grid-column: 2;
    display: flex;
    gap: 5px;
    padding: 4px;
    background: #1e2026;
    border: 1px solid rgba(220, 190, 170, 0.2);
    border-radius: 12px;
}

.matchType-switch button {
    border-radius: 9px;
    background: transparent;
    color: #a0a5af;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease,
        color 0.2s ease;
}

.matchType-switch button:hover {
    color: #ffffff;
    background: #292c34;
}

.matchType-switch button.active {
    background: #d6b58c;
    color: #1e2026;
}

.vs {
    color: #ffd700;
}

.my-team-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.my-team-name {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.opponent-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.opponent-search {
    width: 100%;
    max-width: 250px;
    text-align: center;
    margin: 5px 0;
}

.player-list {
    width: 250px;
    max-width: 100%;
    padding: 0;
    margin-top: 10px;
    list-style: none;
    text-align: center;
}

.opponent-name {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.change-button {
    width: 250px;
}

.empty-message {
    text-align: center;
    color: #ffffff;
    padding: 10px 0;
}

.right-side input {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 15px;
}

.player-list {
    max-height: 250px;
    overflow-y: auto;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.player-list li {
    padding: 12px;
    cursor: pointer;
}

.player-list li:hover {
    background: #eee;
    color: #000000;
}

.error-message {
    color: #c62828;
    margin-top: 12px;
}

.create-match-button {
    height: 2rem;
    margin: 20px;
}

.match-created {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
    padding: 25px 10px;
}

.match-created h3 {
    color: #d6b58c;
}

.match-created p {
    color: white;
}

.result-choice-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
}

@media (max-width: 600px) {
    .main-layout {
        flex-direction: column;
    }

    .list-or-nothing {
        padding: 2px;
    }

    .me h3 {
        font-size: 1.5rem;
    }

    .vs {
        font-size: 1.2rem;
    }

    .opponent h3 {
        font-size: 1.5rem;
    }

    .right-side input {
        padding: 10px;
    }
}
</style>