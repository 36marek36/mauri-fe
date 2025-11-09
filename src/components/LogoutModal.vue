<template>
    <div v-if="visible" class="modal-overlay" @click.self="cancel">
        <div class="modal">
        </div>
        <div class="modal-content">
            <h3>Naozaj sa chcete odhlásiť?</h3>
            <div class="buttons">
                <AppButton :label="'Odhlásiť'" :type="'create'" htmlType="button" @click="confirm" />
                <AppButton :label="'Zrušiť'" :type="'delete'" htmlType="button" @click="cancel" />
            </div>
        </div>
    </div>
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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

}

.modal {
    width: 745px;
    height: 745px;
    background-image: url('/images/logout.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    padding: 20px 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    color: red;
    /* border: 20px solid black; */
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    -webkit-mask-image: radial-gradient(circle, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 75%);
    mask-image: radial-gradient(circle, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 75%);
    -webkit-mask-size: cover;
    mask-size: cover;
}


.modal-content {
    background: rgba(0, 0, 0, 0.6);
    /* jemné pozadie pre čitateľnosť textu */
    border-radius: 8px;
    margin-bottom: 2rem;
    padding: 20px;
}

.buttons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 15px;
}
@media (max-width: 768px) {
  .modal {
    width: 100vw;             /* prispôsobí sa šírke obrazovky */
  }
}
</style>