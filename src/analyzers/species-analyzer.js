/**
 * Species Analysis Module
 *
 * Handles all species-related matching logic
 * Single responsibility: Species validation and normalization
 */

/**
 * Analyze species match - mandatory criterion
 * @param {Object} lostPet - Lost pet announcement
 * @param {Object} foundPet - Found pet announcement
 * @returns {Object} Species analysis result
 */
function analyzeSpeciesMatch(lostPet, foundPet) {
    const lostSpecies = normalizeSpecies(lostPet.species || lostPet.petType);
    const foundSpecies = normalizeSpecies(foundPet.species || foundPet.petType);

    if (lostSpecies === foundSpecies) {
        return {
            isMatch: true,
            confidence: 40,
            matchFactors: ["species_match"],
            reasoning: ["Aceeași specie de animal"],
        };
    } else {
        return {
            isMatch: false,
            confidence: 0,
            reasoning: "Specii diferite de animale",
            matchFactors: [],
            recommendations: ["Animalele sunt de specii diferite - nu este posibil să fie același animal"],
        };
    }
}

/**
 * Normalize species names to standard format
 * @param {string} species - Species name to normalize
 * @returns {string} Normalized species name
 */
function normalizeSpecies(species) {
    if (!species) {return "unknown";}

    const normalized = species.toLowerCase().trim();

    // Species mapping
    const speciesMap = {
        "dog": "câine",
        "câine": "câine",
        "caine": "câine",
        "cat": "pisică",
        "pisică": "pisică",
        "pisica": "pisică",
    };

    return speciesMap[normalized] || normalized;
}

export {
    analyzeSpeciesMatch,
    normalizeSpecies,
};
