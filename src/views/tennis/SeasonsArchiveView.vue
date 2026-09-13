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

                        <div class="participants">
                            <strong>{{ season.totalParticipants }}</strong>
                            <span>účastníkov</span>
                        </div>
                    </div>

                    <div class="season-stats">

                        <!-- Hráči + Tímy -->
                        <div class="stat">
                            <span>Hráči</span>
                            <strong>{{ season.totalPlayers }}</strong>
                        </div>
                        <div class="stat">
                            <span>Tímy</span>
                            <strong>{{ season.totalTeams }}</strong>
                        </div>

                        <!-- Ligy - celý riadok -->
                        <div class="stat full">
                            <span>Ligy</span>
                            <strong>{{ season.totalLeagues }}</strong>
                        </div>


                        <!-- Zápasy + Odohraté -->
                        <div class="stat">
                            <span>Zápasy</span>
                            <strong>{{ season.totalMatches }}</strong>
                        </div>

                        <div class="stat">
                            <span>Odohraté</span>
                            <strong class="green">{{ season.totalFinishedMatches }}</strong>
                        </div>

                        <!-- Kontumované + Zrušené -->
                        <div class="stat">
                            <span>Kontumované</span>
                            <strong class="orange">{{ season.totalScratchedMatches }}</strong>
                        </div>

                        <div class="stat">
                            <span>Zrušené</span>
                            <strong class="red">{{ season.totalCancelledMatches }}</strong>
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

</style>