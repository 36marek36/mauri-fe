<template>
    <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
        <div class="modal">
            <p>{{ message }}</p>

            <div class="buttons">
                <button type="button" class="confirm" @click="confirm">
                    🗑️ Áno
                </button>

                <button type="button" class="cancel" @click="cancel">
                    ❌ Nie
                </button>
            </div>
        </div>
    </div>
</template>

<script>
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
        },
        onOverlayClick(event) {
            // klik mimo modalu
            if (!event.target.closest('.modal')) {
                this.cancel();
            }
        }
    }
}
</script>

<style scoped>
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
</style>

<!-- <style scoped>
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
    z-index: 1000;
}

.modal {
    margin-top: 100px;
    background-color: rgba(255, 255, 255, 0.4);
    padding: 20px;
    border: 1px solid red;
    border-radius: 8px;
    min-width: 250px;
    animation: slideDown 0.3s ease-out;
    z-index: 1001;
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
</style> -->