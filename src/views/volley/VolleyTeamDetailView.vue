<template>

    <div v-if="loading">... loading ...</div>

    <div v-else class="main-layout">
        <div class="left-side">
        </div>
        <div class="right-side">
            <div class="list-or-nothing">
                <div>
                    <h3 class="label">Kapitán tímu:</h3>
                    <h3 class="value">{{ team.captain.name }}</h3>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import api from '@/axios-interceptor';
import { useHeaderStore } from '@/stores/header';

export default {
    name: 'TeamDetailView.vue',
    data() {
        return {
            team: null,
            loading: true,
            header: useHeaderStore(),
        }
    },
    created() {
        this.fetchTeam();
    },
    methods: {
        async fetchTeam() {
            try {
                const response = await api.get('/volleyball/teams/' + this.$route.params.id);
                this.team = response.data;
                this.header.setTitle(this.team.name, '');
                this.loading = false
            } catch (error) {
                console.error('Chyba pri načítavaní tímu:', error);
            }
        },
    }
}

</script>

<style scoped>

.list-or-nothing {
    justify-content: flex-start;
    align-items: center;
}

.label {
    color: #ffd700;
    font-size: 1.3rem;
}

.value {
    font-size: 1.4rem;
}

</style>