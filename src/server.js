import Fastify from "fastify";
import * as uuid from "uuid";

// Add error handling to plugin registration
async function build() {
    const app = Fastify({
        logger: {
            level: "info",
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname",
                },
            },
        },
        genReqId: uuid.v4,
    });

    try {
    // Register env plugin first
        await app.register(import("./plugins/env.js"));

        // Then register other plugins that depend on env
        await app.register(import("./plugins/mongoose.js"));
        await app.register(import("./plugins/kafka.js"));

        return app;
    } catch (error) {
        console.error("Error during Fastify app build:", error);
        throw error;
    }

}

build()
    .then(app => {
        if (app) {
            app.log.info("Pet matching service active");
        } else {
            console.error("Failed to build Fastify app");
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
