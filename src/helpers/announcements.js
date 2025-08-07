import { ServerError } from "../errors/index.js";


/**
 * Find potential matching announcements from the database
 * @param {Object} fastify - Fastify instance
 * @param {Object} query - MongoDB query object
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} Array of matching announcements
 * @throws {ServerError} If there's an error during the database operation
 */
async function findPotentialMatches(fastify, query, limit = 20) {
    try {
        return await fastify.mongoose.connection.db
            .collection("announcements")
            .find(query)
            .limit(limit)
            .toArray();
    } catch (error) {
        throw new ServerError(`Error finding potential matches: ${error.message}`);
    }
}

/**
 * Find an announcement by its ID
 * @param {Object} fastify - Fastify instance
 * @param {string} announcementId - The ID of the announcement to find
 * @returns {Promise<Object|null>} The announcement document or null if not found
 * @throws {ServerError} If there's an error during the database operation
 */
async function findAnnouncementById(fastify, announcementId) {
    try {
        return await fastify.mongoose.connection.db
            .collection("announcements")
            .findOne({ _id: announcementId });
    } catch (error) {
        throw new ServerError(`Error finding announcement by ID: ${error.message}`);
    }
}

export {
    findPotentialMatches,
    findAnnouncementById,
};
