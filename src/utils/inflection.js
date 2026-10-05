// export function inflection(league) {
//     const count = league.leagueType === 'SINGLES'
//         ? (league.players?.length ?? league.participants ?? 0)
//         : (league.teams?.length ?? league.participants ?? 0);

//     if (league.leagueType === 'SINGLES') {
//         if (count === 1) return '1 hráč';
//         if (count >= 2 && count <= 4) return `${count} hráči`;
//         return `${count} hráčov`;
//     } else {
//         if (count === 1) return '1 tím';
//         if (count >= 2 && count <= 4) return `${count} tímy`;
//         return `${count} tímov`;
//     }
// }

export function inflection(type, count) {
    if (type === 'player') {
        if (count === 1) return '1 hráč';
        if (count >= 2 && count <= 4) return `${count} hráči`;
        return `${count} hráčov`;
    }

    if (type === 'team') {
        if (count === 1) return '1 tím';
        if (count >= 2 && count <= 4) return `${count} tímy`;
        return `${count} tímov`;
    }

    if (type === 'day') {
        if (count === 1) return '1 deň';
        if (count >= 2 && count <= 4) return `${count} dni`;
        return `${count} dní`;
    }

    if (type === 'league') {
        if (count === 1) return '1 liga';
        if (count >= 2 && count <= 4) return `${count} ligy`;
        return `${count} líg`;
    }

    if (type === 'match') {
        if (count === 1) return '1 zápas';
        if (count >= 2 && count <= 4) return `${count} zápasy`;
        return `${count} zápasov`;
    }

    if (type === 'participant') {
        if (count === 1) return '1 účastník';
        if (count >= 2 && count <= 4) return `${count} účastníci`;
        return `${count} účastníkov`;
    }

    return count;
}