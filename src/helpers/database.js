import Match from "../models/Match.js";
import { DatabaseError } from "../errors/index.js";

/**
 * Create a new match record in the database
 * @param {Object} matchData - Match data to save
 * @returns {Promise<Object>} The created match document
 * @throws {ServerError} If there's an error during the creation operation
 */
async function createMatch(matchData) {
    try {
        const match = new Match(matchData);
        return await match.save();
    } catch (error) {
        throw new DatabaseError(`Error creating match: ${error.message}`);
    }
}

/**
 * Find a match by its ID
 * @param {string} matchId - The ID of the match to find
 * @returns {Promise<Object>} The match document as a plain JavaScript object
 * @throws {ServerError} If there's an error during the database operation
 */
async function findMatchById(matchId) {
    try {
        return await Match.findById(matchId).lean();
    } catch (error) {
        throw new DatabaseError(`Error finding match by ID: ${error.message}`);
    }
}

/**
 * Find matches by announcement ID
 * @param {string} announcementId - The announcement ID to search for
 * @returns {Promise<Array>} Array of match documents
 * @throws {ServerError} If there's an error during the database operation
 */
async function findMatchesByAnnouncementId(announcementId) {
    try {
        return await Match.find({
            $or: [
                { lostAnnouncementId: announcementId },
                { foundAnnouncementId: announcementId },
            ],
        }).lean();
    } catch (error) {
        throw new DatabaseError(`Error finding matches by announcement ID: ${error.message}`);
    }
}

/**
 * Update a match record with the provided data
 * @param {string} matchId - The ID of the match to update
 * @param {Object} updateData - Object containing the fields to update
 * @returns {Promise<Object>} The updated match document as a plain JavaScript object
 * @throws {ServerError} If there's an error during the update operation
 */
async function updateMatch(matchId, updateData) {
    const payload = {
        ...updateData,
        updatedAt: new Date(),
    };

    const options = {
        new: true,
        runValidators: true,
    };

    try {
        return await Match.findByIdAndUpdate(matchId, payload, options).lean();
    } catch (error) {
        throw new DatabaseError(`Error updating match: ${error.message}`);
    }
}

/**
 * Delete a match from the database by its ID
 * @param {string} matchId - The ID of the match to delete
 * @returns {Promise<Object>} The deleted match document
 * @throws {ServerError} If an error occurs during deletion
 */
async function deleteMatch(matchId) {
    try {
        return await Match.findByIdAndDelete(matchId);
    } catch (error) {
        throw new DatabaseError(`Error deleting match: ${error.message}`);
    }
}

/**
 * Find matches with specific status
 * @param {string} status - Status to filter by ('pending', 'confirmed', 'rejected')
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} Array of match documents
 * @throws {ServerError} If there's an error during the database operation
 */
async function findMatchesByStatus(status, limit = 50) {
    try {
        return await Match.find({ status })
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    } catch (error) {
        throw new DatabaseError(`Error finding matches by status: ${error.message}`);
    }
}

/**
 * Find matches with confidence above a threshold
 * @param {number} minConfidence - Minimum confidence threshold
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} Array of match documents
 * @throws {ServerError} If there's an error during the database operation
 */
async function findHighConfidenceMatches(minConfidence = 70, limit = 50) {
    try {
        return await Match.find({ confidence: { $gte: minConfidence } })
            .limit(limit)
            .sort({ confidence: -1, createdAt: -1 })
            .lean();
    } catch (error) {
        throw new DatabaseError(`Error finding high confidence matches: ${error.message}`);
    }
}

/**
 * Count total matches in the database
 * @returns {Promise<number>} Total number of matches
 * @throws {ServerError} If there's an error during the database operation
 */
async function countMatches() {
    try {
        return await Match.countDocuments();
    } catch (error) {
        throw new DatabaseError(`Error counting matches: ${error.message}`);
    }
}

/**
 * Count matches by status
 * @param {string} status - Status to count
 * @returns {Promise<number>} Number of matches with the specified status
 * @throws {ServerError} If there's an error during the database operation
 */
async function countMatchesByStatus(status) {
    try {
        return await Match.countDocuments({ status });
    } catch (error) {
        throw new DatabaseError(`Error counting matches by status: ${error.message}`);
    }
}

export {
    createMatch,
    findMatchById,
    findMatchesByAnnouncementId,
    updateMatch,
    deleteMatch,
    findMatchesByStatus,
    findHighConfidenceMatches,
    countMatches,
    countMatchesByStatus,
};
