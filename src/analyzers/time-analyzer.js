/**
 * Time Analysis Module
 *
 * Handles all time-related matching logic
 * Single responsibility: Temporal proximity analysis and time calculations
 */

/**
 * Analyze time proximity between lost and found announcements
 * @param {Object} lostPet - Lost pet announcement
 * @param {Object} foundPet - Found pet announcement
 * @returns {Object} Time analysis result
 */
function analyzeTimeProximity(lostPet, foundPet) {
    const timeDiff = calculateTimeDifference(lostPet.lastSeenDate, foundPet.lastSeenDate);
    let confidence = 0;
    const matchFactors = [];
    const reasoning = [];

    if (timeDiff !== null) {
        const timeDiffHours = timeDiff;
        if (timeDiffHours < 24) {
            confidence = 15;
            matchFactors.push("time_very_close");
            reasoning.push("Timp foarte apropiat (sub 24h)");
        } else if (timeDiffHours < 72) {
            confidence = 12;
            matchFactors.push("time_close");
            reasoning.push("Timp apropiat (sub 3 zile)");
        } else if (timeDiffHours < 168) {
            confidence = 8;
            matchFactors.push("time_moderate");
            reasoning.push("Timp moderat (sub 1 săptămână)");
        } else {
            reasoning.push("Timp îndepărtat (peste 1 săptămână)");
        }
    }

    return {
        confidence,
        matchFactors,
        reasoning,
        timeDifferenceHours: timeDiff,
    };
}

/**
 * Calculate time difference between two dates in hours
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number|null} Time difference in hours, null if dates invalid
 */
function calculateTimeDifference(date1, date2) {
    if (!date1 || !date2) {
        return null;
    }

    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            return null;
        }

        const diffMs = Math.abs(d2.getTime() - d1.getTime());
        const diffHours = diffMs / (1000 * 60 * 60);

        return diffHours;
    } catch {
        return null;
    }
}

/**
 * Get time-based recommendations
 * @param {number} timeDifferenceHours - Time difference in hours
 * @returns {Array<string>} Array of time-based recommendations
 */
function getTimeRecommendations(timeDifferenceHours) {
    if (timeDifferenceHours === null) {
        return ["Datele nu sunt disponibile - verifică manual"];
    }

    if (timeDifferenceHours < 24) {
        return ["Foarte recent - contact urgent recomandat"];
    } else if (timeDifferenceHours < 72) {
        return ["Recent - contactează rapid"];
    } else if (timeDifferenceHours < 168) {
        return ["În ultima săptămână - verifică detaliile"];
    } else {
        return ["Diferență de timp mare - verifică cu atenție"];
    }
}

/**
 * Check if announcements are within a reasonable time window
 * @param {Date|string} lostDate - Lost pet date
 * @param {Date|string} foundDate - Found pet date
 * @param {number} maxHours - Maximum hours difference (default: 720 = 30 days)
 * @returns {boolean} True if within time window
 */
function isWithinTimeWindow(lostDate, foundDate, maxHours = 720) {
    const timeDiff = calculateTimeDifference(lostDate, foundDate);
    return timeDiff !== null && timeDiff <= maxHours;
}

/**
 * Format time difference for display
 * @param {number} hours - Time difference in hours
 * @returns {string} Formatted time difference
 */
function formatTimeDifference(hours) {
    if (hours === null) {return "N/A";}

    if (hours < 1) {
        return `${Math.round(hours * 60)} minute`;
    } else if (hours < 24) {
        return `${Math.round(hours)} ore`;
    } else if (hours < 168) {
        const days = Math.round(hours / 24);
        return `${days} ${days === 1 ? "zi" : "zile"}`;
    } else {
        const weeks = Math.round(hours / 168);
        return `${weeks} ${weeks === 1 ? "săptămână" : "săptămâni"}`;
    }
}

export {
    analyzeTimeProximity,
    calculateTimeDifference,
    getTimeRecommendations,
    isWithinTimeWindow,
    formatTimeDifference,
};
