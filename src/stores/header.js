import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
    state: () => ({
        title: '',
        subtitle: ''
    }),
    actions: {
        setTitle(title, subtitle = '') {
            this.title = title
            this.subtitle = subtitle
        },
        clear() {
            this.title = ''
            this.subtitle = ''
        }
    }
})