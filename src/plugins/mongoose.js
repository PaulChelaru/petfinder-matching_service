import FastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";

async function initMongoDB(fastify) {
    try {
        await mongoose.connect(fastify.config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        fastify.decorate("mongoose", mongoose);

        // Graceful shutdown
        fastify.addHook("onClose", async () => {
            await mongoose.connection.close();
            fastify.log.info("MongoDB connection closed");
        });

        fastify.log.info("Connected to MongoDB");
    } catch (error) {
        fastify.log.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

export default FastifyPlugin(initMongoDB, {
    name: "mongoose",
});
