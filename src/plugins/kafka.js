import FastifyPlugin from "fastify-plugin";
import { Kafka } from "kafkajs";
import {processNewAnnouncement} from "../helpers/matches.js";
import {errorHandler} from "../errors/errorHandler.js";

/**
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} options
 */
async function connectToKafka(fastify) {
    try {
        const brokers = fastify.config.KAFKA_BROKERS.split(",");

        const kafkaConfig = {
            clientId: fastify.config.KAFKA_CLIENT_ID,
            brokers,
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        };

        // Add SASL authentication if credentials are provided
        if (fastify.config.KAFKA_USERNAME && fastify.config.KAFKA_PASSWORD) {
            kafkaConfig.sasl = {
                mechanism: "plain",
                username: fastify.config.KAFKA_USERNAME,
                password: fastify.config.KAFKA_PASSWORD,
            };
        }

        const kafka = new Kafka(kafkaConfig);

        // Create consumer for announcement events
        const consumer = kafka.consumer({
            groupId: fastify.config.KAFKA_CONSUMER_GROUP,
        });

        // Connect consumer
        await consumer.connect();

        // Subscribe to announcement events
        await consumer.subscribe({
            topics: ["announcement_created"],
        });
        
        fastify.log.info("🎯 Kafka consumer subscribed to announcement_created topic");

        // Process announcement match events (non-blocking)
        consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    fastify.log.info(`📨 Received Kafka message from ${topic}:${partition}:${message.offset}`);
                    const messageValue = message.value.toString();
                    fastify.log.info(`📨 Message content: ${messageValue}`);
                    
                    const announcement = JSON.parse(messageValue);
                    fastify.log.info(`🔍 Processing announcement: ${announcement.announcementId || announcement._id}`);
                    
                    await processNewAnnouncement(fastify, announcement);
                    
                    fastify.log.info(`✅ Successfully processed announcement: ${announcement.announcementId || announcement._id}`);
                } catch (error) {
                    // Log error but continue processing
                    fastify.log.error(`❌ Error processing Kafka message: ${error.message}`);
                    await errorHandler(error, {
                        topic,
                        partition,
                        offset: message.offset,
                    });

                    // Continue to next message - don't throw
                    fastify.log.warn(`⚠️ Skipped message at ${topic}:${partition}:${message.offset} due to error`);
                }
            },
        }).catch(error => {
            fastify.log.error(`❌ Kafka consumer error: ${error.message}`);
        });

        // Decorate fastify with Kafka consumer
        fastify.decorate("kafka", {
            consumer,
        });

        fastify.log.info("Connected to Kafka");

        // Handle graceful shutdown
        fastify.addHook("onClose", async (instance, done) => {
            try {
                await consumer.disconnect();
                fastify.log.info("Kafka consumer connection closed");
                done();
            } catch (error) {
                fastify.log.error("Error closing Kafka consumer connection:", error);
                done(error);
            }
        });

    } catch (error) {
        fastify.log.error(`Failed to connect to Kafka: ${error.message}`);
        throw error;
    }
}

export default FastifyPlugin(connectToKafka, {
    name: "kafka",
});
