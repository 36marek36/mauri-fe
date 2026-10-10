<template>
    <div class="league-detail-container">

        <div v-if="loading" class="loading-state">
            Načítavam...
        </div>

        <main v-else class="main-layout">
            <div class="left-side">
            </div>

            <div class="right-side">
                <!-- ========================= -->
                <!-- HLAVIČKA LIGY              -->
                <!-- ========================= -->
                <section class="league-header">

                    <div class="league-header-top">
                        <div class="league-title">

                            <div class="league-title-icon">
                                <img src="/images/logo-mauri.png" alt="logo mauri">
                            </div>

                            <div class="league-title-text">
                                <h1>{{ league.leagueName }}</h1>
                                <p>Tenisová sezóna {{ league.seasonYear }}</p>
                            </div>

                        </div>


                        <div class="league-status" :class="{
                            'status-created': isLeagueCreated,
                            'status-active': isLeagueActive,
                            'status-finished': isLeagueFinished
                        }">

                            <span v-if="isLeagueCreated">⚪ VYTVORENÁ</span>
                            <span v-else-if="isLeagueActive">🟢 AKTÍVNA</span>
                            <span v-else-if="isLeagueFinished">🏁 UKONČENÁ</span>
                            <span v-else>{{ leagueStatus }}</span>

                        </div>

                    </div>


                    <!-- INFO -->
                    <div class="league-info">

                        <div class="league-info-item">
                            <span>🎾</span>
                            <div>
                                <small>Typ ligy</small>
                                <strong>
                                    {{ leagueTypeLabel }}
                                </strong>
                            </div>
                        </div>


                        <div class="league-info-item">

                            <span>👥</span>
                            <div>
                                <small>Účastníci</small>
                                <strong>
                                    {{ inflection(league.leagueType === 'SINGLES' ? 'player' : 'team',
                                        getParticipantCount(league)) }}
                                </strong>
                            </div>
                        </div>


                        <div class="league-info-item">

                            <span>🎾</span>
                            <div>
                                <small>Zápasy</small>
                                <strong>
                                    {{ completedMatches }} / {{ totalMatches }}
                                </strong>
                            </div>
                        </div>


                        <div v-if="isLeagueFinished" class="league-info-item winner-info">

                            <span>🥇</span>
                            <div>
                                <small>Víťaz</small>
                                <strong>
                                    {{ league.winner }}
                                </strong>
                            </div>
                        </div>

                    </div>


                    <!-- PROGRESS LIGY -->
                    <div v-if="isLeagueActive" class="league-progress">

                        <div class="progress-header">
                            <span>Priebeh ligy</span>
                            <strong>
                                {{ league.leagueProgress }} %
                            </strong>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: `${league.leagueProgress}%` }"></div>
                        </div>

                    </div>

                    <!-- ADMIN BUTTONS -->
                    <div v-if="isAdmin" class="admin-buttons">

                        <AppButton v-if="hasParticipants && isLeagueCreated" label="Odštartovať ligu" icon="🏁"
                            type="create" htmlType="button" @clicked="openGenerateModal" />

                        <AppButton v-if="isLeagueActive" label="Ukončiť ligu" icon="🛑" type="delete" htmlType="button"
                            @clicked="openFinishModal" />

                        <AppButton v-if="isLeagueCreated"
                            :label="showAddParticipants ? 'Skryť formulár' : isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
                            icon="➕" type="default" htmlType="button"
                            @clicked="showAddParticipants = !showAddParticipants" />

                    </div>

                    <AddParticipantsForm v-if="isAdmin" :show="showAddParticipants"
                        :items="isSingles ? freePlayers : freeTeams" :title="isSingles
                            ? 'Pridať hráčov do ligy'
                            : 'Pridať tímy do ligy'
                            " :submitLabel="isSingles
                                ? 'Pridať hráčov'
                                : 'Pridať tímy'
                                " @submit="handleAddParticipants" />
                </section>

                <!-- ========================= -->
                <!-- TABUĽKA + ZÁPASY            -->
                <!-- ========================= -->
                <div class="main-flex-layout">

                    <!-- TABUĽKA -->
                    <section class="standings">

                        <div class="list-or-nothing" v-if="hasParticipants">

                            <div class="section-heading">
                                <div>
                                    <span class="section-icon">🏆</span>
                                    <div>
                                        <h2>Tabuľka</h2>
                                    </div>
                                </div>

                            </div>


                            <div class="standings-table-wrapper">

                                <table class="standings-table">

                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{{ isSingles ? 'Hráč' : 'Tím' }}</th>
                                            <th>Z</th>
                                            <th>V</th>
                                            <th>P</th>
                                            <th>Sety</th>
                                            <th>B</th>
                                            <th v-if="isLeagueActive">Progres</th>
                                        </tr>
                                    </thead>


                                    <tbody>
                                        <template v-for="entry in standings"
                                            :key="isSingles ? entry.playerId : entry.teamId">

                                            <!-- HLAVNÝ RIADOK -->
                                            <tr @click="toggleRow(isSingles ? entry.playerId : entry.teamId)"
                                                :class="{ dropped: entry.droppedFromLeague, expanded: expandedRow === (isSingles ? entry.playerId : entry.teamId) }"
                                                class="main-row">

                                                <td class="rank">
                                                    <template v-if="!entry.droppedFromLeague">
                                                        <span v-if="entry.rank === 1">🥇</span>
                                                        <span v-else-if="entry.rank === 2">🥈</span>
                                                        <span v-else-if="entry.rank === 3">🥉</span>
                                                        <span v-else>{{ entry.rank }}.</span>
                                                    </template>
                                                </td>

                                                <td class="participant-name">
                                                    {{ isSingles ? entry.playerName : entry.teamName }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague">
                                                    {{ entry.matches }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague" class="wins">
                                                    {{ entry.wins }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague" class="losses">
                                                    {{ entry.losses }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague">
                                                    {{ entry.setsWon }} :
                                                    {{ entry.setsLost }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague" class="points">
                                                    {{ entry.points }}
                                                </td>

                                                <td v-if="!entry.droppedFromLeague && isLeagueActive">
                                                    <CircularProgress :progress="entry.leagueProgress" />
                                                </td>

                                                <td v-if="entry.droppedFromLeague" colspan="100%">
                                                    <span class="dropped-text">
                                                        Zranený
                                                    </span>
                                                </td>

                                            </tr>


                                            <!-- DETAIL HRÁČA -->
                                            <tr v-if="expandedRow === (isSingles ? entry.playerId : entry.teamId)"
                                                class="detail-row">

                                                <td colspan="100%">
                                                    <div class="detail-stats">

                                                        <small>Odohraté zápasy</small>
                                                        <strong>{{ entry.matches }}</strong>

                                                        <small>Výhry - Prehry</small>
                                                        <strong>{{ entry.wins }} - {{ entry.losses }}</strong>

                                                        <small>Sety</small>
                                                        <strong>{{ entry.setsWon }} : {{ entry.setsLost }}</strong>

                                                    </div>


                                                    <div v-if="isAdmin" class="detail-actions">

                                                        <AppButton label="Odhlásiť z ligy" type="edit" htmlType="button"
                                                            @clicked.stop="confirmDropParticipant(isSingles ? 'players' : 'teams', isSingles ? entry.playerId : entry.teamId)" />

                                                        <AppButton label="Odstrániť z ligy" type="delete"
                                                            htmlType="button"
                                                            @clicked.stop="confirmDeleteParticipant(isSingles ? 'players' : 'teams', isSingles ? entry.playerId : entry.teamId)" />
                                                    </div>

                                                    <div class="detail-button">

                                                        <AppButton :label="isSingles ? 'Detail hráča' : 'Detail tímu'"
                                                            type="default" htmlType="button"
                                                            @clicked.stop="goToDetail(isSingles ? 'players' : 'teams', isSingles ? entry.playerId : entry.teamId)" />

                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>


                    <!-- ZÁPASY -->
                    <section class="matches">

                        <div class="list-or-nothing" v-if="hasMatches">

                            <div class="section-heading">

                                <div>
                                    <span class="section-icon">🎾</span>
                                    <h2>Zápasy</h2>
                                </div>

                                <div>
                                    <div class="matches-stats">
                                        <small>{{ playedMatches }} odohratých</small>,
                                        <small>{{ scratchedMatches }} kontumovaných</small>,
                                        <small>{{ cancelledMatches }} zrušených</small> zápasov
                                    </div>
                                </div>

                            </div>

                            <div class="matches-wrapper">

                                <AppButton :label="areAnyRoundsOpened ? 'Skryť všetky kolá' : 'Zobraziť všetky kolá'"
                                    :icon="areAnyRoundsOpened ? '🔼' : '🔽'" type="default" htmlType="button"
                                    @clicked="toggleAllRounds" />

                                <div v-for="(roundMatches, roundNumber) in groupedMatches" :key="roundNumber"
                                    class="round">

                                    <div @click="toggleRound(roundNumber)" class="round-title">

                                        <div>
                                            <strong>
                                                Kolo {{ roundNumber }}
                                            </strong>

                                            <span>
                                                {{ getPlayedMatchesInRound(roundMatches) }}
                                                / {{ roundMatches.length }}
                                            </span>
                                        </div>

                                        <span>
                                            {{ openedRounds.includes(roundNumber) ? '▲' : '▼' }}
                                        </span>

                                    </div>

                                    <ul v-show="openedRounds.includes(roundNumber)" class="match-list">

                                        <MatchItem v-for="match in roundMatches" :key="match.id" :match="match"
                                            :isSingles="isSingles" :leagueType="league.leagueType"
                                            :leagueStatus="league.leagueStatus" :isAdmin="isAdmin"
                                            :activeMatchId="activeMatchId" :getMatchClass="getMatchClass"
                                            :isUserPlayerInMatch="isUserPlayerInMatch
                                                " @toggle-form="toggleForm" @edit="requestEditResult"
                                            @cancel="requestCancelResult" @refresh="fetchMatchesAndClose" />

                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div v-else class="empty-state">
                            🎾 Žiadne zápasy pre túto ligu.
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>


    <!-- ========================= -->
    <!-- MODALY                     -->
    <!-- ========================= -->

    <AppModal :visible="showDeleteModal" :title="'Odstránenie z ligy'"
        :message="`Naozaj chcete odstrániť ${participant?.type === 'players' ? 'hráča' : 'tím'} ${participant?.name} z ligy?`"
        @confirm="() => removeParticipantFromLeague(participant?.id)" @cancel="cancelDelete" />

    <AppModal :visible="showDropModal" :title="'Odhlásenie z ligy'"
        :message="`Naozaj chcete odhlásiť ${participant?.type === 'players' ? 'hráča' : 'tím'} ${participant?.name} z ligy? Všetky zapasy ${participant?.type === 'players' ? 'hráča' : 'tímu'} budú zrušené. Táto akcia sa nebude dať vrátiť.`"
        @confirm="() => dropParticipantFromLeague(participant?.id)" @cancel="cancelDrop" />

    <AppModal :visible="showConfirmModal" :title="confirmationAction === 'generate'
        ? 'Spustenie ligy'
        : 'Ukončenie ligy'" :message="modalMessage" @confirm="onModalConfirm" @cancel="onModalCancel" />

    <AppModal :visible="showActionModal" :title="actionType === 'edit'
        ? 'Úprava výsledku'
        : 'Zrušenie výsledku'" :message="actionType === 'edit'
            ? 'Naozaj chcete upraviť výsledok tohto zápasu?'
            : 'Naozaj chcete zrušiť výsledok tohto zápasu? Táto akcia je nevratná.'" @confirm="onActionModalConfirm"
        @cancel="onActionModalCancel" />

</template>

<script>
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';
import api from '@/axios-interceptor';
import AddParticipantsForm from '@/components/AddParticipantsForm.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';

import CircularProgress from '@/components/CircularProgress.vue';
import MatchItem from '@/components/MatchItem.vue';
import { inflection } from '@/utils/inflection';


export default {
    name: 'LeagueDetail',
    data() {
        return {
            league: {},
            freePlayers: [],
            freeTeams: [],
            droppedParticipantsIds: [],
            groupedMatches: {},
            standings: [],
            selectedParticipants: [],
            activeMatchId: null,
            openedRounds: [],
            loading: true,
            showAddParticipants: false,
            showDeleteModal: false,
            showDropModal: false,
            showConfirmModal: false,
            confirmationAction: null, // 'generate' alebo 'finish'
            showActionModal: false,
            actionType: null, // 'edit' alebo 'cancel'
            targetMatchId: null,
            participant: null,
            expandedRow: null,
            header: useHeaderStore(),
            userStore: useUserStore()

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

                await Promise.all([
                    this.fetchFreeParticipants(),
                    this.fetchMatches(),
                    this.fetchStats()
                ]);
            } catch (error) {
                console.error('Chyba pri načítaní údajov:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchLeague() {
            const res = await api.get('/leagues/' + this.leagueId);
            this.league = res.data;
            this.header.setTitle(this.league.leagueName, this.leagueTypeLabel)
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
                    api.get('/players/not-in-league/' + this.leagueId),
                    api.get('/teams/not-in-league/' + this.leagueId)
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
                const res = await api.patch(`/leagues/${leagueId}/addParticipants`, payload);
                await this.loadInitialData();
                this.flash.showMessage(res.data, 'success');
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

                const response = await api.delete(`/leagues/${this.league.leagueId}/participants/${id}`);

                this.flash.showMessage(response.data, 'info')

                // if (this.league.leagueType === 'SINGLES') {
                //     this.flash.showMessage('Hráč ' + participant.name + ' bol úspešne odstránený z ligy.', 'info');
                // } else if (this.league.leagueType === 'DOUBLES') {
                //     this.flash.showMessage('Tím ' + participant.name + ' bol úspešne odstránený z ligy.', 'info');
                // }

                await this.loadInitialData();  // aby sa aktualizovali dáta ligy

            } catch (err) {
                console.error('Chyba pri mazaní participanta z ligy:', err);
                this.flash.showMessage('Nepodarilo sa odstrániť účastníka z ligy.', 'error');
            } finally {
                this.cancelDelete();
            }
        },
        async dropParticipantFromLeague(participantId) {
            try {
                let participant = null

                if (this.league.leagueType === 'SINGLES') {
                    participant = this.league.players.find(p => p.id === participantId);
                } else if (this.league.leagueType === 'DOUBLES') {
                    participant = this.league.teams.find(t => t.id === participantId);
                }

                if (!participant) {
                    this.flash.showMessage('Účastník nebol nájdený.', 'warning');
                    return;
                }

                const response = await api.patch('/leagues/' + this.league.leagueId + '/participants/' + participantId + '/drop')

                this.flash.showMessage(response.data, 'info')

                await this.loadInitialData()
            } catch (err) {
                console.error('Chyba pri odhlasovaní participanta z ligy:', err);
                this.flash.showMessage('Nepodarilo sa odhlásiť účastníka z ligy.', 'error');
            } finally {
                this.cancelDrop()
            }
        },
        async goToDetail(type, id) {
            try {
                await api.get(`/${type}/${id}`);
                this.$router.push(`/tennis/${type}/${id}`);
            } catch (error) {
            }
        },
        async fetchMatches() {
            const leagueId = this.leagueId
            try {
                const res = await api.get('/matches/' + leagueId + '/grouped-by-round');
                this.groupedMatches = res.data;
            } catch (err) {
                console.error('Chyba pri nacitavani zapasov', err);
            }
        },
        async generateMatches() {
            this.loading = true;

            try {
                const leagueId = this.leagueId;

                // Vygenerovanie zápasov
                await api.patch(`/matches/${leagueId}/generate-matches`);
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
                name = player?.name || '';
            } else if (type === 'teams') {
                const team = this.league.teams.find(t => t.id === id);
                name = team?.name || '';
            }

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.participant = null;
            this.showDeleteModal = false;
        },
        confirmDropParticipant(type, id) {
            let name = '';

            if (this.league.leagueType === 'SINGLES') {
                const player = this.league.players.find(p => p.id === id);
                name = player?.name || '';
            } else if (this.league.leagueType === 'DOUBLES') {
                const team = this.league.teams.find(t => t.id === id);
                name = team?.name || '';
            }

            this.participant = { id, type, name };
            this.showDropModal = true;
        },
        cancelDrop() {
            this.participant = null;
            this.showDropModal = false;
        },
        openGenerateModal() {
            this.confirmationAction = 'generate';
            this.showConfirmModal = true;
        },
        openFinishModal() {
            this.confirmationAction = 'finish';
            this.showConfirmModal = true;
        },
        onModalCancel() {
            this.showConfirmModal = false;
            this.confirmationAction = null;
        },
        async onModalConfirm() {
            this.showConfirmModal = false;

            if (this.confirmationAction === 'generate') {
                await this.generateMatches();
            } else if (this.confirmationAction === 'finish') {
                await this.finishLeague();
            }

            this.confirmationAction = null;
        },
        requestEditResult(matchId) {
            this.targetMatchId = matchId;
            this.actionType = 'edit';
            this.showActionModal = true;
        },
        requestCancelResult(matchId) {
            this.targetMatchId = matchId;
            this.actionType = 'cancel';
            this.showActionModal = true;
        },
        onActionModalConfirm() {
            if (this.actionType === 'edit') {
                this.toggleForm(this.targetMatchId);
            } else if (this.actionType === 'cancel') {
                this.cancelMatchResult(this.targetMatchId);
            }

            this.resetActionModal();
        },
        onActionModalCancel() {
            this.resetActionModal();
        },
        resetActionModal() {
            this.showActionModal = false;
            this.actionType = null;
            this.targetMatchId = null;
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
            // await this.fetchMatches();
            // await this.fetchStats()
            await this.loadInitialData()
            this.activeMatchId = null;
        },
        async fetchStats() {
            const leagueId = this.leagueId
            try {
                const url = this.league.leagueType === 'DOUBLES'
                    ? '/leagues/' + leagueId + '/teams/stats'
                    : '/leagues/' + leagueId + '/players/stats'

                const res = await api.get(url);
                this.standings = res.data;
            } catch (err) {
                console.error('Chyba pri načítavaní štatistík', err);
            }
        },
        async finishLeague() {
            this.loading = true;

            try {
                const leagueId = this.leagueId;

                // Ukončenie ligy
                await api.patch(`/leagues/${leagueId}/finish`);
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
                await api.patch(`/matches/${matchId}/cancel-result`);
                this.flash.showMessage('✅ Výsledok zápasu bol zrušený', 'warning');
                await this.loadInitialData();
            } catch (error) {
                console.error('Chyba pri rušení výsledku:', error);
                this.flash.showMessage('❌ Nepodarilo sa zrušiť výsledok.', 'error');
            } finally {
                this.loading = false;
            }
        },
        getMatchClass(match, side) {
            if (!match.result) return '';

            const homeScore = match.result.score1;
            const awayScore = match.result.score2;

            if (homeScore === awayScore) {
                return ''; // remíza = nič špeciálne
            }

            const isHomeWinner = homeScore > awayScore;

            if (side === 'home') {
                return isHomeWinner ? 'winner' : 'loser';
            }

            if (side === 'away') {
                return !isHomeWinner ? 'winner' : 'loser';
            }

            return '';
        },
        toggleRow(id) {
            this.expandedRow = this.expandedRow === id ? null : id
        },
        getPlayedMatchesInRound(matches) {
            return matches.filter(match =>
                match.status === 'FINISHED' ||
                match.status === 'SCRATCHED'
            ).length;
        },

        inflection,
        getParticipantCount(league) {
            return league.leagueType === 'SINGLES'
                ? (league.players?.length ?? 0)
                : (league.teams?.length ?? 0);

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
        participants() {
            return this.isSingles ? this.league?.players || [] : this.league?.teams || [];
        },
        activeParticipants() {
            return this.participants.filter(p => p.active
                && !this.league?.droppedParticipantsIds?.includes(p.id)
            )
        },
        inactiveParticipants() {
            return this.participants.filter(p => !p.active
                || this.league?.droppedParticipantsIds?.includes(p.id)
            )
        },
        hasParticipants() {
            return this.activeParticipants.length > 0 || this.inactiveParticipants.length > 0;
        },
        noParticipantsMessage() {
            return this.isSingles
                ? 'Liga nemá žiadnych hráčov.'
                : 'Liga nemá žiadne tímy.';
        },
        hasMatches() {
            return Object.keys(this.groupedMatches).length > 0;
        },
        allRoundNumbers() {
            return Object.keys(this.groupedMatches);
        },
        areAnyRoundsOpened() {
            return this.openedRounds.length > 0;
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin;
        },
        modalMessage() {
            return this.confirmationAction === 'generate'
                ? 'Naozaj chcete spustiť ligu a vygenerovať zápasy?'
                : 'Naozaj chcete ukončiť túto ligu? Táto akcia je nezvratná.';
        },
        leagueTypeLabels() {
            return {
                SINGLES: 'Dvojhra',
                DOUBLES: 'Štvorhra',
            };
        },
        leagueTypeLabel() {
            return this.leagueTypeLabels[this.league.leagueType] || '';
        },
        leagueStatus() {
            return this.league.leagueStatus;
        },
        isLeagueCreated() {
            return this.league.leagueStatus === 'CREATED';
        },
        isLeagueActive() {
            return this.league.leagueStatus === 'ACTIVE';
        },
        isLeagueFinished() {
            return this.league.leagueStatus === 'FINISHED';
        },
        totalMatches() {
            return Object.values(this.groupedMatches || {})
                .reduce((total, matches) => total + matches.length, 0);
        },

        playedMatches() {
            return Object.values(this.groupedMatches || {})
                .flat()
                .filter(match =>
                    match.status === 'FINISHED'
                )
                .length;
        },
        scratchedMatches() {
            return Object.values(this.groupedMatches || {})
                .flat()
                .filter(match => match.status === 'SCRATCHED')
                .length;
        },
        cancelledMatches() {
            return Object.values(this.groupedMatches || {})
                .flat()
                .filter(match => match.status === 'CANCELLED')
                .length;
        },

        completedMatches() {
            return Object.values(this.groupedMatches || {})
                .flat()
                .filter(match =>
                    match.status === 'FINISHED' ||
                    match.status === 'SCRATCHED' ||
                    match.status === 'CANCELLED'
                )
                .length;
        },

        remainingMatches() {
            return Object.values(this.groupedMatches || {})
                .flat()
                .filter(match => match.status === 'CREATED')
                .length;
        }
    },
    components: { AppButton, AddMatchResult, AddParticipantsForm, AppModal, CircularProgress, MatchItem }
}

</script>

<style scoped>
.right-side {
    flex-direction: column;
}

/* =========================
   LEAGUE HEADER
========================= */

.league-header {
    background: #111;
    color: white;
    border: 1px solid #292929;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 18px;
}

.league-header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.league-title {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
}

.league-title-text {
    flex: 1;
    text-align: center;
}

.league-title-icon img {
    width: 80px;
    height: auto;
    filter: drop-shadow(0 5px 20px #bdbdbd);
}

.league-title h1 {
    margin: 0;
    font-size: 30px;
}

.league-title p {
    color: #acbbc9;
    font-size: 14px;
}


/* STATUS */

.league-status {
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 700;
}

.status-created {
    background: #292929;
    color: #ccc;
}

.status-active {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
}

.status-finished {
    background: rgba(255, 215, 0, 0.12);
    color: #ffd700;
}


/* INFO */

.league-info {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    margin-top: 25px;
}

.league-info-item {
    display: flex;
    align-items: center;
    gap: 9px;
}

.league-info-item>span {
    font-size: 22px;
}

.league-info-item small {
    display: block;
    color: #acbbc9;
    font-size: 11px;
}

.league-info-item strong {
    display: block;
    margin-top: 2px;
    font-size: 14px;
}

.winner-info strong {
    color: #ffd700;
}


/* PROGRESS */

.league-progress {
    margin-top: 25px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 7px;
    color: #acbbc9;
    font-size: 12px;
}

.progress-header strong {
    color: #ffd700;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #2a2a2a;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg,
            #b8860b,
            #ffd700);
    border-radius: 10px;
    transition: width 0.4s ease;
}


/* ADMIN */

.league-header .admin-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}


/* =========================
   MAIN CONTENT
========================= */

.main-flex-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 18px;
    align-items: start;
}


/* =========================
   SECTION TITLE
========================= */
.section-heading {
    width: 100%;
}

.section-heading>div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 11px;
}

.section-heading h2 {
    margin: 0;
    font-size: 2rem;
}

.section-icon {
    font-size: 25px;
}

.matches-stats {
    font-size: 0.875rem;
    color: #acbbc9;
    padding-bottom: 0.5rem;
    /* Jemná sivá farba pre štatistiky */
}

.matches-stats small {
    display: inline;
    /* Zaručí, že budú vedľa seba */
}


/* =========================
   TABLE
========================= */

.standings-table-wrapper {
    width: 100%;
    overflow-x: auto;
}

.standings-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
}

.standings-table th {
    padding: 9px 7px;
    color: #888;
    font-size: 10px;
    text-transform: uppercase;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
}

.standings-table td {
    padding: 12px 7px;
    white-space: nowrap;
}


.standings-table th:nth-child(2),
.standings-table td:nth-child(2) {
    text-align: left;
}

.standings-table tr.dropped td {
    color: #999;
    text-shadow: none;
    font-style: italic;
}

.standings-table .dropped-text {
    text-align: center;
    color: #ffd700;
    font-style: italic;
    letter-spacing: 0.3px;
}

.main-row {
    cursor: pointer;
    transition: background 0.15s;
}

.main-row:hover {
    background: #3d3d3d;
}

.main-row.expanded {
    background: #3d3d3d;
}

.rank {
    width: 35px;
    font-weight: 700;
}

.participant-name {
    width: 100%;
    font-weight: 600;
    white-space: normal;
}

.wins {
    color: #16a34a;
    font-weight: 600;
}

.losses {
    color: #dc2626;
}

.points {
    font-weight: 800;
}


/* =========================
   DETAIL
========================= */

.detail-row {
    background: #002E2C;
    padding: 0.8rem;
}

.detail-stats {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.5rem 1.5rem;
    align-items: center;
}

.detail-stats small {
    color: #ffd700;
    font-size: 0.8rem;
}

.detail-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
}

.detail-button {
    margin-top: 9px;
}


/* =========================
   ROUNDS
========================= */

.matches-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
}

.round {
    border-radius: 10px;
    overflow: hidden;
}

.round-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 14px;
    cursor: pointer;
}

.round-title:hover {
    background: #3d3d3d;
}

.round-title>div {
    display: flex;
    align-items: center;
    gap: 10px;
}

.round-title strong {
    font-size: 13px;
}

.round-title span {
    color: #888;
    font-size: 11px;
}

.match-list {
    list-style: none;
    margin: 0;
    padding: 0;
}


/* =========================
   EMPTY
========================= */

.empty-state,
.loading-state {
    padding: 40px;
    text-align: center;
    color: #888;
}


/* =========================
   MOBILE
========================= */
@media (max-width: 768px) {

    .main-flex-layout {
        grid-template-columns: 1fr;
    }

    .league-page {
        padding: 12px;
    }

    .league-header {
        padding: 18px;
    }

    .league-title {
        gap: 5px;
    }


    .league-title-icon img {
        width: 60px;
    }

    .league-title h1 {
        font-size: 24px;
    }

    .league-status {
        padding: 4px 4px;
        font-size: 0.6rem;
    }

    .league-info {
        margin-top: 10px;
        gap: 18px;
    }

    .league-progress {
        margin-top: 10px;
    }

    .standings-table td {
        font-size: 0.9rem;
        padding: 8px 7px;
    }

    /* .standings-table th:nth-child(3),
    .standings-table td:nth-child(3),
    .standings-table th:nth-child(4),
    .standings-table td:nth-child(4),
    .standings-table th:nth-child(5),
    .standings-table td:nth-child(5), */
    .standings-table th:nth-child(6),
    .standings-table td:nth-child(6) {
        display: none;
    }

    .standings-table tr.dropped td {
        display: table-cell;
    }

    .detail-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .matches-wrapper {
        gap: 0px;
    }

}
</style>