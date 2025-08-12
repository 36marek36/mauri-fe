<template>
    <AppHeader :title="league.name" :subtitle="league.leagueType" />

    <FlashMessage />

    <div class="admin-buttons">
        <!-- 🟢 Štart ligy -->
        <AppButton v-if="isAdmin && hasParticipants && leagueStatus === 'CREATED'" label="Odštartovať ligu" icon="🏁"
            type="create" htmlType="button" @clicked="generateMatches" />

        <!-- 🔴 Ukončenie ligy -->
        <AppButton v-if="isAdmin && leagueStatus === 'ACTIVE'" label="Ukončiť ligu" icon="🛑" type="delete"
            htmlType="button" @clicked="finishLeague" />

        <!--    Pridávanie účastníkov -->
        <AppButton v-if="isAdmin && leagueStatus === 'CREATED'"
            :label="showAddParticipants ? 'Skryť formulár' : isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
            icon="➕" type="create" htmlType="button" @clicked="showAddParticipants = !showAddParticipants" />
        <AddParticipantsForm v-if="isAdmin" :show="showAddParticipants" :items="isSingles ? freePlayers : freeTeams"
            :formatName="isSingles ? fullName : formatTeamName"
            :title="isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
            :submitLabel="isSingles ? 'Pridať hráčov' : 'Pridať tímy'" @submit="handleAddParticipants" />
    </div>

    <div class="league-detail-container">

        <div v-if="loading">Načítavam...</div>

        <!-- 🧱 Hlavné rozloženie -->
        <main v-else class="main-flex-layout">

            <!-- 🎽 Účastníci -->
            <aside class="participants">
                <ParticipantList v-if="hasParticipants" :title="isSingles ? 'Hráči v lige' : 'Tímy v lige'"
                    :participants="isSingles ? league.players : league.teams"
                    :formatName="isSingles ? fullName : formatTeamName"
                    :remove="isAdmin ? (id => confirmDeleteParticipant(isSingles ? 'players' : 'teams', id)) : null"
                    @view-detail="(participantId) => isSingles ? goToDetail('players', participantId) : goToDetail('teams', participantId)" />
                <!-- <h3 v-else>{{ noParticipantsMessage }}</h3> -->
            </aside>

            <!-- 🏓 Zápasy -->
            <section class="matches">
                <h3 v-if="hasMatches">Zápasy ligy</h3>

                <div v-if="hasMatches">
                    <AppButton :label="areAnyRoundsOpened ? 'Skryť všetky kolá' : 'Zobraziť všetky kolá'"
                        :icon="areAnyRoundsOpened ? '🔼' : '🔽'" type="default" htmlType="button"
                        @clicked="toggleAllRounds" />

                    <div v-for="(roundMatches, roundNumber) in groupedMatches" :key="roundNumber">
                        <h4 @click="toggleRound(roundNumber)" style="cursor: pointer">
                            Kolo: {{ roundNumber }}
                            <span v-if="openedRounds.includes(roundNumber)">▲</span>
                            <span v-else>▼</span>
                        </h4>

                        <ul v-show="openedRounds.includes(roundNumber)">
                            <li v-for="match in roundMatches" :key="match.id" class="match-item">
                                <div>
                                    <span>
                                        {{ isSingles
                                            ? `${fullName(match.homePlayer)} vs ${fullName(match.awayPlayer)}`
                                            : `${formatTeamName(match.homeTeam)} vs ${formatTeamName(match.awayTeam)}` }}
                                    </span>

                                    <!-- Pridanie výsledku (admin alebo hráč) -->
                                    <div
                                        v-if="(isAdmin || isUserPlayerInMatch(match)) && match.status === 'CREATED' && leagueStatus === 'ACTIVE'">
                                        <AppButton
                                            :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                                            :type="activeMatchId === match.id ? 'delete' : 'default'" htmlType="button"
                                            icon="📝" @clicked="toggleForm(match.id)" />
                                        <AddMatchResult v-if="activeMatchId === match.id" :match="match"
                                            :leagueType="league.leagueType" @result-submitted="fetchMatchesAndClose" />
                                    </div>

                                    <!-- Výsledok zápasu -->
                                    <div v-else-if="match.status === 'FINISHED'">
                                        <strong>Výsledok:</strong>
                                        {{ match.result?.score1 }} : {{ match.result?.score2 }}
                                        <span v-if="match.result?.setScores?.length">
                                            (
                                            <span v-for="(set, index) in match.result.setScores" :key="index">
                                                {{ set.score1 }}:{{ set.score2 }}
                                                <span v-if="index < match.result.setScores.length - 1">, </span>
                                            </span>
                                            )
                                        </span>
                                        <!-- 🔧 Admin môže upraviť výsledok -->
                                        <div v-if="isAdmin && leagueStatus === 'ACTIVE'">
                                            <AppButton
                                                :label="activeMatchId === match.id ? 'Zavrieť úpravu' : 'Upraviť výsledok'"
                                                :type="activeMatchId === match.id ? 'delete' : 'default'"
                                                htmlType="button" icon="✏️" @clicked="toggleForm(match.id)" />
                                            <AddMatchResult v-if="activeMatchId === match.id" :match="match"
                                                :leagueType="league.leagueType"
                                                @result-submitted="fetchMatchesAndClose" />
                                        </div>
                                        <!-- Tlačidlo pre admina na zrušenie výsledku -->
                                        <AppButton v-if="isAdmin && leagueStatus === 'ACTIVE'" label="Zrušiť výsledok"
                                            icon="❌" type="delete" htmlType="button"
                                            @clicked="cancelMatchResult(match.id)"
                                            :disabled="activeMatchId === match.id" />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <h3 v-else>Žiadne zápasy pre túto ligu.</h3>
            </section>

            <!-- 📊 Tabuľka -->
            <aside class="standings">
                <h3 v-if="hasParticipants">Tabuľka</h3>

                <div class="table-scroll">
                    <table class="standings-table" v-if="hasParticipants">
                        <thead>
                            <tr>
                                <th>Poradie</th>
                                <th>{{ isSingles ? 'Hráč' : 'Tím' }}</th>
                                <th>Zápasy</th>
                                <th>Výhry</th>
                                <th>Prehry</th>
                                <th>Prehraté sety</th>
                                <th>Vyhraté sety</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(entry, index) in standings" :key="entry.id">
                                <td>{{ index + 1 }}.</td>
                                <td>{{ isSingles ? entry.playerName : entry.teamName }}</td>
                                <td>{{ entry.matches }}</td>
                                <td>{{ entry.wins }}</td>
                                <td>{{ entry.losses }}</td>
                                <td>{{ entry.setsLost }}</td>
                                <td>{{ entry.setsWon }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 v-else>{{ noParticipantsMessage }}</h3>
                </div>
            </aside>
        </main>
    </div>
    <AppModal :visible="showDeleteModal"
        :message="`Naozaj chcete odstrániť ${participant?.type === 'players' ? 'hráča' : 'tím'} ${participant?.name} z ligy?`"
        @confirm="() => removeParticipantFromLeague(participant?.id)" @cancel="cancelDelete" />
</template>


<script>
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';
import axios from 'axios';
import ParticipantList from '@/components/ParticipantList.vue';
import AddParticipantsForm from '@/components/AddParticipantsForm.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import FlashMessage from '@/components/FlashMessage.vue';


export default {
    name: 'LeagueDetail',
    data() {
        return {
            league: {},
            freePlayers: [],
            freeTeams: [],
            groupedMatches: {},
            standings: [],
            selectedParticipants: [],
            activeMatchId: null,
            openedRounds: [],
            loading: true,
            showAddParticipants: false,
            showDeleteModal: false,
            participant: null,

        }
    },
    created() {
        this.loadInitialData()
    },
    methods: {
        async loadInitialData() {
            this.loading = true;
            try {
                await this.fetchLeague();
                await this.fetchFreeParticipants();
                await this.fetchMatches();
                await this.fetchStats();
            } catch (error) {
                console.error('Chyba pri načítaní údajov:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchLeague() {
            const res = await axios.get('/api/rest/leagues/' + this.leagueId);
            this.league = res.data;
        },
        async fetchFreeParticipants() {
            if (!this.isAdmin) {
                // Nepokúšaj sa volať chránené endpointy, vyčisti zoznamy
                this.freePlayers = [];
                this.freeTeams = [];
                return;
            }

            try {
                const [playersRes, teamsRes] = await Promise.all([
                    axios.get('/api/rest/players/not-in-any-active-league'),
                    axios.get('/api/rest/teams/not-in-any-active-league')
                ]);

                this.freePlayers = playersRes.data;
                this.freeTeams = teamsRes.data;
            } catch (error) {
                console.error('Chyba pri načítaní voľných účastníkov:', error);
                this.freePlayers = [];
                this.freeTeams = [];
            }
        },
        async addSelectedParticipantsToLeague() {
            const leagueId = this.leagueId;
            const payload = {
                participantIds: this.selectedParticipants
            };

            try {
                await axios.patch(`/api/rest/leagues/${leagueId}/addParticipants`, payload);
                await this.loadInitialData();
                this.flash.showMessage('✅ Účastníci boli úspešne pridaní do ligy!', 'success');
                this.selectedParticipants = [];
            } catch (err) {
                this.flash.showMessage('Chyba pri hromadnom pridávaní', 'error');
                console.error('Chyba pri hromadnom pridávaní:', err);
            }
        },
        async removeParticipantFromLeague(id) {
            try {
                let participant = null;

                if (this.league.leagueType === 'SINGLES') {
                    participant = this.league.players.find(p => p.id === id);
                } else if (this.league.leagueType === 'DOUBLES') {
                    participant = this.league.teams.find(t => t.id === id);
                }

                if (!participant) {
                    this.flash.showMessage('Účastník nebol nájdený.', 'warning');
                    return;
                }

                await axios.delete(`/api/rest/leagues/${this.league.id}/participants/${id}`);

                if (this.league.leagueType === 'SINGLES') {
                    this.flash.showMessage('Hráč ' + this.fullName(participant) + ' bol úspešne odstránený z ligy.', 'info');
                } else if (this.league.leagueType === 'DOUBLES') {
                    this.flash.showMessage('Tím ' + this.formatTeamName(participant) + ' bol úspešne odstránený z ligy.', 'info');
                }

                await this.loadInitialData();  // aby sa aktualizovali dáta ligy

            } catch (err) {
                console.error('Chyba pri mazaní participanta z ligy:', err);
                this.flash.showMessage('Nepodarilo sa odstrániť účastníka z ligy.', 'error');
            } finally {
                this.cancelDelete();
            }
        },
        goToDetail(type, id) {
            if (!this.isLoggedIn) {
                this.flash.showMessage('Musíte sa prihlásiť', 'warning');
                return;
            }
            this.$router.push(`/${type}/${id}`);
        },
        async fetchMatches() {
            const leagueId = this.leagueId
            try {
                const res = await axios.get('/api/rest/matches/' + leagueId + '/grouped-by-round');
                this.groupedMatches = res.data;
                console.log('Zapasy v lige boli nacitane:', this.groupedMatches);
            } catch (err) {
                console.error('Chyba pri nacitavani zapasov', err);
            }
        },
        async generateMatches() {
            this.loading = true;

            try {
                const leagueId = this.leagueId;

                // Vygenerovanie zápasov
                await axios.patch(`/api/rest/matches/${leagueId}/generate-matches`);
                this.flash.showMessage('✅ Zápasy boli úspešne vygenerované', 'info');

                await this.loadInitialData();

            } catch (err) {
                if (err.response && err.response.status === 409) {
                    this.flash.showMessage(`⚠️ ${err.response.data}`, 'warning');
                } else {
                    this.flash.showMessage('❌ Nastala chyba pri generovaní zápasov.', 'error');
                    console.error('Chyba pri generovaní zápasov:', err);
                }
            } finally {
                this.loading = false;
            }
        },
        confirmDeleteParticipant(type, id) {
            let name = '';

            if (type === 'players') {
                const player = this.league.players.find(p => p.id === id);
                name = player ? this.fullName(player) : '';
            } else if (type === 'teams') {
                const team = this.league.teams.find(t => t.id === id);
                name = team ? this.formatTeamName(team) : '';
            }

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.participant = null;
            this.showDeleteModal = false;
        },
        fullName(player) {
            if (!player) return 'Neznámy';
            return `${player.firstName || ''} ${player.lastName || ''}`.trim();
        },
        formatTeamName(team) {
            if (!team || !team.player1 || !team.player2) return '';
            return `${this.fullName(team.player1)} a ${this.fullName(team.player2)}`;
        },
        async handleAddParticipants(selectedIds) {
            this.loading = true;
            try {
                this.selectedParticipants = selectedIds;
                await this.addSelectedParticipantsToLeague();
                this.showAddParticipants = false;
            } catch (error) {
                console.error('Nepodarilo sa pridať účastníkov:', error);
            } finally {
                this.loading = false;
            }
        },
        toggleForm(matchId) {
            this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
        },
        toggleRound(roundNumber) {
            const index = this.openedRounds.indexOf(roundNumber);
            if (index === -1) {
                this.openedRounds.push(roundNumber);
            } else {
                this.openedRounds.splice(index, 1);
            }
        },
        toggleAllRounds() {
            if (this.openedRounds.length > 0) {
                // aspoň jedno kolo otvorené → skryť všetky
                this.openedRounds = [];
            } else {
                // žiadne otvorené → otvoriť všetky
                this.openedRounds = [...this.allRoundNumbers];
            }
        },
        async fetchMatchesAndClose() {
            await this.fetchMatches();
            await this.fetchStats()
            this.activeMatchId = null;
            this.flash.showMessage('✅ Výsledok bol úspešne uložený!', 'success');
        },
        async fetchStats() {
            const leagueId = this.leagueId
            try {
                const url = this.league.leagueType === 'DOUBLES'
                    ? '/api/rest/leagues/' + leagueId + '/teams/stats'
                    : '/api/rest/leagues/' + leagueId + '/players/stats'

                const res = await axios.get(url);
                this.standings = res.data;
                console.log('Štatistiky načítané:', this.standings);
            } catch (err) {
                console.error('Chyba pri načítavaní štatistík', err);
            }
        },
        async finishLeague() {
            this.loading = true;

            try {
                const leagueId = this.leagueId;

                // Ukončenie ligy
                await axios.patch(`/api/rest/leagues/${leagueId}/finish`);
                this.flash.showMessage('✅ Liga bola úspešne ukončená', 'info');

                await this.loadInitialData();

            } catch (err) {
                if (err.response && err.response.status === 409) {
                    // Konflikt
                    this.flash.showMessage(`⚠️ ${err.response.data}`, 'warning');
                } else {
                    // Neznáma chyba
                    this.flash.showMessage('❌ Nastala chyba pri ukončovaní ligy.', 'error');
                    console.error('Chyba pri ukončení ligy:', err);
                }
            } finally {
                this.loading = false;
            }
        },
        isUserPlayerInMatch(match) {
            const playerId = this.userStore.playerId;

            if (this.isSingles) {
                return match.homePlayer?.id === playerId || match.awayPlayer?.id === playerId;
            }

            if (this.isDoubles) {
                return (
                    match.homeTeam?.player1?.id === playerId ||
                    match.homeTeam?.player2?.id === playerId ||
                    match.awayTeam?.player1?.id === playerId ||
                    match.awayTeam?.player2?.id === playerId
                );
            }

            return false;
        },
        async cancelMatchResult(matchId) {
            this.loading = true;
            try {
                await axios.patch(`/api/rest/matches/${matchId}/cancel-result`);
                this.flash.showMessage('✅ Výsledok zápasu bol zrušený', 'warning');
                await this.loadInitialData();
            } catch (error) {
                console.error('Chyba pri rušení výsledku:', error);
                this.flash.showMessage('❌ Nepodarilo sa zrušiť výsledok.', 'error');
            } finally {
                this.loading = false;
            }
        },
    },
    computed: {
        leagueId() {
            return this.$route.params.id;
        },
        isSingles() {
            return this.league.leagueType === 'SINGLES';
        },
        isDoubles() {
            return this.league.leagueType === 'DOUBLES';
        },
        hasMatches() {
            return Object.keys(this.groupedMatches).length > 0;
        },
        hasParticipants() {
            return this.isSingles
                ? this.league.players?.length > 0
                : this.league.teams?.length > 0;
        },
        noParticipantsMessage() {
            return this.isSingles
                ? 'Liga nemá žiadnych hráčov.'
                : 'Liga nemá žiadne tímy.';
        },
        allRoundNumbers() {
            return Object.keys(this.groupedMatches);
        },
        areAnyRoundsOpened() {
            return this.openedRounds.length > 0;
        },
        leagueStatus() {
            return this.league.status;
        },
        userStore() {
            return useUserStore();
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin;
        },
        isLoggedIn() {
            return this.userStore.isLoggedIn
        }
    },
    components: { AppButton, AddMatchResult, ParticipantList, AddParticipantsForm, AppHeader, AppModal, FlashMessage }
}

</script>

<style scoped>
/* 🎾 Obal celej ligy */
.league-detail-container {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
}

/* 📦 Layout kontajner */
.main-flex-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    flex-wrap: wrap;
}

/* 🧍‍♂️ Účastníci */
.participants {
    flex: 1 1 220px;
    padding: 1rem;
}

/* 🎾 Zápasy */
.matches {
    flex: 2 1 350px;
    padding: 1rem;
}

.match-item {
    list-style: none;
    padding: 12px 0;
    border-bottom: 1px solid #ddd;
}

.match-item:last-child {
    border-bottom: none;
}

/* 📊 Tabuľka */
.standings {
    flex: 0 1 300px;
    padding: 1rem;
}

.table-scroll {
    overflow-x: auto;
    width: 100%;
}

.standings-table th,
.standings-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    text-shadow: 0 0 1px brown, 0 0 2px brown
}

.standings-table th {
    text-transform: uppercase;
    font-size: 0.85rem;
    color: whitesmoke;
}

.admin-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

/* .start-finishLeague-button {
    display: flex;
    justify-content: center;
} */

/* 📱 Mobilné zobrazenie */
@media (max-width: 768px) {
    .main-flex-layout {
        flex-direction: column;
    }

    .participants,
    .matches,
    .standings {
        width: 100%;
        min-width: unset;
    }

    /* Voliteľne uprav poradie */
    .standings {
        order: 1;
    }

    .matches {
        flex: 1 1 auto;
        order: 2;
    }

    .participants {
        order: 3;
    }

    .standings-table th,
    .standings-table td {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }

    /* Minimalna sirka tabuľky na mobil aby nebola natiahnuta */
    .standings-table {
        min-width: 100%;
    }
}
</style>