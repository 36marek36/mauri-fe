export function typeText(text, targetElement, delay = 15) {
    let index = 0;
    function type() {
        if (index < text.length) {
            targetElement.innerHTML += text[index] === '\n' ? '<br>' : text[index];
            index++;
            setTimeout(type, delay);
        }
    }
    type();
}