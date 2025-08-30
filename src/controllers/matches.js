import { findMatchesByAnnouncementId } from "../helpers/database.js";
import Match from "../models/Match.js";

/**
 * Get matches for a specific announcement
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function getAnnouncementMatches(request, reply) {
    try {
        const { announcementId } = request.params;
        const { status, minConfidence } = request.query;

        if (!announcementId) {
            return reply.status(400).send({
                success: false,
                message: "Announcement ID is required",
            });
        }

        // Get all matches for the announcement
        let matches = await findMatchesByAnnouncementId(announcementId);
        
        // Apply additional filters if provided
        if (status) {
            matches = matches.filter(match => match.status === status);
        }
        
        if (minConfidence) {
            const minConf = parseFloat(minConfidence);
            matches = matches.filter(match => match.confidence >= minConf);
        }

        reply.send({
            success: true,
            data: matches,
            count: matches.length,
        });

    } catch (error) {
        request.log.error("Error getting announcement matches:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
}

/**
 * Get all matches with pagination and filters
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 * @returns {Promise<void>}
 */
async function getAllMatchesHandler(request, reply) {
    try {
        const { page = 1, limit = 20, status, minConfidence } = request.query;
        
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build query filters
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (minConfidence) {
            filters.confidence = { $gte: parseFloat(minConfidence) };
        }

        // Get matches with pagination
        const matches = await Match.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalMatches = await Match.countDocuments(filters);

        reply.send({
            success: true,
            data: matches,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalMatches,
                totalPages: Math.ceil(totalMatches / limitNum),
            },
        });

    } catch (error) {
        request.log.error("Error getting all matches:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
}

export { getAnnouncementMatches, getAllMatchesHandler };
