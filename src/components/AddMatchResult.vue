<template>

    <form @submit.prevent="submitResult" v-show="match" class="match-form">

        <!-- 🔹 SETY -->
        <div v-if="!formData.scratchedId" class="sets">

            <div v-for="(set, index) in formData.setScores" :key="index" class="set-card">

                <div class="set-title">
                    Set {{ index + 1 }}
                </div>

                <!-- HRÁČI -->
                <div class="player-stack">

                    <div class="player-row">
                        <span>{{ participantName('home') }}</span>
                        <input type="number" v-model.number="set.score1" />
                    </div>

                    <div class="player-row">
                        <span>{{ participantName('away') }}</span>
                        <input type="number" v-model.number="set.score2" />
                    </div>

                </div>

                <div class="center">
                    <AppButton label="Odstrániť set" type="delete" icon="❌" htmlType="button"
                        @clicked="removeSet(index)" />
                </div>

            </div>

        </div>

        <!-- 🔹 PRIDAŤ SET -->
        <div v-if="!formData.scratchedId" class="center">
            <AppButton label="Pridať set" type="default" icon="➕" htmlType="button" @clicked="addSet" />
        </div>

        <!-- 🔹 SKREČ -->
        <div class="scratch-box">

            <div v-if="!showScratchSelect" class="center">
                <AppButton label="Skreč zápasu" type="delete" icon="⚠️" htmlType="button"
                    @clicked="showScratchSelect = true" />
            </div>

            <div v-else class="scratch-select">

                <select v-model="formData.scratchedId">

                    <option value="">-- vyberte --</option>

                    <template v-if="leagueType === 'SINGLES'">
                        <option :value="match.homePlayer?.id">
                            {{ match.homePlayer?.name }}
                        </option>
                        <option :value="match.awayPlayer?.id">
                            {{ match.awayPlayer?.name }}
                        </option>
                    </template>

                    <template v-else>
                        <option :value="match.homeTeam?.id">
                            {{ match.homeTeam?.name }}
                        </option>
                        <option :value="match.awayTeam?.id">
                            {{ match.awayTeam?.name }}
                        </option>
                    </template>

                </select>

                <div class="center" style="margin-top: 0.5rem;">
                    <AppButton label="Zrušiť skreč" type="default" htmlType="button" @clicked="
                        showScratchSelect = false;
                    formData.scratchedId = null;
                    " />
                </div>

            </div>

        </div>

        <!-- 🔹 ODOSLANIE -->
        <div class="center submit">
            <AppButton label="Odoslať výsledok" type="create" icon="✅" htmlType="submit" />
        </div>

    </form>

    <AppModal :visible="showConfirmModal" :title="formData.scratchedId ? '⚠️ Potvrdenie skreču' : '🟢 Potvrdenie výsledku'"
        :message="confirmMessage" @confirm="onModalConfirm" @cancel="onModalCancel" />
</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import AppModal from './AppModal.vue';

export default {
    props: {
        match: { type: Object, required: true },
        leagueType: { type: String, required: true }
    },
    emits: ['result-submitted'],
    data() {
        return {
            formData: {
                scratchedId: null,
                setScores: [{ score1: 0, score2: 0 }]
            },
            showConfirmModal: false,
            showScratchSelect: false
        };
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        },
        confirmMessage() {
            const home = this.participantName('home');
            const away = this.participantName('away');

            const isScratch = !!this.formData.scratchedId;

            if (isScratch) {
                const scratchedIsHome =
                    this.formData.scratchedId == this.match.homePlayer?.id ||
                    this.formData.scratchedId == this.match.homeTeam?.id;

                const scratched = scratchedIsHome ? home : away;

                return `Naozaj chcete odoslať výsledok zápasu ${home} vs ${away} (skreč: ${scratched})?`;
            }

            const result = this.formData.setScores
                .map(set => `${set.score1}:${set.score2}`)
                .join(', ');

            return `Naozaj chcete odoslať výsledok zápasu ${home} vs ${away} (${result})?`;
        }
    },
    methods: {
        participantName(side) {
            if (this.leagueType === 'SINGLES') {
                const player = side === 'home' ? this.match.homePlayer?.name : this.match.awayPlayer?.name;
                return player;
            } else {
                const team = side === 'home' ? this.match.homeTeam?.name : this.match.awayTeam?.name;
                return team;
            }
        },
        addSet() {
            this.formData.setScores.push({ score1: 0, score2: 0 });
        },
        removeSet(index) {
            this.formData.setScores.splice(index, 1);
        },
        // volá sa pri odoslaní formulára
        submitResult() {
            this.showConfirmModal = true;

            this.$nextTick(() => {
                const modal = document.querySelector('.modal')
                if (modal) {
                    modal.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                }
            })
        },

        // volá sa pri potvrdení modalu
        async onModalConfirm() {
            this.showConfirmModal = false;

            try {
                await api.patch(`/matches/${this.match.id}/result`, this.formData);
                this.$emit('result-submitted', this.match.id);
            } catch (err) {
                const msg = err.response?.data?.message || 'Nepodarilo sa odoslať výsledok.';
                this.flash.showMessage(msg, 'error');
            }
        },
        onModalCancel() {
            this.showConfirmModal = false;
        }
    },
    components: { AppButton, AppModal }
};
</script>


<style scoped>
.match-form {
    width: 100%;
    max-width: 600px;
    margin: 0;
    padding: 1rem;
    background: #002E2C;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    box-sizing: border-box;
}

/* ===== SETY ===== */

.set-card {
    background: #013834;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.set-title {
    font-weight: bold;
    margin-bottom: 0.8rem;
    color: #ffd700;
}

/* HRÁČI POD SEBOU */
.player-stack {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.player-row span {
    flex: 1;
    color: #e0e0e0;
}

.player-row input {
    width: 80px;
    padding: 0.4rem;
    text-align: center;
}

/* ===== SKREČ ===== */

.scratch-box {
    margin-top: 1rem;
}

.scratch-select select {
    width: 100%;
    padding: 0.5rem;
}

/* ===== COMMON ===== */

.center {
    text-align: center;
    margin-top: 0.8rem;
}

.submit {
    margin-top: 1.5rem;
}
</style>