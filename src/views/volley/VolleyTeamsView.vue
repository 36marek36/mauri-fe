<template>
    <div class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="participants-columns">

                <!-- 🧑‍🤝‍🧑 Tímy -->
                <div class="column">

                    <AppButton v-if="isAdmin" :label="showCreateTeamForm ? 'Zavrieť formulár' : 'Vytvoriť nový tím'"
                        icon="➕" :type="showCreateTeamForm ? 'delete' : 'create'" htmlType="button"
                        @clicked="toggleCreateForm" />

                    <!-- Formulár na vytvorenie tímu -->
                    <div v-if="showCreateTeamForm" class="list-or-nothing">
                        <div class="create-team-form">
                            <label for="name">Názov tímu:</label>
                            <input class="team-input" id="name" type="text" v-model="newTeam.name">

                            <label for="captain">Kapitán:</label>
                            <select id="captain" v-model="newTeam.captainId">
                                <option value="">-- Vyber hráča --</option>
                                <option v-for="captain in captains" :key="captain.id" :value="captain.id">
                                    {{ captain.name }}
                                </option>
                            </select>

                            <AppButton label="Vytvoriť" icon="➕" type="create" htmlType="button"
                                @clicked="createTeam" />
                        </div>
                    </div>

                    <!-- Načítavanie -->
                    <div v-if="loadingTeams">
                        ... loading teams...
                    </div>

                    <!-- Ak žiadne tímy -->
                    <div class="list-or-nothing" v-else-if="teams.length === 0">
                        <p>Žiadne tímy neboli zatiaľ vytvorené.</p>
                    </div>

                    <!-- Aktívne tímy -->
                    <div v-else class="list-or-nothing">
                        <ParticipantList class="teams" :participants="paginatedTeamsWithIndex"
                            :remove="isAdmin ? (id) => confirmDeleteParticipant('teams', id) : null"
                            :showProgress="false" @view-detail="(id) => goToDetail('teams', id)" />
                        <div v-if="totalPagesTeams > 1" class="pagination">
                            <AppButton label="Predošlá" icon="←" type="edit" htmlType="button"
                                @clicked="currentPageTeams--" :disabled="currentPageTeams === 1" />
                            <span>{{ currentPageTeams }} / {{ totalPagesTeams }}</span>
                            <AppButton label="Ďalšia" icon="→" type="edit" htmlType="button"
                                @clicked="currentPageTeams++" :disabled="currentPageTeams === totalPagesTeams" />
                        </div>
                    </div>

                    <!-- Neaktívne tímy -->
                    <div v-if="isAdmin" class="list-or-nothing">
                        <ParticipantList v-if="inactiveTeams?.length > 0" class="teams"
                            :title="'Neaktívne (vymazané) tímy'" :participants="inactiveTeams"
                            @view-detail="(id) => goToDetail('teams', id)" :showProgress="false"
                            :remove="(id) => confirmDeleteParticipant('teams', id)" />
                        <p v-else>Žiadne neaktívne tímy nie sú k dispozícii.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <AppModal :visible="showDeleteModal" :message="deleteMessage" @confirm="deleteTeam" @cancel="cancelDelete" />

</template>

<script>
import api from '@/axios-interceptor'
import ParticipantList from '@/components/ParticipantList.vue'
import AppButton from '@/components/AppButton.vue'
import { useUserStore } from '@/stores/user'
import AppModal from '@/components/AppModal.vue'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header'

export default {
    name: 'VolleyTeamsView',
    data() {
        return {
            captains: [],
            teams: [],
            inactiveTeams: [],
            loadingTeams: true,
            showCreateTeamForm: false,
            newTeam: {
                name: '',
                captainId: ''
            },
            showDeleteModal: false,
            participant: null,
            participantsPerPage: 10,
            currentPageTeams: 1,
            header: useHeaderStore(),
            userStore: useUserStore()
        }

    },
    created() {
        this.header.setTitle('Zoznam', 'Beachvolejbalových tímov')
        this.fetchAllData()
    },
    methods: {

        async fetchAllData() {
            this.loadingTeams = true
            this.loading = true

            try {
                const res = await api.get('/volleyball/teams/');
                this.teams = res.data

                // 👉 Ak je admin, načítaj aj neaktívnych
                if (this.isAdmin) {
                    await this.fetchAllInactiveTeams()
                }

            } catch (error) {
                // console.error('Chyba pri načítaní hráčov alebo tímov:', error)
            } finally {
                this.loadingTeams = false
                this.loading = false
            }
        },
        async fetchCaptains() {
            try {
                const res = await api.get('/players/volleyball');
                this.captains = res.data
            } catch (error) {
                console.log(error)
            }
        },
        async goToDetail(type, id) {
            try {
                // Skúsi načítať detail hráča – backend overí prihlásenie a práva
                await api.get(`/volleyball/${type}/${id}`);
                // Ak request prešiel, presmerujeme na detail
                this.$router.push(`/volleyball/${type}/${id}`);
            } catch (error) {
                // Chyby sa riešia automaticky v axios interceptore
            }
        },
        async deleteTeam() {
            try {
                const response = await api.delete(`/volleyball/${this.participant.type}/${this.participant.id}`);
                const status = response.data?.status;
                const typeName = 'Tím';

                switch (status) {
                    case 'deleted':
                        this.flash.showMessage(`${typeName} ${this.participant.name} bol úspešne vymazaný.`, 'success');
                        break;
                    case 'deactivated':
                        this.flash.showMessage(`${typeName} ${this.participant.name} ostáva deaktivovaný, pretože je stále súčasťou líg a zápasov.`, 'warning');
                        break;
                    default:
                        this.flash.showMessage(`Nastala chyba pri mazaní ${typeName.toLowerCase()}.`, 'error');
                }

                // Refresh dát podľa typu
                this.participant.type === 'teams'
                this.currentPageTeams = 1;

                await this.fetchAllData();

            } catch (err) {
                console.error(`Chyba pri mazaní ${this.participant.type.slice(0, -1)}a:`, err);
                this.flash.showMessage(`Nepodarilo sa vymazať ${this.participant.name}.`, 'error');
            } finally {
                this.cancelDelete();
            }
        },
        async fetchAllInactiveTeams() {
            try {
                const inactiveTeamsRes = await api.get('/volleyball/teams/inactive')
                this.inactiveTeams = inactiveTeamsRes.data
            } catch (error) {
                console.log(error)
            }
        },
        toggleCreateForm() {
            this.fetchCaptains()
            this.showCreateTeamForm = !this.showCreateTeamForm
        },
        async createTeam() {
            const payload = {
                name: this.newTeam.name,
                captainId: this.newTeam.captainId
            };

            try {
                const res = await api.post('/volleyball/teams/create', payload);

                this.flash.showMessage('Tím ' + this.newTeam.name + ' bol úspešne vytvoreny.', 'success')

                // Resetovanie výberu hráčov
                this.newTeam = { name: '', captainId: '' }

                // Načítanie aktualizovaného zoznamu tímov
                this.fetchAllData();

                // ⬇️ Zatvorenie formulára
                this.toggleCreateForm();
            } catch (err) {
            }
        },
        confirmDeleteParticipant(type, id) {
            let name = '';

            type === 'teams'

            const team = this.teams.find(t => t.id === id) || this.inactiveTeams.find(t => t.id === id);
            name = team ? team.name : '';

            this.participant = { id, type, name };
            this.showDeleteModal = true;
        },
        cancelDelete() {
            this.participant = null;
            this.showDeleteModal = false;
        }
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        },
        isAdmin() {
            return this.userStore.isAdmin
        },
        isLoggedIn() {
            return this.userStore.isLoggedIn
        },
        totalPagesTeams() {
            return Math.ceil(this.teams.length / this.participantsPerPage);
        },
        paginatedTeams() {
            const start = (this.currentPageTeams - 1) * this.participantsPerPage;
            const end = start + this.participantsPerPage;
            return this.teams.slice(start, end);
        },
        paginatedTeamsWithIndex() {
            return this.paginatedTeams.map((t, i) => ({
                ...t,
                index: (this.currentPageTeams - 1) * this.participantsPerPage + i + 1
            }))
        },
        deleteMessage() {
            return `Naozaj chcete zmazať ${this.participant?.type === 'players' ? 'hráča' : 'tím'}: ${this.participant?.name}?`;
        }
    },
    components: { AppButton, ParticipantList, AppModal }
}

</script>

<style scoped>
.participants-columns {
    display: flex;
    gap: 2rem;
    align-items: stretch;
    width: 100%;
}

.column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.list-or-nothing {
    align-items: center;
    font-size: 1.2rem;
}

.teams {
    width: 100%;
    padding-top: 1rem;
    flex-grow: 1;
}


.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 1rem;
    margin-bottom: 1rem;
}

.pagination span {
    font-size: 1rem;
}

.create-team-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
}

.team-input {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    outline: none;
}

@media (max-width: 768px) {
    .list-or-nothing {
        font-size: 0.9rem;
    }

    .participants-columns {
        flex-direction: column;
        gap: 1.5rem;
    }

    .pagination :deep(.app-button) {
        padding: 0.5rem 0.8rem;
        font-size: 0.8rem;
        gap: 0.3rem;
    }
}
</style>