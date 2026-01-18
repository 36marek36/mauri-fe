// export function typeText(text, targetElement, delay = 15) {
//     let index = 0;
//     function type() {
//         if (index < text.length) {
//             targetElement.innerHTML += text[index] === '\n' ? '<br>' : text[index];
//             index++;
//             setTimeout(type, delay);
//         }
//     }
//     type();
// }
export function typeText(text, targetElement, delay = 15) {
    let i = 0;
    let result = "";

    function type() {
        if (i >= text.length) return;

        if (text[i] === "<") {
            // HTML tag -> zapisujeme celý naraz
            const end = text.indexOf(">", i);
            const tag = text.slice(i, end + 1);
            result += tag;
            targetElement.innerHTML = result;
            i = end + 1;
            setTimeout(type, delay);
        } else {
            // obyčajný znak
            result += text[i];
            targetElement.innerHTML = result;
            i++;
            setTimeout(type, delay);
        }
    }

    type();
}
