/* istanbul ignore file */

import CustomError from "./custom_error.js";
import {
    SERVER_ERROR,
    EXTERNAL_RESOURCE_ERROR,
    KAFKA_ERROR,
    MATCHING_ERROR,
    DATABASE_ERROR,
} from "./codes.js";

/**
 * Generic error returned when server cannot process
 * the request due to unexpected errors. It sets the
 * HTTP status code of the response to `500`.
 * @class
 */
class ApplicationError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {Number} error_code code of the error
     * @param {*} [data={}] additional error data
     */
    constructor (message, error_code, data = {}) {
        super(message, error_code, data, 500);
    }
}

/**
 * Error returned when an external resource (mongo, redis,
 * kafka etc) returns an error. It sets the HTTP status
 * code to `500`, the error message to `Server error` and
 * the error code to `SERVER_ERROR`.
 * @class
 */
class ServerError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {*} [data={}] additional error data
     */
    constructor (message, data = {}) {
        super(message, SERVER_ERROR, data, 500);
    }
}

/**
 * Error returned when an external resource fails.
 * @class
 */
class ExternalResourceError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {*} error the original error
     * @param {*} [data={}] additional error data
     */
    constructor (message, error, data = {}) {
        super(message, EXTERNAL_RESOURCE_ERROR, { ...data, originalError: error?.message }, 502);
    }
}

/**
 * Error returned when Kafka operations fail.
 * @class
 */
class KafkaError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {*} [data={}] additional error data
     */
    constructor (message, data = {}) {
        super(message, KAFKA_ERROR, data, 503);
    }
}

/**
 * Error returned when matching operations fail.
 * @class
 */
class MatchingError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {*} [data={}] additional error data
     */
    constructor (message, data = {}) {
        super(message, MATCHING_ERROR, data, 500);
    }
}

/**
 * Error returned when database operations fail.
 * @class
 */
class DatabaseError extends CustomError {
    /**
     * @constructor
     * @param {String} message message of the error
     * @param {*} [data={}] additional error data
     */
    constructor (message, data = {}) {
        super(message, DATABASE_ERROR, data, 500);
    }
}

export {
    ApplicationError,
    ServerError,
    ExternalResourceError,
    KafkaError,
    MatchingError,
    DatabaseError,
};
