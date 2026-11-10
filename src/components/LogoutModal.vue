<template>
    <Teleport to="body">
        <div v-if="visible" class="modal-overlay" @click.self="cancel">
            <div class="logout-modal">

                <div class="logout-icon">↪</div>

                <h3>Naozaj sa chcete odhlásiť?</h3>

                <p>Ste si istý, že sa chcete odhlásiť zo svojho účtu?</p>

                <div class="buttons">
                    <AppButton label="Odhlásiť sa" type="delete" htmlType="button" @clicked="confirm" />

                    <AppButton label="Zrušiť" type="default" htmlType="button" @clicked="cancel" />
                </div>

            </div>
        </div>
    </Teleport>
</template>
<script>
import AppButton from './AppButton.vue';
export default {
    name: 'LogoutModal',
    components: { AppButton },
    props: {
        visible: { type: Boolean, required: true }
    },
    emits: ['confirm', 'cancel'],
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);

    z-index: 99999;
    padding: 20px;
    box-sizing: border-box;
}

.logout-modal {
    width: 100%;
    max-width: 420px;

    padding: 35px 30px;

    background: #172932;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

    color: white;
    text-align: center;

    animation: modalAppear 0.2s ease;
}

.logout-icon {
    font-size: 35px;
    margin-bottom: 15px;
    color: #e4b832;
}

.logout-modal h3 {
    font-size: 1.3rem;
    margin: 0 0 12px;
}

.logout-modal p {
    color: #b8c5ca;
    font-size: 0.95rem;
    margin-bottom: 25px;
}

.buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
}

@keyframes modalAppear {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 480px) {
    .logout-modal {
        padding: 28px 18px;
    }

    .buttons {
        flex-direction: column;
    }
}
</style>