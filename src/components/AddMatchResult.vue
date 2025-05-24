<template>
    <div>
        <label>Scratched hráč ID (voliteľné):</label>
        <input v-model="formData.scratchedId" placeholder="napr. 123" />

        <div v-for="(set, index) in formData.setScores" :key="index">
            <label>Set {{ index + 1 }} – {{ match.homePlayer.firstName + ' ' + match.homePlayer.lastName +':'}}</label>
            <input type="number" v-model.number="set.score1" />
            <label>{{ match.awayPlayer.firstName + ' ' + match.awayPlayer.lastName +':'}}</label>
            <input type="number" v-model.number="set.score2" />
            <button type="button" @click="removeSet(index)">❌</button>
        </div>

        <button type="button" @click="addSet">➕ Pridať set</button>
        <AppButton label="Odoslať výsledok" type="create" icon="✅" @clicked="submitResult" />
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
            try {
                await axios.patch(`/api/rest/matches/${this.match.id}/result`, this.formData);
                this.$emit('result-submitted', this.matchId);
            } catch (err) {
                console.error(err);
            }
        }
    },
    components: { AppButton }
};
</script>