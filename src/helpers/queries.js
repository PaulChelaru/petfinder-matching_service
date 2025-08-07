/**
 * Build base query for finding potential matches
 * @param {Object} announcement - Announcement data
 * @returns {Object} Base MongoDB query
 */
function buildBaseMatchQuery(announcement) {
    const oppositeType = announcement.type === "lost" ? "found" : "lost";

    return {
        type: oppositeType,
        species: announcement.petType === "dog" ? "câine" : "pisică",
        status: "active",
    };
}

/**
 * Add location filter to query if coordinates are available
 * @param {Object} query - MongoDB query object to modify
 * @param {Object} announcement - Announcement data
 */
function addLocationFilterToQuery(query, announcement) {
    if (announcement.location?.coordinates) {
        const [lng, lat] = announcement.location.coordinates;
        query["location.coordinates"] = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: 50000, // 50km radius
            },
        };
    }
}

/**
 * Add date filter to query for logical timing
 * @param {Object} query - MongoDB query object to modify
 * @param {Object} announcement - Announcement data
 */
function addDateFilterToQuery(query, announcement) {
    if (announcement.lastSeenDate) {
        const announcementDate = new Date(announcement.lastSeenDate);
        const thirtyDaysAgo = new Date(announcementDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const thirtyDaysLater = new Date(announcementDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        query.lastSeenDate = {
            $gte: thirtyDaysAgo,
            $lte: thirtyDaysLater,
        };
    }
}

/**
 * Build query for finding matches by breed similarity
 * @param {string} breed - Breed to match
 * @returns {Object} Breed query filter
 */
function buildBreedQuery(breed) {
    if (!breed) {return {};}

    const normalizedBreed = breed.toLowerCase().trim();

    return {
        $or: [
            { breed: { $regex: normalizedBreed, $options: "i" } },
            { breed: { $regex: normalizedBreed.split(" ")[0], $options: "i" } },
        ],
    };
}

/**
 * Build geospatial query for location-based matching
 * @param {Object} coordinates - Coordinates array [lng, lat]
 * @param {number} maxDistance - Maximum distance in meters (default: 50km)
 * @returns {Object} Geospatial query
 */
function buildLocationQuery(coordinates, maxDistance = 50000) {
    if (!coordinates || coordinates.length !== 2) {
        return {};
    }

    const [lng, lat] = coordinates;

    return {
        "location.coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                $maxDistance: maxDistance,
            },
        },
    };
}

/**
 * Build time-based query for temporal matching
 * @param {Date|string} date - Reference date
 * @param {number} daysBefore - Days before reference date
 * @param {number} daysAfter - Days after reference date
 * @returns {Object} Time-based query
 */
function buildTimeQuery(date, daysBefore = 30, daysAfter = 30) {
    if (!date) {return {};}

    const referenceDate = new Date(date);
    const startDate = new Date(referenceDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    const endDate = new Date(referenceDate.getTime() + daysAfter * 24 * 60 * 60 * 1000);

    return {
        lastSeenDate: {
            $gte: startDate,
            $lte: endDate,
        },
    };
}

/**
 * Combine multiple query filters
 * @param {Array<Object>} filters - Array of query filter objects
 * @returns {Object} Combined query
 */
function combineQueryFilters(filters) {
    const validFilters = filters.filter(filter =>
        filter && Object.keys(filter).length > 0,
    );

    if (validFilters.length === 0) {return {};}
    if (validFilters.length === 1) {return validFilters[0];}

    return {
        $and: validFilters,
    };
}

/**
 * Build complete match query with all filters
 * @param {Object} announcement - Announcement to find matches for
 * @param {Object} options - Query options
 * @returns {Object} Complete MongoDB query
 */
function buildCompleteMatchQuery(announcement, options = {}) {
    const filters = [];

    // Base query (type, species, status)
    filters.push(buildBaseMatchQuery(announcement));

    // Location filter
    if (announcement.location?.coordinates && !options.skipLocation) {
        filters.push(buildLocationQuery(
            announcement.location.coordinates,
            options.maxDistance,
        ));
    }

    // Time filter
    if (announcement.lastSeenDate && !options.skipTime) {
        filters.push(buildTimeQuery(
            announcement.lastSeenDate,
            options.daysBefore,
            options.daysAfter,
        ));
    }

    // Breed filter
    if (announcement.breed && !options.skipBreed) {
        filters.push(buildBreedQuery(announcement.breed));
    }

    return combineQueryFilters(filters);
}

export {
    buildBaseMatchQuery,
    addLocationFilterToQuery,
    addDateFilterToQuery,
    buildBreedQuery,
    buildLocationQuery,
    buildTimeQuery,
    combineQueryFilters,
    buildCompleteMatchQuery,
};
