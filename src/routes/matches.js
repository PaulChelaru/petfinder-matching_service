/* istanbul ignore file */
import { getAnnouncementMatches, getAllMatchesHandler } from "../controllers/matches.js";

/**
 * Fastify plugin that registers the match routes
 * @param {import("fastify").FastifyInstance} fastify
 */
async function matchRoutes(fastify) {
    // Get matches for a specific announcement
    fastify.get(
        "/announcements/:announcementId/matches",
        {
            schema: {
                params: {
                    type: "object",
                    properties: {
                        announcementId: { type: "string" },
                    },
                    required: ["announcementId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["pending", "confirmed", "rejected"] },
                        minConfidence: { type: "number", minimum: 0, maximum: 100 },
                    },
                },
            },
        },
        getAnnouncementMatches,
    );

    // Get all matches with pagination
    fastify.get(
        "/matches",
        {
            schema: {
                querystring: {
                    type: "object",
                    properties: {
                        page: { type: "number", minimum: 1, default: 1 },
                        limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
                        status: { type: "string", enum: ["pending", "confirmed", "rejected"] },
                        minConfidence: { type: "number", minimum: 0, maximum: 100 },
                    },
                },
            },
        },
        getAllMatchesHandler,
    );
}

export default matchRoutes;
