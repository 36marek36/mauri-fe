<!-- <template>
    <div class="circular-progress">
        <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" :class="progressClass" :style="circleStyle" d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="18" class="percentage" transform="rotate(90 18 18)" text-anchor="middle"
                dominant-baseline="middle">
                {{ progress }}%
            </text>
        </svg>
    </div>
</template> -->

<template>
    <div class="circular-progress">
        <svg viewBox="0 0 36 36" class="circular-chart">
            <!-- Pozadie -->
            <circle class="circle-bg" cx="18" cy="18" :r="radius" />

            <!-- Progress -->
            <circle class="circle" :class="progressClass" :style="circleStyle" cx="18" cy="18" :r="radius" />

            <!-- Text v strede -->
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
    data() {
        return {
            currentOffset: 0,
            radius: 16
        };
    },
    computed: {
        circumference() {
            return 2 * Math.PI * this.radius;
        },
        progressClass() {
            if (this.progress <= 30) return 'red';
            if (this.progress <= 70) return 'orange';
            return 'green';
        },
        circleStyle() {
            return {
                strokeDasharray: this.circumference,
                strokeDashoffset: this.currentOffset,
                transition: 'stroke-dashoffset 1s ease-in-out'
            };
        }
    },
    mounted() {
        this.currentOffset = this.circumference;
        requestAnimationFrame(() => {
            this.currentOffset = this.circumference - (this.progress / 100) * this.circumference;
        });
    }
};
</script>

<!-- export default {
    name: 'CircularProgress',
    props: {
        progress: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            currentOffset: 100 // Začneme na 100% (prázdny kruh)
        };
    },
    computed: {
        progressClass() {
            if (this.progress <= 30) return 'red';
            if (this.progress <= 70) return 'orange';
            return 'green';
        },
        circleStyle() {
            return {
                strokeDasharray: '100',
                strokeDashoffset: this.currentOffset
            };
        }
    },
    mounted() {
        // Spustenie animácie v ďalšom snímku
        requestAnimationFrame(() => {
            this.currentOffset = 100 - this.progress;
        });
    }
}; -->

<style scoped>
.circular-progress {
    width: 3.5em;
    height: 3.5em;
    flex-shrink: 0;
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
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    transition: stroke-dashoffset 1s ease-in-out;
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
    font-size: 0.6em;
}
</style>