/**
 * Simple Kafka error logger.
 * Logs errors without stopping execution.
 */
export async function errorHandler(error, context = {}) {
    const {topic, partition, offset} = context;

    // Log the error with full context
    console.error("Kafka processing error:", {
        message: error.message,
        name: error.name,
        code: error.code,
        topic,
        partition,
        offset,
        timestamp: new Date().toISOString(),
        stack: error.stack,
    });

    // Always continue processing - never throw
    return {
        logged: true,
    };
}
