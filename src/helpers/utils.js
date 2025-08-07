/**
 * Get confidence level description based on numeric value
 * @param {number} confidence - Confidence score (0-100)
 * @returns {string} Confidence level description
 */
function getConfidenceLevel(confidence) {
    if (confidence >= 90) {return "very_high";}
    if (confidence >= 75) {return "high";}
    if (confidence >= 60) {return "medium";}
    if (confidence >= 45) {return "low";}
    return "very_low";
}

/**
 * Get priority level based on confidence and distance
 * @param {number} confidence - Confidence score
 * @param {number} distance - Distance in km
 * @returns {string} Priority level
 */
function getPriorityLevel(confidence, distance = 0) {
    if (confidence >= 80 && distance <= 10) {return "urgent";}
    if (confidence >= 70 && distance <= 25) {return "high";}
    if (confidence >= 60) {return "medium";}
    return "low";
}

/**
 * Format distance in a human-readable way
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
}

/**
 * Format time difference in a human-readable way
 * @param {number} hours - Time difference in hours
 * @returns {string} Formatted time difference string
 */
function formatTimeDifference(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    if (hours < 24) {
        return `${Math.round(hours)} hours`;
    }
    const days = Math.round(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"}`;
}

export {
    getConfidenceLevel,
    getPriorityLevel,
    formatDistance,
    formatTimeDifference,
};
