import FastifyPlugin from "fastify-plugin";
import FastifyEnv from "@fastify/env";

const schema = {
    type: "object",
    required: [
        "PORT", "MONGODB_URI",
        "KAFKA_BROKERS",
    ],
    properties: {
        PORT: { type: "string", default: "3005" },
        NODE_ENV: { type: "string", default: "development" },
        LOG_LEVEL: { type: "string", default: "info" },
        MONGODB_URI: { type: "string" },
        KAFKA_BROKERS: { type: "string", default: "localhost:9092" },
        KAFKA_CLIENT_ID: { type: "string", default: "matching-service" },
        KAFKA_USERNAME: { type: "string" },
        KAFKA_PASSWORD: { type: "string" },
        KAFKA_CONSUMER_GROUP: { type: "string", default: "matching-service-group" },
        MATCHING_MAX_DISTANCE: { type: "number", default: 50000 },
        MATCHING_DAYS_BEFORE: { type: "number", default: 30 },
        MATCHING_DAYS_AFTER: { type: "number", default: 30 },
    },
};

async function initConfig(fastify) {
    const options = {
        schema,
        dotenv: true,
        data: process.env,
    };
    await fastify.register(FastifyEnv, options);

    // Add a config decorator that points to env for backward compatibility
    if (!fastify.hasDecorator("config")) {
        fastify.decorate("config", fastify.env);
    }
}

export default FastifyPlugin(initConfig);
