<template>

    <div class="admin-buttons">
        <!-- 🟢 Štart ligy -->
        <AppButton v-if="isAdmin && hasParticipants && leagueStatus === 'CREATED'" label="Odštartovať ligu" icon="🏁"
            type="create" htmlType="button" @clicked="openGenerateModal" />

        <!-- 🔴 Ukončenie ligy -->
        <AppButton v-if="isAdmin && leagueStatus === 'ACTIVE'" label="Ukončiť ligu" icon="🛑" type="delete"
            htmlType="button" @clicked="openFinishModal" />

        <!--    Pridávanie účastníkov -->
        <AppButton v-if="isAdmin && leagueStatus === 'CREATED'"
            :label="showAddParticipants ? 'Skryť formulár' : isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
            icon="➕" type="default" htmlType="button" @clicked="showAddParticipants = !showAddParticipants" />
        <AddParticipantsForm v-if="isAdmin" :show="showAddParticipants" :items="isSingles ? freePlayers : freeTeams"
            :title="isSingles ? 'Pridať hráčov do ligy' : 'Pridať tímy do ligy'"
            :submitLabel="isSingles ? 'Pridať hráčov' : 'Pridať tímy'" @submit="handleAddParticipants" />
    </div>

    <div class="league-detail-container">

        <div v-if="loading">Načítavam...</div>

        <!-- 🧱 Hlavné rozloženie -->
        <main v-else class="main-flex-layout">

            <!-- 🏓 Zápasy -->
            <section class="matches">
                <h3 v-if="hasMatches">Zápasy ligy</h3>

                <div class="list-or-nothing" v-if="hasMatches">
                    <div class="matches-wrapper">
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
                                        <div class="match-display">
                                            <div>{{ isSingles ? match.homePlayer?.name : match.homeTeam?.name }}</div>
                                            <div>vs</div>
                                            <div>{{ isSingles ? match.awayPlayer?.name : match.awayTeam?.name }}</div>
                                        </div>

                                        <!-- Pridanie výsledku (admin alebo hráč) -->
                                        <div
                                            v-if="(isAdmin || isUserPlayerInMatch(match)) && match.status === 'CREATED' && leagueStatus === 'ACTIVE'">
                                            <AppButton
                                                :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                                                :type="activeMatchId === match.id ? 'delete' : 'default'"
                                                htmlType="button" icon="📝" @clicked="toggleForm(match.id)" />
                                            <AddMatchResult v-if="activeMatchId === match.id" :match="match"
                                                :leagueType="league.leagueType"
                                                @result-submitted="fetchMatchesAndClose" />
                                        </div>

                                        <!-- Výsledok zápasu -->
                                        <div v-else-if="match.status === 'FINISHED' || match.status === 'CANCELLED' || match.status === 'SCRATCHED'"
                                            class="match-result-wrapper">
                                            <div class="match-result-text">
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
                                            </div>

                                            <!-- 🔧 Admin môže upraviť výsledok -->
                                            <div class="match-result-buttons">
                                                <div v-if="isAdmin && leagueStatus === 'ACTIVE'">
                                                    <AppButton
                                                        :label="activeMatchId === match.id ? 'Zavrieť úpravu' : 'Upraviť výsledok'"
                                                        :type="activeMatchId === match.id ? 'delete' : 'default'"
                                                        htmlType="button" icon="✏️"
                                                        @clicked="requestEditResult(match.id)" />
                                                    <AddMatchResult v-if="activeMatchId === match.id" :match="match"
                                                        :leagueType="league.leagueType"
                                                        @result-submitted="fetchMatchesAndClose" />
                                                </div>
                                                <AppButton v-if="isAdmin && leagueStatus === 'ACTIVE'"
                                                    label="Zrušiť výsledok" icon="❌" type="delete" htmlType="button"
                                                    @clicked="requestCancelResult(match.id)"
                                                    :disabled="activeMatchId === match.id" />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <h3 v-else>Žiadne zápasy pre túto ligu.</h3>
            </section>

            <!-- 📊 Tabuľka -->
            <aside class="standings" v-if="standings.length > 0">
                <!-- <h3 v-if="hasParticipants">Tabuľka</h3> -->

                <div class="list-or-nothing">
                    <table class="standings-table" v-if="hasParticipants">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th colspan="2">{{ isSingles ? 'Hráč' : 'Tím' }}</th>
                                <th>Progres</th>
                                <th>Body</th>
                                <th>Zápasy</th>
                                <th>Výhry</th>
                                <th>Prehry</th>
                                <th>Vyhraté<br>sety</th>
                                <th v-if="isAdmin">Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(entry, index) in standings" :key="entry.id" @click="goToDetail(isSingles ? 'players' : 'teams',
                                isSingles ? entry.playerId : entry.teamId)" style="cursor: pointer;"
                                :class="{ dropped: entry.droppedFromLeague }">
                                <td>{{ index + 1 }}.</td>
                                <td colspan="2">
                                    {{ isSingles ? entry.playerName : entry.teamName }}
                                </td>
                                <td>
                                    <CircularProgress :progress="entry.leagueProgress" />
                                </td>
                                <td>{{ entry.setsWon }}</td>
                                <td>{{ entry.matches }}</td>
                                <td>{{ entry.wins }}</td>
                                <td>{{ entry.losses }}</td>
                                <td>{{ entry.setsLost }}</td>

                                <td v-if="isAdmin">
                                    <AppButton label="" icon="🔓" type="edit" htmlType="button" title="Odhlásiť hráča z ligy"
                                        @click.stop="confirmDropParticipant(isSingles ? 'players' : 'teams', isSingles ? entry.playerId : entry.teamId)" />
                                    <AppButton label="" icon="🗑️" type="delete" htmlType="button" title="Vymazať hráča z ligy"
                                        @click.stop="confirmDeleteParticipant(isSingles ? 'players' : 'teams', isSingles ? entry.playerId : entry.teamId)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </aside>
        </main>
    </div>
    <AppModal :visible="showDeleteModal"
        :message="`Naozaj chcete odstrániť ${participant?.type === 'players' ? 'hráča' : 'tím'} ${participant?.name} z ligy?`"
        @confirm="() => removeParticipantFromLeague(participant?.id)" @cancel="cancelDelete" />
    <AppModal :visible="showDropModal"
        :message="`Naozaj chcete odhlásiť ${participant?.type === 'players' ? 'hráča' : 'tím'} ${participant?.name} z ligy? 
        Všetky zapasy ${participant?.type === 'players' ? 'hráča' : 'tímu'} budú zrušené. Táto akcia sa nebude dať vrátiť.`"
        @confirm="() => dropParticipantFromLeague(participant?.id)" @cancel="cancelDrop" />
    <AppModal :visible="showConfirmModal" :message="modalMessage" @confirm="onModalConfirm" @cancel="onModalCancel" />
    <AppModal :visible="showActionModal" :title="actionType === 'edit' ? 'Úprava výsledku' : 'Zrušenie výsledku'"
        :message="actionType === 'edit'
            ? 'Naozaj chcete upraviť výsledok tohto zápasu?'
            : 'Naozaj chcete zrušiť výsledok tohto zápasu? Táto akcia je nevratná.'" @confirm="onActionModalConfirm"
        @cancel="onActionModalCancel" />
</template>


<script>
import AppButton from '@/components/AppButton.vue';
import AddMatchResult from '@/components/AddMatchResult.vue';
import api from '@/axios-interceptor';
import ParticipantList from '@/components/ParticipantList.vue';
import AddParticipantsForm from '@/components/AddParticipantsForm.vue';
import { useUserStore } from '@/stores/user';
import AppModal from '@/components/AppModal.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';

import CircularProgress from '@/components/CircularProgress.vue';


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
            const res = await api.get('/leagues/' + this.leagueId);
            this.league = res.data;
            this.header.setTitle(this.league.leagueName, this.leagueTypeLabels[this.league.leagueType])
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
                    api.get('/players/not-in-league/'+this.leagueId),
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
                this.$router.push(`/${type}/${id}`);
            } catch (error) {
            }
        },
        async fetchMatches() {
            const leagueId = this.leagueId
            try {
                const res = await api.get('/matches/' + leagueId + '/grouped-by-round');
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
            this.flash.showMessage('✅ Výsledok bol úspešne uložený!', 'success');
        },
        async fetchStats() {
            const leagueId = this.leagueId
            try {
                const url = this.league.leagueType === 'DOUBLES'
                    ? '/leagues/' + leagueId + '/teams/stats'
                    : '/leagues/' + leagueId + '/players/stats'

                const res = await api.get(url);
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
        leagueStatus() {
            return this.league.leagueStatus;
        },
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin;
        },
        isLoggedIn() {
            return this.userStore.isLoggedIn
        },
        modalMessage() {
            return this.confirmationAction === 'generate'
                ? 'Naozaj chcete spustiť ligu a vygenerovať zápasy?'
                : 'Naozaj chcete ukončiť túto ligu? Táto akcia je nezvratná.';
        },
        leagueTypeLabels() {
            return {
                SINGLES: 'DVOJHRA',
                DOUBLES: 'ŠTVORHRA',
            };
        }
    },
    components: { AppButton, AddMatchResult, ParticipantList, AddParticipantsForm, AppModal, CircularProgress }
}

</script>

<style scoped>
/* 🎾 Obal celej ligy */
.league-detail-container {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    /* padding: 1rem; */
    box-sizing: border-box;
}

/* 📦 Layout kontajner */
.main-flex-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    flex-wrap: wrap;
}

/* 🎾 Zápasy */
/* Základný layout pre zápasy */
.matches {
    flex: 1.5 1 0;
    padding: 1rem;
}

.matches-wrapper {
    width: 100%;
    text-align: center;
}

/* Trojriadkové meno zápasu */
.match-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
}

/* Položka zápasu */
.match-item {
    list-style: none;
    padding: 12px 0;
    border-bottom: 1px solid #ddd;

}

/* Posledná položka bez spodného okraja */
.match-item:last-child {
    border-bottom: none;
}

/* Wrapper pre výsledok a tlačidlá */
.match-result-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    background-color: #705846;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    font-size: 1rem;
    color: #faf3e0;

}

/* Text výsledku - oddelený od tlačidiel */
.match-result-text {
    font-weight: 600;
}

/* Kontajner pre tlačidlá */
.match-result-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* 📊 Tabuľka */
.standings {
    flex: 3 1 0;
    padding: 1rem;
}

.standings-table {
    width: 100%;
    border-collapse: collapse;
}

.standings-table th,
.standings-table td {
    padding: 0.5rem;
    text-align: center;
}

.standings-table th {
    text-transform: uppercase;
    font-size: 1rem;
    color: #ffd700;
    line-height: 1.2;
}

.standings-table tbody tr:hover {
    background-color: #363537;
}

.standings-table tr.dropped td {
    color: #999;
    text-shadow: none;
    font-style: italic;
}


.admin-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

@media (max-width: 768px) {
    .main-flex-layout {
        flex-direction: column;
    }

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
        order: 3;
    }

    .match-display {
        font-size: 1rem;
    }

    .standings-table th,
    .standings-table td {
        padding: 0.3rem 0.5rem;
        font-size: 0.9rem;
    }

    /* Minimalna sirka tabuľky na mobil aby nebola natiahnuta */
    .standings-table {
        min-width: 600px;
    }
}
</style>