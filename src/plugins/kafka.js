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

        // Process announcement match events
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const announcement = JSON.parse(message.value.toString());
                    await processNewAnnouncement(fastify, announcement);
                } catch (error) {
                    // Log error but continue processing
                    await errorHandler(error, {
                        topic,
                        partition,
                        offset: message.offset,
                    });

                    // Continue to next message - don't throw
                    fastify.log.warn(`Skipped message at ${topic}:${partition}:${message.offset} due to error`);
                }
            },
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
