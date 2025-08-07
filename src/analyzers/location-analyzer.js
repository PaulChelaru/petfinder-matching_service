import { getDistance } from "geolib";

/**
 * Simple location proximity analyzer
 */

/**
 * Simple location proximity analysis
 * @param {Object} announcement1 - First announcement
 * @param {Object} announcement2 - Second announcement
 * @returns {Object} Location analysis result
 */
export function analyzeLocationProximity(announcement1, announcement2) {
    const location1 = extractCoordinates(announcement1.location);
    const location2 = extractCoordinates(announcement2.location);

    if (!location1 || !location2) {
        return {
            confidence: 0,
            reasoning: ["Missing location data"],
            matchFactors: [],
            distance: null,
        };
    }

    // Calculate distance using geolib
    const distanceMeters = getDistance(location1, location2);
    const distanceKm = distanceMeters / 1000;

    // Simple distance-based scoring
    let confidence = 0;
    const reasoning = [];
    const matchFactors = [];

    if (distanceKm <= 1) {
        confidence = 25;
        reasoning.push("Very close (< 1km)");
        matchFactors.push("very_close");
    } else if (distanceKm <= 5) {
        confidence = 20;
        reasoning.push("Close (< 5km)");
        matchFactors.push("close");
    } else if (distanceKm <= 15) {
        confidence = 15;
        reasoning.push("Same area (< 15km)");
        matchFactors.push("same_area");
    } else if (distanceKm <= 50) {
        confidence = 5;
        reasoning.push("Same city (< 50km)");
        matchFactors.push("same_city");
    } else {
        confidence = 0;
        reasoning.push("Too far apart");
        matchFactors.push("far");
    }

    return {
        confidence,
        reasoning,
        matchFactors,
        distance: distanceKm,
    };
}

/**
 * Extract coordinates from location object
 */
function extractCoordinates(location) {
    if (!location) {
        return null;
    }

    // Handle different coordinate formats
    if (location.coordinates && Array.isArray(location.coordinates)) {
        const [lng, lat] = location.coordinates;
        return { latitude: lat, longitude: lng };
    }

    if (location.lat && location.lng) {
        return { latitude: location.lat, longitude: location.lng };
    }

    if (location.latitude && location.longitude) {
        return location;
    }

    return null;
}

/**
 * Calculate precise distance between two coordinates
 * @param {Object} location1 - First location
 * @param {Object} location2 - Second location
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(location1, location2) {
    const coords1 = extractCoordinates(location1);
    const coords2 = extractCoordinates(location2);

    if (!coords1 || !coords2) {
        return null;
    }

    const distanceMeters = getDistance(coords1, coords2);
    return distanceMeters / 1000;
}
