/* istanbul ignore file */

import util from "util";

/**
 * Abstract error type used to handle errors generated in the matching service.
 * The error has four fields:
 *  * `message` - `string`, a human readable description of the error
 *  * `error_code` - `number`, a code which uniquely identifies the error
 *  * `data` - `any`, additional error data
 *  * `status_code` - `number`, the HTTP status code of the response
 * @class
 * @abstract
 */
class CustomError extends Error {
    /**
     * @constructor
     * @param {String} message the message of the error
     * @param {number} error_code the code of the error, it always starts with 313
     * @param {Object} data additional data about the error
     * @param {Number} status_code HTTP status code to be returned to client
     */
    constructor (message, error_code, data, status_code) {
        if (new.target === CustomError) {
            throw new TypeError("Cannot instantiate abstract class CustomError");
        }

        super(message);
        this.data = data;
        this.status_code = status_code;
        this.error_code = error_code;
        Object.freeze(this);
    }

    get statusCode () {
        return this.status_code;
    }

    [util.inspect.custom] () {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            data: this.data,
            status_code: this.status_code,
            code: this.error_code,
        };
    }

    toJSON () {
        return {
            status: "error",
            error_code: this.error_code,
            message: this.message,
            data: this.data,
            status_code: this.status_code,
        };
    }
}

export default CustomError;
