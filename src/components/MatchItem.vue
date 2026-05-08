<template>
    <li class="match-item">

        <!-- MATCH DISPLAY -->
        <div class="match-display">
            <div :class="getMatchClass(match, 'home')">
                {{ isSingles ? match.homePlayer?.name : match.homeTeam?.name }}
            </div>

            <div class="vs">vs</div>

            <div :class="getMatchClass(match, 'away')">
                {{ isSingles ? match.awayPlayer?.name : match.awayTeam?.name }}
            </div>
        </div>

        <!-- CREATE RESULT -->
        <div v-if="canCreateResult">
            <AppButton :label="activeMatchId === match.id ? 'Zavrieť formulár' : 'Pridať výsledok'"
                :type="activeMatchId === match.id ? 'delete' : 'default'" htmlType="button" icon="📝"
                @clicked="$emit('toggle-form', match.id)" />

            <div v-if="activeMatchId === match.id" class="match-form-wrapper">
                <AddMatchResult :match="match" :leagueType="leagueType" @result-submitted="$emit('refresh')" />
            </div>
        </div>

        <!-- RESULT -->
        <div v-else-if="isFinished" class="match-result-wrapper">

            <!-- CANCELLED -->
            <div v-if="match.status === 'CANCELLED'" class="match-cancelled">
                Zápas bol zrušený
            </div>

            <!-- SCRATCHED -->
            <div v-else-if="match.status === 'SCRATCHED'" class="match-scratched">
                Zápas bol skrečovaný
            </div>

            <!-- FINISHED -->
            <div v-else class="match-result-text">
                <strong>Výsledok:</strong>
                {{ match.result?.score1 }} : {{ match.result?.score2 }}

                <div v-if="match.result?.setScores?.length" class="set-scores">
                    <span v-for="(set, index) in match.result.setScores" :key="index">
                        {{ set.score1 }}:{{ set.score2 }}
                        <span v-if="index < match.result.setScores.length - 1">, </span>
                    </span>
                </div>
            </div>

            <div v-if="isAdmin && leagueStatus === 'ACTIVE'">

                <AppButton :label="activeMatchId === match.id ? 'Zavrieť úpravu' : 'Upraviť výsledok'"
                    :type="activeMatchId === match.id ? 'delete' : 'default'" htmlType="button" icon="✏️"
                    @clicked="$emit('edit', match.id)" />

                <div v-if="activeMatchId === match.id" class="match-form-wrapper">
                    <AddMatchResult :match="match" :leagueType="leagueType" @result-submitted="$emit('refresh')" />
                </div>

                <AppButton label="Zrušiť výsledok" icon="❌" type="delete" htmlType="button"
                    @clicked="$emit('cancel', match.id)" :disabled="activeMatchId === match.id" />

            </div>

        </div>

    </li>
</template>

<script>
import AddMatchResult from './AddMatchResult.vue';
import AppButton from './AppButton.vue';

export default {
    props: {
        match: Object,
        isSingles: Boolean,
        leagueType: String,
        leagueStatus: String,
        isAdmin: Boolean,
        activeMatchId: [Number, String],
        getMatchClass: Function,
        isUserPlayerInMatch: Function
    },
    emits: ['toggle-form', 'edit', 'cancel', 'refresh'],

    computed: {
        canCreateResult() {
            return (
                (this.isAdmin || this.isUserPlayerInMatch?.(this.match)) &&
                this.match.status === 'CREATED' &&
                this.leagueStatus === 'ACTIVE'
            )
        },
        isFinished() {
            return ['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(this.match.status)
        }
    },
    components: { AppButton, AddMatchResult }
}
</script>

<style scoped>
.match-item {
    list-style: none;
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    background: #1e1e1e;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

/* 🆚 display hráčov/tímov */
.match-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    text-align: center;
}

/* VS */
.vs {
    font-size: 0.85rem;
    opacity: 0.7;
    text-transform: lowercase;
}

/* 🔵 hráč/tím (default stav) */
.match-display>div {
    min-width: 80px;
}

/* 🟢/🔴 výsledkové stavy (ak ich používaš) */
.winner {
    color: #adff2f;
    text-shadow: 0 0 6px rgba(173, 255, 47, 0.3);
}

.loser {
    color: #e0e0e0;
    opacity: 0.8;
}

/* 🧾 výsledok */
.match-result-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: center;
    text-align: center;
    padding: 0.8rem;
    border-radius: 6px;
    background: #002e2c;
    border: 1px solid #e6e6e6;
}

.match-cancelled,
.match-scratched {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;

    font-weight: 700;
    font-size: 0.85rem;

    text-align: center;
    margin: 0 auto;
}

/* 🔴 CANCELLED */
.match-cancelled {
    color: #ff4c4c;
    background: rgba(255, 76, 76, 0.08);
    border: 1px solid rgba(255, 76, 76, 0.25);
}

/* 🟡 SCRATCHED */
.match-scratched {
    color: #ffc107;
    background: rgba(255, 193, 7, 0.08);
    border: 1px solid rgba(255, 193, 7, 0.25);
}

.match-result-text {
    font-weight: 600;
}

.set-scores {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-left: 0.4rem;
}

/* 🔘 tlačidlá */
.match-result-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* 📝 form wrapper (kľúčové pre tvoj problém s posunom) */
.match-form-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 0.5rem;
}

/* 📱 mobil */
@media (max-width: 768px) {
    .match-item {
        padding: 0.6rem;
    }

    .match-display {
        font-size: 0.95rem;
        flex-direction: column;
        gap: 0.3rem;
    }

    .match-result-buttons {
        flex-direction: column;
        align-items: center;
    }
}
</style>