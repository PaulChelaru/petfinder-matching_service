import { v4 as uuidv4 } from "uuid";
import {
    analyzeSpeciesMatch,
} from "../analyzers/species-analyzer.js";
import {
    analyzeBreedSimilarity,
} from "../analyzers/breed-analyzer.js";
import {
    analyzeLocationProximity,
    calculateDistance,
} from "../analyzers/location-analyzer.js";
import {
    analyzeTimeProximity,
    calculateTimeDifference,
} from "../analyzers/time-analyzer.js";
import {
    createMatch,
} from "./database.js";
import {
    findPotentialMatches,
    updateAnnouncementMatches,
} from "./announcements.js";
import {
    buildCompleteMatchQuery,
} from "./queries.js";
import {
    buildMatchDataForSaving,
} from "./transformers.js";

/**
 * Process a new announcement and find potential matches
 * @param {Object} fastify - Fastify instance
 * @param {Object} announcement - Announcement data
 */
async function processNewAnnouncement(fastify, announcement) {
    try {
        fastify.log.info(`🔍 Processing new ${announcement.type} announcement: ${announcement.announcementId || announcement._id}`);
        fastify.log.info(`📊 Announcement details: species=${announcement.species}, breed=${announcement.breed}, location=${announcement.locationName}`);

        // Configure query options based on announcement type and available data
        const queryOptions = {
            maxDistance: fastify.config.MATCHING_MAX_DISTANCE, // Configurable via env var
            daysBefore: fastify.config.MATCHING_DAYS_BEFORE,
            daysAfter: fastify.config.MATCHING_DAYS_AFTER,
        };

        // Find potential matches using complete query with all filters
        const completeQuery = buildCompleteMatchQuery(announcement, queryOptions);

        fastify.log.info(`🔧 Query options: maxDistance=${queryOptions.maxDistance}m, daysBefore=${queryOptions.daysBefore}, daysAfter=${queryOptions.daysAfter}`);
        fastify.log.info("🔍 Complete query built:", JSON.stringify(completeQuery, null, 2));

        const potentialMatches = await findPotentialMatches(fastify, completeQuery);

        if (potentialMatches.length === 0) {
            fastify.log.info(`❌ No potential matches found for announcement ${announcement.announcementId || announcement._id}`);
            return;
        }

        fastify.log.info(`🎯 Found ${potentialMatches.length} potential matches for announcement ${announcement.announcementId || announcement._id}`);
        potentialMatches.forEach((match, index) => {
            fastify.log.info(`   Match ${index + 1}: ${match.announcementId} - ${match.species} ${match.breed} in ${match.locationName}`);
        });

        // Process and analyze all potential matches
        const analyzedMatches = await processAllMatchCandidates(fastify, announcement, potentialMatches);

        if (analyzedMatches.length === 0) {
            fastify.log.info(`❌ No high-confidence matches found for announcement ${announcement.announcementId || announcement._id}`);
            return;
        }

        fastify.log.info(`✅ Found ${analyzedMatches.length} high-confidence matches`);

        // Generate final matches
        const matches = generateTopMatches(analyzedMatches);

        if (matches.length > 0) {
            // Save to database and get back match records with UUIDs
            const matchData = buildMatchDataForSaving(announcement, matches);
            const savedMatches = await saveMatchesToDb(fastify, matchData);
            fastify.log.info(`💾 Saved ${matches.length} match results for ${announcement.announcementId} to database`);
            
            // Update the source announcement with matched announcement IDs and scores
            const matchedAnnouncementIds = savedMatches.map(match => ({
                announcementId: match.matchedAnnouncementId,
                score: match.confidence,
            }));
            await updateAnnouncementMatches(fastify, announcement.announcementId, matchedAnnouncementIds);
            
            // Update each matched announcement with the source announcement ID and score
            for (const savedMatch of savedMatches) {
                await updateAnnouncementMatches(fastify, savedMatch.matchedAnnouncementId, [{
                    announcementId: announcement.announcementId,
                    score: savedMatch.confidence,
                }]);
            }
            
            fastify.log.info("🔄 Updated all announcements with bidirectional announcement ID references");
        }

    } catch (error) {
        fastify.log.error(`Error processing announcement ${announcement.announcementId}:`, error);
        throw error;
    }
}

/**
 * Process all match candidates and return analyzed matches
 * @param {Object} fastify - Fastify instance
 * @param {Object} announcement - Original announcement
 * @param {Array} potentialMatches - Array of potential match candidates
 * @returns {Array} Array of analyzed matches with confidence >= 30% (lowered for testing)
 */
async function processAllMatchCandidates(fastify, announcement, potentialMatches) {
    const analyzedMatches = [];

    for (const potentialMatch of potentialMatches) {
        const matchData = await processMatchCandidate(fastify, announcement, potentialMatch);
        if (matchData) {
            analyzedMatches.push(matchData);
        }
    }

    return analyzedMatches;
}

/**
 * Process a single match candidate
 * @param {Object} fastify - Fastify instance
 * @param {Object} announcement - Original announcement
 * @param {Object} candidate - Potential match candidate
 * @returns {Object|null} Match data if confidence >= 30% (lowered for testing), null otherwise
 */
async function processMatchCandidate(fastify, announcement, candidate) {
    try {
    // Analyze the match using the algorithm
        const matchResult = simpleMatchAnalysis(announcement, candidate);

        fastify.log.info(`Match candidate ${candidate.announcementId}: confidence=${matchResult.confidence}%`);

        // Filter by minimum confidence threshold (lowered for testing)
        if (matchResult.confidence < 30) {
            fastify.log.info(`Rejected candidate ${candidate.announcementId}: confidence ${matchResult.confidence}% < 30%`);
            return null;
        }

        // Calculate additional metrics
        const distance = calculateDistance(announcement.location, candidate.location);
        const timeDifference = calculateTimeDifference(announcement.lastSeenDate, candidate.lastSeenDate);

        // Return enriched match data - use only announcementId for consistency
        return {
            announcementId: candidate.announcementId,
            type: candidate.type,
            species: candidate.species,
            breed: candidate.breed,
            location: candidate.location,
            lastSeenDate: candidate.lastSeenDate,
            description: candidate.description,
            photos: candidate.photos || [],
            contactInfo: candidate.contactInfo,
            confidence: matchResult.confidence,
            reasoning: matchResult.reasoning,
            matchFactors: matchResult.matchFactors,
            distance: distance,
            timeDifferenceHours: timeDifference,
        };

    } catch (error) {
        fastify.log.error("Error processing match candidate:", error);
        return null;
    }
}

/**
 * Simple matching algorithm based on basic criteria
 * @param {Object} lostPet - Lost pet announcement
 * @param {Object} foundPet - Found pet announcement
 * @returns {Object} Match analysis result
 */
function simpleMatchAnalysis(lostPet, foundPet) {
    let confidence = 0;
    const matchFactors = [];
    const reasoning = [];

    // 1. Species match (mandatory - 40 points)
    const speciesResult = analyzeSpeciesMatch(lostPet, foundPet);
    if (!speciesResult.isMatch) {
        return speciesResult; // Early return for species mismatch
    }
    confidence += speciesResult.confidence;
    matchFactors.push(...speciesResult.matchFactors);
    reasoning.push(...speciesResult.reasoning);

    // 2. Breed similarity (20 points)
    const breedResult = analyzeBreedSimilarity(lostPet, foundPet);
    confidence += breedResult.confidence;
    matchFactors.push(...breedResult.matchFactors);
    reasoning.push(...breedResult.reasoning);

    // 3. Location proximity (25 points)
    const locationResult = analyzeLocationProximity(lostPet, foundPet);
    confidence += locationResult.confidence;
    matchFactors.push(...locationResult.matchFactors);
    reasoning.push(...locationResult.reasoning);

    // 4. Time proximity (15 points)
    const timeResult = analyzeTimeProximity(lostPet, foundPet);
    confidence += timeResult.confidence;
    matchFactors.push(...timeResult.matchFactors);
    reasoning.push(...timeResult.reasoning);

    return {
        confidence: Math.min(100, confidence),
        reasoning: reasoning.join(". "),
        matchFactors,
    };
}

/**
 * Generate top matches from analyzed matches
 * @param {Array} analyzedMatches - Array of analyzed matches
 * @returns {Array} Top 4 matches sorted by confidence
 */
function generateTopMatches(analyzedMatches) {
    return analyzedMatches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 4);
}

/**
 * Save match results to database (internal function)
 * @param {Object} fastify - Fastify instance
 * @param {Object} matchData - Match data to save
 */
async function saveMatchesToDb(fastify, matchData) {
    try {
        const savedMatches = [];
        
        for (const match of matchData.matches) {
            const matchId = uuidv4(); // Generate unique UUID for each match
            const lostId = matchData.sourceType === "lost" ? matchData.sourceAnnouncementId : match.targetAnnouncementId;
            const foundId = matchData.sourceType === "found" ? matchData.sourceAnnouncementId : match.targetAnnouncementId;

            const matchRecord = {
                matchId: matchId,
                lostAnnouncementId: lostId,
                foundAnnouncementId: foundId,
                confidence: match.confidence,
                distance: match.distance,
                timeDifference: match.timeDifferenceHours,
                status: "pending",
            };

            await createMatch(matchRecord);
            
            // Store match with UUID for announcement updates
            savedMatches.push({
                ...matchRecord,
                matchedAnnouncementId: match.targetAnnouncementId, // Use targetAnnouncementId from match data
            });
        }
        
        return savedMatches;
    } catch (error) {
        fastify.log.error("Error saving match results:", error);
        throw error;
    }
}

export {
    processNewAnnouncement,
};
