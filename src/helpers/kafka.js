import {
    processNewAnnouncement,
} from "./matches.js";
import {
    findAnnouncementById,
} from "./announcements.js";
import { KafkaError } from "../errors/index.js";

/**
 * Process a new announcement from Kafka and save matching results to database
 * @param {Object} fastify - Fastify instance
 * @param {Object} message - Kafka message data
 */
async function processAnnouncementMessage(fastify, message) {
    try {

        console.log(message)
        const { announcementId } = message;
        fastify.log.info(`📥 Processing announcement ${announcementId} for matching`);

        // Find the announcement in the database using the database helper
        const announcement = await findAnnouncementById(fastify, announcementId);

        if (!announcement) {
            const error = new KafkaError(`Announcement ${announcementId} not found in database`);
            fastify.log.error(error.message);
            throw error;
        }

        // Process announcement for matching using the helper
        await processNewAnnouncement(fastify, announcement);

        fastify.log.info(`✅ Successfully processed announcement ${announcementId}`);
    } catch (error) {
        // Log the error with proper formatting
        if (error instanceof KafkaError) {
            fastify.log.error(`❌ Kafka processing error: ${error.message}`);
        } else {
            fastify.log.error("❌ Unexpected error processing announcement message:", error);
        }
        // Don't throw - we don't want to crash the consumer for individual message failures
    }
}

export {
    processAnnouncementMessage,
};
