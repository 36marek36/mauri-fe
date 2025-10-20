export function inflection(league) {
    const count = league.leagueType === 'SINGLES'
        ? league.players?.length
        : league.teams?.length;

    if (league.leagueType === 'SINGLES') {
        if (count === 1) return '1 hráč';
        if (count >= 2 && count <= 4) return `${count} hráči`;
        return `${count} hráčov`;
    } else {
        if (count === 1) return '1 tím';
        if (count >= 2 && count <= 4) return `${count} tímy`;
        return `${count} tímov`;
    }
}