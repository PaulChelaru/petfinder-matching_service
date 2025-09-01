import { ServerError } from "../errors/index.js";

/**
 * Invalidate cache for a user after matches update
 * @param {Object} fastify - Fastify instance
 * @param {string} userId - User ID to invalidate cache for
 */
async function invalidateUserCache(fastify, userId) {
    try {
        // Make HTTP request to announcement service to invalidate cache
        const announcementServiceUrl = process.env.ANNOUNCEMENT_SERVICE_URL || "http://localhost:3003";
        
        // Use dynamic import for fetch in Node.js
        const { default: fetch } = await import("node-fetch");
        
        const response = await fetch(`${announcementServiceUrl}/api/v1/cache/invalidate/user/${userId}`, {
            method: "DELETE",
            headers: {
                "X-Service-Key": process.env.SERVICE_KEY || "matching-service-key",
            },
        });
        
        if (response.ok) {
            fastify.log.info(`🗑️ Successfully invalidated cache for user ${userId}`);
        } else {
            fastify.log.warn(`⚠️ Failed to invalidate cache for user ${userId}: ${response.status}`);
        }
    } catch (error) {
        fastify.log.error(`❌ Error invalidating cache for user ${userId}: ${error.message}`);
    }
}


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
            .findOne({ announcementId: announcementId });
    } catch (error) {
        throw new ServerError(`Error finding announcement by ID: ${error.message}`);
    }
}

/**
 * Update announcement with matched announcement objects containing ID and score
 * @param {Object} fastify - Fastify instance for database connection
 * @param {string} announcementId - ID of the announcement to update
 * @param {Array} matchedAnnouncementIds - Array of objects {announcementId, score} that match this announcement
 * @returns {Promise<Object>} The update result
 * @throws {ServerError} If there's an error during the database operation
 */
async function updateAnnouncementMatches(fastify, announcementId, matchedAnnouncementIds) {
    try {
        // Găsim anunțul pentru a obține userId-ul
        const announcement = await findAnnouncementById(fastify, announcementId);
        if (!announcement) {
            throw new ServerError(`Announcement ${announcementId} not found`);
        }

        // matchedAnnouncementIds este un array de obiecte [{announcementId, score}, ...]
        const updateResult = await fastify.mongoose.connection.db
            .collection("announcements")
            .updateOne(
                { announcementId: announcementId },
                {
                    $addToSet: { matches: { $each: matchedAnnouncementIds } },
                    $set: { updatedAt: new Date() },
                },
            );
        
        fastify.log.info(`📝 Updated announcement ${announcementId} with ${matchedAnnouncementIds.length} new matches (with scores)`);
        
        // Invalidăm cache-ul pentru user după actualizarea matches-urilor
        await invalidateUserCache(fastify, announcement.userId);
        
        return updateResult;
    } catch (error) {
        throw new ServerError(`Error updating announcement matches: ${error.message}`);
    }
}

export {
    findPotentialMatches,
    findAnnouncementById,
    updateAnnouncementMatches,
    invalidateUserCache,
};
