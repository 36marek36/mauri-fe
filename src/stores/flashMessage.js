import { defineStore } from "pinia";

export const useFlashMessageStore = defineStore('flashMessage',{
    state:() => ({
        message: '',
        messageType: 'info'
    }),
    actions: {
        showMessage(msg, type = 'info'){
            this.message = msg
            this.messageType = type

            window.scrollTo({top:0, behavior:'smooth'})

            setTimeout(()=>{
                this.clearMessage()
            },4000)
        },
        clearMessage(){
            this.message = ''
            this.messageType = 'info'
        }
    }
})