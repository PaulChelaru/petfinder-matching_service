const fastify = require('fastify')({ logger: false });

// CORS
fastify.register(require('@fastify/cors'), {
    origin: true,
});

// Mock data
const mockData = [
    {
        matchId: 'match-1',
        sourceAnnouncementId: '81a6d980-81ab-4aad-be6d-547347e82c2f',
        confidence: 0.85,
        matchedAnnouncement: {
            announcementId: 'found-ann-1',
            type: 'found',
            petName: 'Golden Retriever Găsit',
            description: 'Am găsit un golden retriever foarte prietenos în Centrul Vechi',
            locationName: 'Centrul Vechi, București',
            lastSeenDate: '2025-08-28T09:00:00.000Z',
        }
    },
    {
        matchId: 'match-2',
        sourceAnnouncementId: '81a6d980-81ab-4aad-be6d-547347e82c2f',
        confidence: 0.72,
        matchedAnnouncement: {
            announcementId: 'found-ann-2',
            type: 'found',
            petName: 'Câine Găsit Parcul Universității',
            description: 'Câine golden retriever găsit în Parcul Universității',
            locationName: 'Parcul Universității, București',
            lastSeenDate: '2025-08-27T18:00:00.000Z',
        }
    }
];

// Routes
fastify.get('/v1/matches/announcement/:announcementId', async (request) => {
    const { announcementId } = request.params;
    
    const matches = mockData.filter(match => 
        match.sourceAnnouncementId === announcementId
    );
    
    return {
        success: true,
        data: matches,
        pagination: { total: matches.length, page: 1, limit: 10, pages: 1 }
    };
});

fastify.get('/health', async () => {
    return { status: 'ok' };
});

// Start
fastify.listen({ port: 3005, host: '0.0.0.0' }, (err) => {
    if (err) throw err;
    console.log('Matching service ready on port 3005');
});
