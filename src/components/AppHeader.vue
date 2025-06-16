<template>
    <div class="header">
        <div class="logo"></div>
        <div class="text"></div>
    </div>
</template>

<style scoped>
.header {
    display: flex;
    flex-direction: row;
    /* zobrazí prvky vedľa seba */
    align-items: flex-start;
    /* zarovná ich hore v rámci headera */
    justify-content: flex-start;
    /* vycentruje celú dvojicu horizontálne */
}

.logo,
.text {
    max-width: 150px;
    width: 30vw;
    aspect-ratio: 1 / 1;
    background-size: contain;
    background-repeat: no-repeat;
}

.logo {
    background-image: url('/images/logo.png');
}

.text {
    background-image: url('/images/text.png');
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: center;
    }
}
</style>