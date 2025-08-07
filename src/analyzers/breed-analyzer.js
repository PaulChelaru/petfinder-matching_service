import Fuse from "fuse.js";

/**
 * Simple breed analyzer using fuzzy search
 */

// Common breed names and their aliases
const breedDatabase = [
    { name: "Golden Retriever", aliases: ["golden", "retriever"] },
    { name: "Labrador", aliases: ["lab", "labrador retriever"] },
    { name: "German Shepherd", aliases: ["german", "shepherd"] },
    { name: "Beagle", aliases: ["beagle hound"] },
    { name: "Metis", aliases: ["mixed", "mix", "mélange", "mixt"] },
    { name: "Persian", aliases: ["persian cat"] },
    { name: "European", aliases: ["european cat"] },
];

// Initialize Fuse.js for fuzzy searching
const fuse = new Fuse(breedDatabase, {
    keys: ["name", "aliases"],
    threshold: 0.4,
    includeScore: true,
});

/**
 * Simple breed similarity analysis
 * @param {Object} announcement1 - First announcement
 * @param {Object} announcement2 - Second announcement
 * @returns {Object} Breed analysis result
 */
export function analyzeBreedSimilarity(announcement1, announcement2) {
    const breed1 = normalizeBreed(announcement1.breed);
    const breed2 = normalizeBreed(announcement2.breed);

    if (!breed1 || !breed2) {
        return {
            confidence: 0,
            reasoning: ["Missing breed data"],
            matchFactors: [],
        };
    }

    // Exact match
    if (breed1 === breed2) {
        return {
            confidence: 20,
            reasoning: ["Exact breed match"],
            matchFactors: ["exact_breed"],
        };
    }

    // Fuzzy search match
    const search1 = fuse.search(breed1);
    const search2 = fuse.search(breed2);

    if (search1.length > 0 && search2.length > 0) {
        const match1 = search1[0];
        const match2 = search2[0];

        if (match1.item.name === match2.item.name) {
            const confidence = Math.round((1 - (match1.score + match2.score) / 2) * 18);
            return {
                confidence,
                reasoning: [`Both breeds match "${match1.item.name}"`],
                matchFactors: ["fuzzy_breed"],
            };
        }
    }

    return {
        confidence: 0,
        reasoning: ["No breed match"],
        matchFactors: [],
    };
}

/**
 * Normalize breed name
 */
function normalizeBreed(breed) {
    if (!breed) {
        return null;
    }
    return breed.toLowerCase().trim().replace(/[-_\s]+/g, " ");
}
