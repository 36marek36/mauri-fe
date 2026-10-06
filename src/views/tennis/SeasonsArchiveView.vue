<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">

            <div class="seasons-grid">
                <div v-for="season in seasons" :key="season.id" class="season-card"
                    @click="$router.push('/tennis/seasons/' + season.id)">
                    <div class="season-header">
                        <div>
                            <span class="season-label">SEZÓNA</span>
                            <h3>{{ season.year }}</h3>
                        </div>

                        <div class="total-participants">
                            <strong>{{ season.totalParticipants }}</strong>
                            <span>účastníkov</span>
                        </div>
                    </div>

                    <div class="season-stats">
    
                        <!-- Ligy -->
                        <div class="stat">
                            <strong>{{ inflection('league', season.totalLeagues)}}</strong>
                        </div>
                        <!-- Zápasy -->
                        <div class="stat">
                            <strong>{{ inflection('match', season.totalMatches) }}</strong>
                        </div>

                    </div>

                    <div class="season-dates">
                        <div class="season-date start">
                            <span>Začiatok</span>
                            <strong>{{ season.startDate }}</strong>
                        </div>

                        <div class="date-separator">→</div>

                        <div class="season-date end">
                            <span>Koniec</span>
                            <strong>{{ season.endDate }}</strong>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    </div>

</template>

<script>
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import { inflection } from '@/utils/inflection';

export default {
    name: 'SeasonsArchive',
    data() {
        return {
            loading: true,
            seasons: {},
            header: useHeaderStore(),
        }
    },
    async created() {
        this.loading = true;

        this.header.setTitle('Tenisový archív')

        await this.fetchTennisSeasons('FINISHED');

        this.loading = false;
    },

    methods: {
        async fetchTennisSeasons(status) {
            try {
                const response = await api.get('/seasons/tennis', {
                    params: {
                        status: status
                    }
                });
                this.seasons = response.data;
                console.log(this.seasons.length)
            } catch (err) {
                console.error('Chyba pri načítavaní tenisových sezón:', err);
            }
        },
        inflection
    },
    computed: {
        flash() {
            return useFlashMessageStore();
        }
    },
    components: { AppButton }
}

</script>

<style scoped>
.seasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    width: 100%;
    align-items: start;
}

.season-card {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 10px 10px;
    border: 1px solid #888888;
    border-radius: 14px;
    background: #111;
    color: #fff;
    cursor: pointer;
    transition: 0.2s ease;
}

.season-card:hover {
    transform: translateY(-3px);
    border-color: #d9ff00;
    box-shadow: 0 8px 25px rgba(217, 255, 0, 0.12);
}

.season-header,
.season-stats {
    position: relative;
}

.season-header::after,
.season-stats::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 2px;
    background: linear-gradient(to right,
            transparent,
            wheat 30%,
            wheat 70%,
            transparent);
    opacity: 0.65;
}

/* HEADER */

.season-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    padding-left: 15px;
}

.season-label {
    font-size: 0.7rem;
    color: #c9c9c9;
    letter-spacing: 2px;
}

.season-header h3 {
    margin: 2px 0 0;
    font-size: 1.8rem;
    color: #d9ff00;
}

.total-participants {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-right: 15px;
}

.total-participants strong {
    font-size: 1.5rem;
    color: #fff;
}

.total-participants span {
    font-size: 0.75rem;
    color: #c9c9c9;
}

/* STATS */

.season-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px 0;
}

.stat {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 10px;
    border-radius: 7px;
    background: #1a1a1a;
    border: 1px solid #4d4d4d;
}

/* .stat.full {
    grid-column: 1 / -1;
} */

.stat span {
    color: #c9c9c9;
    font-size: 0.85rem;
}

.stat strong {
    color: #fff;
    font-size: 0.95rem;
}

.stat strong.green {
    color: #00ff88;
}

.stat strong.red {
    color: #ff3333;
}

.stat strong.orange {
    color: #ff9800;
}

/* DATES */

.season-dates {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
}

.season-date {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.season-date span {
    font-size: 0.7rem;
    color: #c9c9c9;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.season-date strong {
    color: #d9ff00;
    font-size: 0.95rem;
}

.season-date.start strong::before {
    content: "▶";
    margin-right: 6px;
    font-size: 0.7rem;
}

.season-date.end {
    text-align: right;
}

.season-date.end strong {
    color: #ff3333;
}

.season-date.end strong::before {
    content: "■";
    margin-right: 6px;
    font-size: 0.7rem;
}

.date-separator {
    color: #777777;
    font-size: 1.2rem;
}
</style>