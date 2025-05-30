<template>
    <div>
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="participant in participants" :key="participant.id">
                <div class="participant-content">
                    <span>{{ formatName(participant) }}</span>
                    <AppButton label="Zmazať" icon="🗑️" type="delete" @clicked="() => remove(participant.id)" />

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
            type: String,
            required: true
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
    components: { AppButton }
}

</script>

<style scoped>
ul {
    list-style-type: none;
    /* border: 1px solid #cdcdcd; */
}

li {
    padding: .3em .6em;
    cursor: pointer;
}

li:not(:last-child) {
    border-bottom: 1px solid #ddd;
}

.participant-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
}
</style>