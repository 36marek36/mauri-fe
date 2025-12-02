<template>
    <div>
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="participant in participants" :key="participant.id" :class="{ inactive: !participant.active }">
                <div class="participant-content">
                    <div class="info">
                        <span @click="openDetail(participant.id)">{{ participant.name }}</span>
                        <CircularProgress v-if="showProgress" :progress="participant.leagueProgress" />
                    </div>
                    <div class="actions">
                        <AppButton v-if="drop" label="" icon="🔓" type="edit" htmlType="button"
                            @clicked="() => drop(participant.id)" />
                        <AppButton v-if="remove" label="" icon="🗑️" type="delete" htmlType="button"
                            @clicked="() => remove(participant.id)" />
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import AppButton from './AppButton.vue';
import CircularProgress from './CircularProgress.vue';

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
        showProgress: {
            type: Boolean,
            default: true
        },
        remove: {
            type: Function,
            default: null
        },
        drop: {
            type: Function,
            default: null
        }
    },
    methods: {
        openDetail(participant) {
            this.$emit('view-detail', participant)
        }
    },
    components: { AppButton, CircularProgress }
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
    background-color: #363537;
}

li:not(:last-child) {
    border-bottom: 1px solid #cdcdcd;
}

.participant-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info {
    display: flex;
    justify-content: space-between;
    /* meno vľavo, progress vpravo */
    align-items: center;
    gap: 10px;
    width: 75%;
}

.info span {
    /* meno úplne vľavo */
    flex-grow: 1;
    /* zaberie celý dostupný priestor */
}



.actions {
    display: flex;
    flex-direction: column;
    /* tlačidlá pod sebou */
    gap: 0.5em;
    width: 20%;
    align-items: flex-end;
    /* tlačidlá zarovná napravo */
}

.actions>* {
    width: 100%;
    /* každý potomok (napr. AppButton) bude rovnako široký */
}

li.inactive .info span {
    color: #aaa;
    /* šedá farba */
    text-decoration: line-through;
    /* preškrtnutie */
    font-style: italic;
    /* kurzíva */
}




@media (max-width: 768px) {
    .participant-content {
        flex-direction: row;
        align-items: flex-start;
        gap: 0.3em;
    }
}
</style>