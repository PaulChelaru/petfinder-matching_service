import {
    getConfidenceLevel,
    getPriorityLevel,
    formatDistance,
    formatTimeDifference,
} from "./utils.js";

/**
 * Build match data structure for saving to database
 * @param {Object} announcement - Original announcement
 * @param {Array} recommendations - Array of recommended matches
 * @returns {Object} Structured match data for database
 */
function buildMatchDataForSaving(announcement, recommendations) {
    return {
        sourceAnnouncementId: announcement._id, // Use _id for database references
        sourceType: announcement.type,
        matches: recommendations.map(match => ({
            targetAnnouncementId: match._id, // Use _id for database references
            confidence: match.confidence,
            distance: match.distance || null,
            timeDifference: match.timeDifferenceHours || null,
            matchFactors: match.matchFactors || [],
            reasoning: match.reasoning || "",
            recommendations: match.recommendations || [],
        })),
        processedAt: new Date(),
        totalMatches: recommendations.length,
    };
}

/**
 * Transform announcement data for matching algorithm
 * @param {Object} rawAnnouncement - Raw announcement from database
 * @returns {Object} Normalized announcement for matching
 */
function transformAnnouncementForMatching(rawAnnouncement) {
    return {
        _id: rawAnnouncement._id,
        type: rawAnnouncement.type,
        species: rawAnnouncement.species || rawAnnouncement.petType,
        breed: rawAnnouncement.breed,
        location: rawAnnouncement.location,
        lastSeenDate: rawAnnouncement.lastSeenDate,
        description: rawAnnouncement.description,
        photos: rawAnnouncement.photos || [],
        contactInfo: rawAnnouncement.contactInfo,
    };
}

/**
 * Convert match result to API response format
 * @param {Object} matchData - Internal match data
 * @returns {Object} API response format
 */
function convertToApiResponse(matchData) {
    return {
        announcementId: matchData.sourceAnnouncementId,
        type: matchData.sourceType,
        matches: matchData.matches.map(match => ({
            id: match.targetAnnouncementId,
            confidence: match.confidence,
            confidenceLevel: getConfidenceLevel(match.confidence),
            distance: match.distance,
            distanceFormatted: formatDistance(match.distance),
            timeDifference: match.timeDifferenceHours,
            timeFormatted: formatTimeDifference(match.timeDifferenceHours),
            matchFactors: match.matchFactors,
            reasoning: match.reasoning,
            recommendations: match.recommendations,
            priority: getPriorityLevel(match.confidence, match.matchFactors),
        })),
        totalMatches: matchData.totalMatches,
        processedAt: matchData.processedAt,
    };
}

/**
 * Extract key features from announcement for analysis
 * @param {Object} announcement - Announcement object
 * @returns {Object} Key features for matching
 */
function extractMatchingFeatures(announcement) {
    return {
        species: announcement.species || announcement.petType,
        breed: announcement.breed?.toLowerCase()?.trim(),
        size: announcement.size,
        color: announcement.color,
        age: announcement.age,
        coordinates: announcement.location?.coordinates,
        lastSeenDate: announcement.lastSeenDate,
        specialMarks: announcement.specialMarks,
        gender: announcement.gender,
    };
}

export {
    buildMatchDataForSaving,
    transformAnnouncementForMatching,
    convertToApiResponse,
    extractMatchingFeatures,
};
