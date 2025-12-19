<template>
    <div v-if="show" class="list-or-nothing">
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="item in items" :key="item.id">
                <label class="checkbox">
                    <input type="checkbox" :value="item.id" v-model="selected" />
                    <span>{{ item.name }}</span>
                </label>
            </li>
        </ul>
        <AppButton :label="submitLabel" icon="✅" type="create" htmlType="button" :disabled="selected.length === 0"
            @clicked="submit" />
    </div>
</template>

<script>
import AppButton from './AppButton.vue';

export default {
    name: 'AddParticipantsForm',
    props: {
        show: {
            type: Boolean,
            required: true
        },
        items: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        submitLabel: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            selected: []
        }
    },
    methods: {
        submit() {
            this.$emit('submit', this.selected)
            this.selected = []
        }
    },
    components: { AppButton }
}

</script>

<style scoped>
.list-or-nothing {
    align-items: center;
}

.list-or-nothing ul {
    display: grid;
    grid-auto-flow: column;
    /* hráči sa budú ukladať do stĺpcov */
    grid-auto-rows: min-content;
    grid-template-rows: repeat(6, auto);
    /* 6 hráčov v jednom stĺpci */
    gap: 0.2rem 1rem;
    /* medzery medzi riadkami a stĺpcami */
    list-style: none;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
}

/* Skryjeme originálny checkbox, ale ponecháme ho funkčný */
.checkbox input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #666;
    border-radius: 4px;
    display: inline-block;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Zaškrtnutý stav */
.checkbox input[type="checkbox"]:checked {
    background-color: #4caf50;
    border-color: #4caf50;
}

/* "Fajka" */
.checkbox input[type="checkbox"]:checked::after {
    content: "✓";
    position: absolute;
    top: -2px;
    left: 4px;
    font-size: 16px;
    color: white;
}

/* Hover efekt */
.checkbox input[type="checkbox"]:hover {
    border-color: #333;
}

/* text hover */
.checkbox:hover span {
    color: #ffffff;
    transition: 0.2s ease;
}

/* Zaškrtnutý stav */
.checkbox input[type="checkbox"]:checked+span {
    color: #4caf50;
    /* font-weight: 700; */
}

/* Text vedľa checkboxu */
.checkbox span {
    font-size: 1rem;
}
</style>