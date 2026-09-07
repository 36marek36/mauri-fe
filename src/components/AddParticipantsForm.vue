<template>
    <div v-if="show" class="list-or-nothing">
        <h3 class="list-title">{{ title }}</h3>

        <ul class="items-grid">
            <li v-for="item in items" :key="item.id">
                <label class="checkbox-card" :class="{ 'is-selected': selected.includes(item.id) }">
                    <input type="checkbox" :value="item.id" v-model="selected" class="visually-hidden" />
                    <span class="checkmark"></span>
                    <span class="item-name">{{ item.name }}</span>
                </label>
            </li>
        </ul>

        <div class="actions">
            <AppButton :label="submitLabel" icon="✅" type="create" htmlType="button" :disabled="selected.length === 0"
                @clicked="submit" />
        </div>
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

.list-title {
    font-size: 1.25rem;
    color: #ffffff;
    margin: 0;
    font-weight: 600;
}

/* Flexibilná mriežka pre hráčov */
.items-grid {
    /* Definuje šírku jedného stĺpca. Prehliadač sám vypočíta, 
       koľko stĺpcov (napr. 3, 4 alebo 5) sa zmestí na šírku obrazovky */
    columns: 300px;

    /* Medzera medzi stĺpcami */
    column-gap: 1.5rem;

    list-style: none;
    padding: 0.5rem;
    margin: 0;
    width: 100%;

    /* Odstránime scrollbary, blok bude rásť prirodzene nadol */
    overflow: visible;
}

.items-grid li {
    /* Kľúčová vlastnosť: Zabezpečí, že sa položka (karta hráča) 
       neroztrhne na polovicu medzi spodkom jedného a vrskom druhého stĺpca */
    break-inside: avoid;

    /* Vytvorí rozostup medzi riadkami pod sebou */
    margin-bottom: 0.5rem;
}

/* Jemná úprava samotnej karty pre lepšie správanie v stĺpcoch */
.checkbox-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #2a2a2a;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    /* Zaistí správne správanie šírky v stĺpcovom layoute */
    width: 100%;
    box-sizing: border-box;
}

/* Hover efekt na celú kartu */
.checkbox-card:hover {
    background: #333333;
    border-color: #444444;
}

.checkbox-card .item-name {
    color: #e0e0e0;
    font-size: 0.95rem;
    transition: color 0.2s ease;

    white-space: nowrap;
    /* Zákaz zalomenia do druhého riadku */
    overflow: hidden;
    /* Skryť text, ktorý preteká von */
    text-overflow: ellipsis;
    /* Pridať tri bodky (...) na koniec */
    min-width: 0;
    /* Umožní flex-itemu zmenšiť sa pod veľkosť textu */
    width: 100%;
}

/* Vizualizácia vlastného kruhového/štvorcového indikátora */
.checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid #666666;
    border-radius: 50%;
    flex-shrink: 0;

    /* 🟢 NOVÉ: Flexbox automaticky vycentruje všetko vo vnútri kruhu */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* STAV: VYBRANÉ */
.checkbox-card.is-selected {
    background: rgba(76, 175, 80, 0.1);
    /* Jemný zelený nádych pozadia */
    border-color: #4caf50;
}

.checkbox-card.is-selected .item-name {
    color: #4caf50;
    font-weight: 500;
}

.checkbox-card.is-selected .checkmark {
    border-color: #4caf50;
    background: #4caf50;
}

/* Malá biela bodka v strede kruhu po zaškrtnutí */
.checkbox-card.is-selected .checkmark::after {
    content: "";
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    /* 🟢 Odstránili sme top, left a transform - už ich netreba */
}

/* Centrovanie tlačidla na spodku */
.actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 0.5rem;
}

/* Skrytie defaultného inputu pre zachovanie prístupnosti */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (max-width: 768px) {

    .items-grid {
        columns: 180px;
        column-gap: 0.5rem;
        padding: 0.25rem;
    }

    .checkbox-card .item-name {
        font-size: 0.85rem;
        line-height: 1.2;
    }

    .checkmark {
        transform: scale(0.8);
        transform-origin: center;
    }
}
</style>