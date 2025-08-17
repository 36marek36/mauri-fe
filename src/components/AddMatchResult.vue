<template>
    <div v-if="match">
        <div class="scratched">
            <label>
                {{ leagueType === 'SINGLES' ? 'Skrečovaný hráč: ' : 'Skrečovaný tím: ' }}
            </label>
            <select v-model="formData.scratchedId">
                <option value="">-- vyberte hráča alebo tím --</option>

                <!-- SINGLES -->
                <option v-if="leagueType === 'SINGLES'" :value="match.homePlayer?.id">
                    {{ match.homePlayer?.firstName }} {{ match.homePlayer?.lastName }}
                </option>
                <option v-if="leagueType === 'SINGLES'" :value="match.awayPlayer?.id">
                    {{ match.awayPlayer?.firstName }} {{ match.awayPlayer?.lastName }}
                </option>

                <!-- DOUBLES -->
                <option v-if="leagueType === 'DOUBLES'" :value="match.homeTeam?.id">
                    {{ match.homeTeam?.player1?.lastName }} / {{ match.homeTeam?.player2?.lastName }} (domáci tím)
                </option>
                <option v-if="leagueType === 'DOUBLES'" :value="match.awayTeam?.id">
                    {{ match.awayTeam?.player1?.lastName }} / {{ match.awayTeam?.player2?.lastName }} (hosťujúci tím)
                </option>
            </select>
        </div>

        <!-- Zadávanie setov -->
        <div v-if="!formData.scratchedId">
            <div v-for="(set, index) in formData.setScores" :key="index" class="set-block">
                <h3>Set {{ index + 1 }}</h3>

                <div class="player-score">
                    <label>
                        <span v-if="leagueType === 'SINGLES'">
                            {{ match.homePlayer?.firstName }} {{ match.homePlayer?.lastName }}:
                        </span>
                        <span v-else>
                            {{ match.homeTeam?.player1?.lastName }} / {{ match.homeTeam?.player2?.lastName }}:
                        </span>
                    </label>
                    <input type="number" v-model.number="set.score1" />
                </div>

                <div class="player-score">
                    <label>
                        <span v-if="leagueType === 'SINGLES'">
                            {{ match.awayPlayer?.firstName }} {{ match.awayPlayer?.lastName }}:
                        </span>
                        <span v-else>
                            {{ match.awayTeam?.player1?.lastName }} / {{ match.awayTeam?.player2?.lastName }}:
                        </span>
                    </label>
                    <input type="number" v-model.number="set.score2" />
                </div>

                <div style="text-align: center">
                    <button type="button" @click="removeSet(index)">❌ Odstrániť set</button>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 12px;">
                <button type="button" @click="addSet">➕ Pridať set</button>
            </div>
        </div>

        <AppButton label="Odoslať výsledok" type="create" htmlType="button" icon="✅" @clicked="submitResult" />

    </div>
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/AppButton.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';

export default {
    data() {
        return {
            formData: {
                scratchedId: null,
                setScores: [{ score1: 0, score2: 0 }]
            }
        };
    },
    props: {
        match: { type: Object, required: true },
        leagueType: { type: String, required: true }
    },
    methods: {
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
    computed: {
        flash() {
            return useFlashMessageStore();
        },
    },
    components: { AppButton }
};
</script>

<style scoped>
.set-block {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.player-score {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.player-score label {
    flex: 1;
}

.player-score input {
    width: 60px;
}

.scratched {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
</style>