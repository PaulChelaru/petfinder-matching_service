import FastifyPlugin from "fastify-plugin";
import FastifyEnv from "@fastify/env";

const schema = {
    type: "object",
    required: [
        "PORT", "MONGODB_URI",
        "KAFKA_BROKERS", "KAFKA_USERNAME", "KAFKA_PASSWORD",
    ],
    properties: {
        PORT: { type: "string", default: "3005" },
        NODE_ENV: { type: "string", default: "development" },
        LOG_LEVEL: { type: "string", default: "info" },
        MONGODB_URI: { type: "string" },
        KAFKA_BROKERS: { type: "string", default: "localhost:9094" },
        KAFKA_CLIENT_ID: { type: "string", default: "matching-service" },
        KAFKA_USERNAME: { type: "string", default: "petfinder" },
        KAFKA_PASSWORD: { type: "string", default: "petfinder123" },
        KAFKA_CONSUMER_GROUP: { type: "string", default: "matching-service-group" },
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
