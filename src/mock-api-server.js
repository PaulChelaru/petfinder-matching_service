import fastify from "fastify";
import cors from "@fastify/cors";

const app = fastify({ logger: true });

// Mock matches data
const mockMatches = [
    {
        matchId: "mock-match-1",
        confidence: 0.85,
        matchedAnnouncement: {
            announcementId: "found-ann-1",
            type: "found",
            petName: "Golden Retriever găsit",
            description: "Câine golden retriever prietenos găsit în parc",
            locationName: "Parcul Herăstrău, București",
            lastSeenDate: "2025-08-28T14:00:00.000Z",
            images: [{
                url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
                alt: "Golden Retriever",
            }],
        },
        factors: {
            species: 0.9,
            breed: 0.85,
            location: 0.75,
            time: 0.8,
        },
    },
    {
        matchId: "mock-match-2",
        confidence: 0.72,
        matchedAnnouncement: {
            announcementId: "found-ann-2",
            type: "found",
            petName: "Câine maro găsit",
            description: "Câine de talie medie, foarte blând",
            locationName: "Centrul Vechi, București",
            lastSeenDate: "2025-08-27T10:30:00.000Z",
            images: [{
                url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
                alt: "Câine maro",
            }],
        },
        factors: {
            species: 0.9,
            breed: 0.6,
            location: 0.9,
            time: 0.7,
        },
    },
];

// Enable CORS
app.register(cors, {
    origin: true,
});

// Health check
app.get("/health", async () => {
    return { status: "ok", service: "matching-mock-api" };
});

// Get matches for specific announcement
app.get("/v1/matches/announcement/:announcementId", async () => {
    // Simulate some processing time - no timeout needed for simplicity
    return {
        success: true,
        data: mockMatches,
        pagination: {
            total: mockMatches.length,
            page: 1,
            limit: 10,
            pages: 1,
        },
    };
});

// Get all matches
app.get("/v1/matches", async (request) => {
    const { page = 1, limit = 10 } = request.query;
    
    return {
        success: true,
        data: mockMatches,
        pagination: {
            total: mockMatches.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 1,
        },
    };
});

// Start server
const start = async () => {
    try {
        await app.listen({ port: 3005, host: "0.0.0.0" });
        console.log("🎯 Mock Matching API server listening on port 3005");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
