/* eslint-env node */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data pentru matches
const mockMatches = [
    {
        matchId: 'match-1',
        confidence: 0.85,
        matchedAnnouncement: {
            announcementId: 'ann-2',
            petName: 'Buddy',
            type: 'found',
            description: 'Câine golden retriever găsit în parcul central, foarte prietenos și pare să caute pe cineva.',
            locationName: 'Parcul Central, București',
            lastSeenDate: '2025-08-28T14:00:00.000Z',
            images: [
                {
                    url: '/api/v1/images/buddy-1.jpg',
                    alt: 'Golden retriever găsit',
                },
            ],
        },
        factors: {
            species: 0.95,
            breed: 0.90,
            location: 0.75,
            time: 0.80,
            color: 0.85,
        },
    },
    {
        matchId: 'match-2',
        confidence: 0.72,
        matchedAnnouncement: {
            announcementId: 'ann-3',
            petName: 'Max',
            type: 'found',
            description: 'Câine de talie medie găsit pe Calea Victoriei, poartă zgardă albastră.',
            locationName: 'Calea Victoriei, București',
            lastSeenDate: '2025-08-27T16:30:00.000Z',
            images: [],
        },
        factors: {
            species: 0.95,
            breed: 0.60,
            location: 0.65,
            time: 0.70,
            color: 0.80,
        },
    },
    {
        matchId: 'match-3',
        confidence: 0.65,
        matchedAnnouncement: {
            announcementId: 'ann-4',
            petName: 'Luna',
            type: 'found',
            description: 'Câine femela găsită în zona Universității, pare speriată dar prietenoasă.',
            locationName: 'Piața Universității, București',
            lastSeenDate: '2025-08-26T09:15:00.000Z',
            images: [
                {
                    url: '/api/v1/images/luna-1.jpg',
                    alt: 'Câine femela găsit',
                },
            ],
        },
        factors: {
            species: 0.95,
            breed: 0.50,
            location: 0.60,
            time: 0.55,
            color: 0.70,
        },
    },
];

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'matching-service', timestamp: new Date().toISOString() });
});

app.get('/v1/matches', (req, res) => {
    const { page = 1, limit = 10, type } = req.query;
    
    let filteredMatches = mockMatches;
    if (type) {
        filteredMatches = mockMatches.filter(match => match.matchedAnnouncement.type === type);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMatches = filteredMatches.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedMatches,
        pagination: {
            total: filteredMatches.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredMatches.length / limit),
            hasNext: endIndex < filteredMatches.length,
            hasPrev: page > 1,
        },
    });
});

app.get('/v1/matches/announcement/:announcementId', (req, res) => {
    // Pentru demo, returnăm matches pentru orice announcement ID
    const { page = 1, limit = 10 } = req.query;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMatches = mockMatches.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedMatches,
        pagination: {
            total: mockMatches.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(mockMatches.length / limit),
            hasNext: endIndex < mockMatches.length,
            hasPrev: page > 1,
        },
    });
});

// Error handling
app.use((err, req, res) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Mock Matching Service listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Matches endpoint: http://localhost:${PORT}/v1/matches`);
});

module.exports = app;
