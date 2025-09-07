<template>
    <div class="circular-progress">
        <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" :class="progressClass" :stroke-dasharray="progress + ', 100'" d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="18" class="percentage" transform="rotate(90 18 18)" text-anchor="middle"
                dominant-baseline="middle">
                {{ progress }}%
            </text>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'CircularProgress',
    props: {
        progress: {
            type: Number,
            required: true
        }
    },
    computed: {
        progressClass() {
            if (this.progress <= 30) return 'red';
            if (this.progress <= 70) return 'orange';
            return 'green';
        }
    }
};
</script>

<style scoped>
.circular-progress {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.circular-chart {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.circle-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 2.8;
    stroke-linecap: round;
}

.circle {
    fill: none;
    stroke-width: 2.8;
    stroke-linecap: round;
}

.red {
    stroke: #ff0000;
}

.orange {
    stroke: #ffa500;
}

.green {
    stroke: #00ff00;
}

.percentage {
    fill: white;
    font-size: 0.5em;
}
</style>