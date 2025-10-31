function computeDelta(playerRating, oppRating, difficulty, solveTime, outcome, complexityFactor = 1.0) {
    // difficulty: "easy"|"medium"|"hard"
    const durations = { easy: 300, medium: 600, hard: 900 };
    const Ks = { easy: 24, medium: 32, hard: 40 };

    const matchDuration = durations[difficulty];
    const K = Ks[difficulty];
    const speed_bonus = matchDuration / 3;

    const expected = 1 / (1 + Math.pow(10, (oppRating - playerRating) / 400));

    let result = (outcome === 'win') ? 1 : (outcome === 'draw') ? 0.5 : 0;

    let speed_factor = 1;
    if (outcome === 'win') {
        speed_factor = 1 + Math.max(0, (speed_bonus - solveTime) / speed_bonus);
        speed_factor = Math.min(speed_factor, 2.0);
    }

    let rawDelta = K * (result - expected) * speed_factor * complexityFactor;
    let delta = Math.round(rawDelta);
    if (delta === 0 && Math.abs(rawDelta) > 0.0) delta = Math.sign(rawDelta); // minimum movement

    return delta;
}

module.exports = computeDelta