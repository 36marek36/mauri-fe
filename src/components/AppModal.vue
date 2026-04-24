<template>
    <div v-if="visible" class="modal-overlay" @click.self="cancel">
        <div class="modal">
            <p>{{ message }}</p>

            <div class="buttons">
                <AppButton label="Áno" icon="🗑️" type="delete" htmlType="button" @clicked="confirm" />
                <AppButton label="Nie" icon="❌" type="default" htmlType="button" @clicked="cancel" />
            </div>
        </div>
    </div>
</template>

<script>
import AppButton from './AppButton.vue';

export default {
    props: {
        message: { type: String, default: 'Naozaj chcete pokračovať?' },
        visible: { type: Boolean, required: true },
    },
    emits: ['confirm', 'cancel'],
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        }
    },
    components: { AppButton }
}
</script>

<!-- <style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);

    display: flex;
    justify-content: center;
    align-items: flex-start;

    z-index: 9999;
}

.modal {
    margin-top: 100px;
    background: white;
    padding: 20px;
    border-radius: 8px;

    position: relative;
    z-index: 10000;
}

.buttons {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

button {
    padding: 10px 16px;
    font-size: 16px;

    /* mobile fix */
    touch-action: manipulation;
}
</style> -->

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.modal {
    margin-top: 100px;
    background-color: rgba(255, 255, 255, 0.4);
    padding: 20px;
    border: 1px solid red;
    border-radius: 8px;
    min-width: 250px;
    animation: slideDown 0.3s ease-out;
}

.buttons {
    margin-top: 15px;
    display: flex;
    justify-content: center;
}

button {
    margin-left: 10px;
}

@keyframes slideDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>