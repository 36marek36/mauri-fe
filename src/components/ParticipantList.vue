<template>
    <div>
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="participant in participants" :key="participant.id">
                <div class="participant-content">
                    <span @click="openDetail(participant.id)">{{ formatName(participant) }}</span>
                    <AppButton label="" icon="🗑️" type="delete" @clicked="() => remove(participant.id)" />
                </div>

            </li>
        </ul>
    </div>
</template>

<script>
import AppButton from './AppButton.vue';

export default {
    name: 'ParticipantList',
    props: {
        title: {
            type: String
        },
        participants: {
            type: Array,
            required: true
        },
        formatName: {
            type: Function,
            required: true
        },
        remove: {
            type: Function,
            required: true
        }
    },
    methods: {
        openDetail(participant) {
            this.$emit('view-detail', participant)
        }
    },
    components: { AppButton }
}

</script>

<style scoped>
ul {
    list-style-type: none;
}

li {
    padding: .3em .6em;
    cursor: pointer;
}

li:hover {
    background-color: #f5f5f5;
}

li:not(:last-child) {
    border-bottom: 1px solid #cdcdcd;
}

.participant-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 768px) {
    .participant-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3em;
    }
}
</style>