<template>
    <form @submit.prevent="submitResult" v-if="match" class="match-form">
        <!-- Skreč -->
        <div class="form-group">
            <label>{{ leagueType === 'SINGLES' ? 'Skrečovaný hráč:' : 'Skrečovaný tím:' }}</label>
            <select v-model="formData.scratchedId">
                <option value="">-- vyberte --</option>

                <template v-if="leagueType === 'SINGLES'">
                    <option :value="match.homePlayer?.id">
                        {{ fullName(match.homePlayer) }}
                    </option>
                    <option :value="match.awayPlayer?.id">
                        {{ fullName(match.awayPlayer) }}
                    </option>
                </template>

                <template v-else>
                    <option :value="match.homeTeam?.id">
                        {{ teamName(match.homeTeam) }} (domáci tím)
                    </option>
                    <option :value="match.awayTeam?.id">
                        {{ teamName(match.awayTeam) }} (hosťujúci tím)
                    </option>
                </template>
            </select>
        </div>

        <!-- Sety -->
        <div v-if="!formData.scratchedId">
            <fieldset v-for="(set, index) in formData.setScores" :key="index" class="set-fieldset">
                <legend>Set {{ index + 1 }}</legend>

                <div class="form-group">
                    <label>{{ participantName('home') }}</label>
                    <input type="number" v-model.number="set.score1" />
                </div>

                <div class="form-group">
                    <label>{{ participantName('away') }}</label>
                    <input type="number" v-model.number="set.score2" />
                </div>

                <div class="text-center">
                    <AppButton label="Odstrániť set" type="default" htmlType="button" icon="❌"
                        @clicked="removeSet(index)" />
                </div>
            </fieldset>
            <div class="text-center">
                <AppButton label="Pridať set" type="default" htmlType="button" icon="➕" @clicked="addSet" />
            </div>
        </div>

        <!-- Odoslanie -->
        <div class="text-center submit-btn">
            <AppButton label="Odoslať výsledok" type="create" htmlType="submit" icon="✅" />
        </div>
    </form>
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';

export default {
    props: {
        match: { type: Object, required: true },
        leagueType: { type: String, required: true }
    },
    data() {
        return {
            formData: {
                scratchedId: null,
                setScores: [{ score1: 0, score2: 0 }]
            }
        };
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        }
    },
    methods: {
        fullName(player) {
            return `${player?.firstName ?? ''} ${player?.lastName ?? ''}`.trim();
        },
        teamName(team) {
            return `${team?.player1?.lastName ?? ''} / ${team?.player2?.lastName ?? ''}`;
        },
        participantName(side) {
            if (this.leagueType === 'SINGLES') {
                const player = side === 'home' ? this.match.homePlayer : this.match.awayPlayer;
                return this.fullName(player);
            } else {
                const team = side === 'home' ? this.match.homeTeam : this.match.awayTeam;
                return this.teamName(team);
            }
        },
        addSet() {
            this.formData.setScores.push({ score1: 0, score2: 0 });
        },
        removeSet(index) {
            this.formData.setScores.splice(index, 1);
        },
        async submitResult() {
            try {
                await axios.patch(`/api/rest/matches/${this.match.id}/result`, this.formData);
                this.$emit('result-submitted', this.match.id);
            } catch (err) {
                const msg = err.response?.data?.message || 'Nepodarilo sa odoslať výsledok.';
                this.flash.showMessage(msg, 'error');
            }
        }
    },
    components: { AppButton }
};
</script>

<style scoped>
.match-form {
    max-width: 600px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}

.form-group input,
.form-group select {
    padding: 0.5rem;
    font-size: 1rem;
}

.set-fieldset {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.text-center {
    text-align: center;
}

.submit-btn {
    margin-top: 1rem;
}
</style>