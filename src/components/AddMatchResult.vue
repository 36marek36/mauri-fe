<!-- <template>
    <div v-if="match">
        <label>Scratched hráč ID (voliteľné):</label>
        <input v-model="formData.scratchedId" placeholder="napr. 123" />

        <div v-for="(set, index) in formData.setScores" :key="index">
            <label>Set {{ index + 1 }} –
                <span v-if="leagueType === 'SINGLES'">
                    {{ match.homePlayer?.firstName }} {{ match.homePlayer?.lastName }}:
                </span>
                <span v-else>
                    {{ match.homeTeam?.player1?.firstName }} {{ match.homeTeam?.player1?.lastName }} /
                    {{ match.homeTeam?.player2?.firstName }} {{ match.homeTeam?.player2?.lastName }}:
                </span>
            </label>
            <input type="number" v-model.number="set.score1" />

            <label>
                <span v-if="leagueType === 'SINGLES'">
                    {{ match.awayPlayer?.firstName }} {{ match.awayPlayer?.lastName }}:
                </span>
                <span v-else>
                    {{ match.awayTeam?.player1?.firstName }} {{ match.awayTeam?.player1?.lastName }} /
                    {{ match.awayTeam?.player2?.firstName }} {{ match.awayTeam?.player2?.lastName }}:
                </span>
            </label>
            <input type="number" v-model.number="set.score2" />

            <button type="button" @click="removeSet(index)">❌</button>
        </div>

        <button type="button" @click="addSet">➕ Pridať set</button>
        <AppButton label="Odoslať výsledok" type="create" htmlType="button" icon="✅" @clicked="submitResult" />
    </div>
</template> -->

<template>
    <div v-if="match">
        <div class="scratched">
            <label>Skrečovaný hráč:</label>
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
        <div v-if="!formData.scratchedId">
            <div v-for="(set, index) in formData.setScores" :key="index" class="set-block">
                <h3>Set {{ index + 1 }}</h3>

                <div class="player-score">
                    <label>
                        <span v-if="leagueType === 'SINGLES'">
                            {{ match.homePlayer?.firstName }} {{ match.homePlayer?.lastName }}:
                        </span>
                        <span v-else>
                            {{ match.homeTeam?.player1?.firstName }} {{ match.homeTeam?.player1?.lastName }} /
                            {{ match.homeTeam?.player2?.firstName }} {{ match.homeTeam?.player2?.lastName }}:
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
                            {{ match.awayTeam?.player1?.firstName }} {{ match.awayTeam?.player1?.lastName }} /
                            {{ match.awayTeam?.player2?.firstName }} {{ match.awayTeam?.player2?.lastName }}:
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
        match: {
            type: Object,
            required: true
        },
        leagueType: {
            type: String,
            required: true
        }
    },
    methods: {
        addSet() {
            this.formData.setScores.push({ score1: 0, score2: 0 });
        },
        removeSet(index) {
            this.formData.setScores.splice(index, 1);
        },
        async submitResult() {
            // Ak je zadaný hráč, ktorý skrečoval – nepotrebujeme overovať skóre
            if (!this.formData.scratchedId) {
                // Validácia setov len v prípade, že nebol skreč
                const invalidSet = this.formData.setScores.find(set => {
                    if (
                        set.score1 == null ||
                        set.score2 == null ||
                        set.score1 < 0 ||
                        set.score2 < 0 ||
                        set.score1 > 30 ||
                        set.score2 > 30
                    ) {
                        return true;
                    }

                    // Remíza nie je povolená
                    if (set.score1 === set.score2) return true;

                    // Rozdiel menší ako 2 body – s výnimkou 7:6 alebo 6:7
                    const diff = Math.abs(set.score1 - set.score2);
                    const allowedTiebreak = (set.score1 === 7 && set.score2 === 6) || (set.score1 === 6 && set.score2 === 7);
                    if (diff < 2 && !allowedTiebreak) {
                        return true;
                    }
                });

                if (invalidSet) {
                    alert(
                        'Niektorý set obsahuje neplatné skóre. Uistite sa, že skóre nie je záporné, nie je rovnaké a rozdiel je aspoň 2 body.'
                    );
                    return;
                }
            }

            try {
                await axios.patch(`/api/rest/matches/${this.match.id}/result`, this.formData);
                this.$emit('result-submitted', this.match.id);
            } catch (err) {
                console.error('Chyba pri odosielaní výsledku:', err);
                alert('Nepodarilo sa odoslať výsledok. Skontrolujte pripojenie alebo údaje.');
            }
        }

        // async submitResult() {
        //     try {
        //         await axios.patch(`/api/rest/matches/${this.match.id}/result`, this.formData);
        //         this.$emit('result-submitted', this.match.id);
        //     } catch (err) {
        //         console.error(err);
        //     }
        // }
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