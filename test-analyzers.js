import { analyzeBreedSimilarity } from "./src/analyzers/breed-analyzer.js";
import { analyzeLocationProximity } from "./src/analyzers/location-analyzer.js";
import { analyzeSpeciesMatch } from "./src/analyzers/species-analyzer.js";

// Test data
const lostPet = {
    _id: "lost-123",
    type: "lost",
    petType: "dog",
    species: "câine",
    breed: "Golden Retriever",
    location: {
        coordinates: [26.1025, 44.4268], // Bucharest coordinates [lng, lat]
        address: "Piața Universității, București"
    },
    lastSeenDate: new Date("2025-07-31"),
};

const foundPet = {
    _id: "found-456",
    type: "found",
    petType: "dog",
    species: "câine",
    breed: "golden",
    location: {
        coordinates: [26.1100, 44.4300], // Nearby Bucharest coordinates
        address: "Calea Victoriei, București"
    },
    foundDate: new Date("2025-08-01"),
};

console.log("🧪 Testing Analyzers\n");

// Test species matching
console.log("1. Species Analysis:");
const speciesResult = analyzeSpeciesMatch(lostPet, foundPet);
console.log(`   Confidence: ${speciesResult.confidence}%`);
console.log(`   Reasoning: ${speciesResult.reasoning.join(", ")}`);
console.log("");

// Test breed matching
console.log("2. Breed Analysis:");
const breedResult = analyzeBreedSimilarity(lostPet, foundPet);
console.log(`   Confidence: ${breedResult.confidence}%`);
console.log(`   Reasoning: ${breedResult.reasoning.join(", ")}`);
console.log(`   Match Factors: ${breedResult.matchFactors.join(", ")}`);
console.log("");

// Test location matching
console.log("3. Location Analysis:");
const locationResult = analyzeLocationProximity(lostPet, foundPet);
console.log(`   Confidence: ${locationResult.confidence}%`);
console.log(`   Distance: ${locationResult.distance?.toFixed(2)} km`);
console.log(`   Reasoning: ${locationResult.reasoning.join(", ")}`);
console.log(`   Match Factors: ${locationResult.matchFactors.join(", ")}`);
console.log("");

// Calculate total match confidence
const totalConfidence = speciesResult.confidence + breedResult.confidence + locationResult.confidence;
console.log("4. Overall Match Score:");
console.log(`   Total Confidence: ${totalConfidence}%`);
console.log(`   Match Quality: ${totalConfidence >= 60 ? "HIGH" : totalConfidence >= 40 ? "MEDIUM" : "LOW"}`);

console.log("\n✅ Analyzers Test Complete");
