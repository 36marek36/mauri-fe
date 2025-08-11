// export const flashMessageMixin = {
//     data() {
//         return {
//             message: '',
//         };
//     },
//     methods: {
//         showMessage(msg) {
//             this.message = msg;
//             setTimeout(() => {
//                 this.message = '';
//             }, 3000);
//         },
//     },
// };

export const flashMessageMixin = {
    data() {
        return {
            message: '',
            messageType: 'info', // default
        }
    },
    methods: {
        showMessage(msg, type = 'info') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                this.message = msg;
                this.messageType = type;

                setTimeout(() => {
                    this.message = '';
                    this.messageType = 'info'; // reset
                }, 3000); // trvanie hlášky
            }, 300); // čas medzi scrollom a zobrazením hlášky
        }
    }
}