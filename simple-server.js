/* eslint-env node */
const fastify = require('fastify')({ logger: true });

// Register CORS plugin
fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
});

// Mock matches data pentru testare
const mockMatches = [
    {
        matchId: 'match-1',
        sourceAnnouncementId: '81a6d980-81ab-4aad-be6d-547347e82c2f',
        targetAnnouncementId: 'found-ann-1',
        confidence: 0.85,
        factors: {
            species: 0.9,
            breed: 0.8,
            location: 0.75,
            time: 0.95,
        },
        matchedAnnouncement: {
            announcementId: 'found-ann-1',
            type: 'found',
            petName: 'Golden Retriever Găsit',
            petType: 'dog',
            description: 'Am găsit un golden retriever foarte prietenos în Centrul Vechi',
            locationName: 'Centrul Vechi, București',
            lastSeenDate: '2025-08-28T09:00:00.000Z',
            contactInfo: {
                phone: '0721555666',
                email: 'found@example.com',
            },
            images: [],
        },
        createdAt: '2025-08-29T16:15:00.000Z',
    },
    {
        matchId: 'match-2',
        sourceAnnouncementId: '81a6d980-81ab-4aad-be6d-547347e82c2f',
        targetAnnouncementId: 'found-ann-2',
        confidence: 0.72,
        factors: {
            species: 0.9,
            breed: 0.7,
            location: 0.6,
            time: 0.8,
        },
        matchedAnnouncement: {
            announcementId: 'found-ann-2',
            type: 'found',
            petName: 'Câine Găsit Parcul Universității',
            petType: 'dog',
            description: 'Câine golden retriever găsit în Parcul Universității, foarte blând',
            locationName: 'Parcul Universității, București',
            lastSeenDate: '2025-08-27T18:00:00.000Z',
            contactInfo: {
                phone: '0721777888',
                email: 'park@example.com',
            },
            images: [],
        },
        createdAt: '2025-08-29T16:14:00.000Z',
    },
];

// Routes
fastify.get('/v1/matches', async (request) => {
    const { page = 1, limit = 10, type } = request.query;
    
    let filteredMatches = mockMatches;
    
    if (type) {
        filteredMatches = mockMatches.filter(match => 
            match.matchedAnnouncement.type === type
        );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMatches = filteredMatches.slice(startIndex, endIndex);
    
    return {
        success: true,
        data: paginatedMatches,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredMatches.length,
            pages: Math.ceil(filteredMatches.length / limit),
        },
    };
});

fastify.get('/v1/matches/announcement/:announcementId', async (request) => {
    const { announcementId } = request.params;
    const { page = 1, limit = 10 } = request.query;
    
    const announcementMatches = mockMatches.filter(match => 
        match.sourceAnnouncementId === announcementId
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMatches = announcementMatches.slice(startIndex, endIndex);
    
    return {
        success: true,
        data: paginatedMatches,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: announcementMatches.length,
            pages: Math.ceil(announcementMatches.length / limit),
        },
    };
});

// Health check
fastify.get('/health', async () => {
    return { status: 'ok', service: 'matching-service', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3005, host: '0.0.0.0' });
        fastify.log.info('🚀 Matching service listening on port 3005');
    } catch (err) {
        fastify.log.error(err);
        throw err;
    }
};

start();
