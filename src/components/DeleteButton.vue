<template>
    <button class="delete-button" @click.stop="onDeleteClick">
        🗑️ {{ label }}
    </button>
</template>

<script>
export default {
    name: 'DeleteButton',
    props: {
        label: {
            type: String,
            default: 'Zmazat'
        },
        onDelete: {
            type: Function,
            required: true
        }
    },
    methods: {
        onDeleteClick() {
            if (confirm('Naozaj chceš položku zmazať?')) {
                this.onDelete()
            }
        }
    }
}

</script>

<style scoped>
.delete-button {
    background-color: #e53935;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;
}

.delete-button:hover {
    background-color: #c62828;
}
</style>