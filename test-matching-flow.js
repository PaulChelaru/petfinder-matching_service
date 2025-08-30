#!/usr/bin/env node

/**
 * Test script pentru matching service flow
 * Creează anunțuri care ar trebui să aibă matches și verifică în DB
 */

const API_BASE = 'http://localhost:3003/v1/announcements';

// Token pentru autentificare (extrage din localStorage sau cookie)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQzOWVlNmM4YjEyN2Y2NWQwZGNhOTgiLCJlbWFpbCI6InBhdWxAcGV0ZmluZGVyLmNvbSIsImlhdCI6MTcyNTA3NzAzMSwiZXhwIjoxNzI1MjQ5ODMxfQ.xBMQYb5BdX3PdNi6u3YjGE2CzVNHSnH7QFUJWLOy3rA';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAnnouncement(announcementData) {
    console.log(`🚀 Creating ${announcementData.type} announcement: ${announcementData.petName}`);
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(announcementData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ Created announcement: ${result.announcement.announcementId}`);
        return result.announcement;
    } catch (error) {
        console.error(`❌ Failed to create announcement: ${error.message}`);
        throw error;
    }
}

async function testMatchingFlow() {
    console.log('🧪 Starting matching service test...\n');

    try {
        // 1. Creează un anunț "pierdut" pentru un Golden Retriever
        const lostDog = await createAnnouncement({
            type: 'lost',
            petName: 'Rex',
            petType: 'dog',
            species: 'canine',
            breed: 'Golden Retriever',
            color: 'golden',
            age: '3 ani',
            description: 'Câine foarte prietenos, poartă zgardă albastră. Răspunde la numele Rex.',
            locationName: 'Parcul Herăstrău, București',
            locationDetails: 'Lângă lacul din parc, zona de joggin',
            lastSeenDate: new Date().toISOString(),
            contactInfo: {
                email: 'owner@test.com',
                phone: '+40123456789',
                preferredMethod: 'phone'
            }
        });

        // Așteaptă 2 secunde pentru procesarea Kafka
        console.log('⏱️ Waiting 3 seconds for Kafka processing...\n');
        await delay(3000);

        // 2. Creează un anunț "găsit" care ar trebui să facă match
        const foundDog = await createAnnouncement({
            type: 'found',
            petName: 'Câine golden găsit',
            petType: 'dog',
            species: 'canine',
            breed: 'Golden Retriever',
            color: 'golden',
            age: 'adult',
            description: 'Câine golden retriever găsit cu zgardă albastră, foarte blând și prietenos.',
            locationName: 'Parcul Herăstrău, București',
            locationDetails: 'Găsit în zona de joggin din parc',
            lastSeenDate: new Date().toISOString(),
            contactInfo: {
                email: 'finder@test.com',
                phone: '+40987654321',
                preferredMethod: 'email'
            }
        });

        // Așteaptă 2 secunde pentru procesarea Kafka
        console.log('⏱️ Waiting 3 seconds for Kafka processing...\n');
        await delay(3000);

        // 3. Creează un alt anunț "găsit" cu altă rasă (nu ar trebui să facă match)
        const foundCat = await createAnnouncement({
            type: 'found',
            petName: 'Pisică persană găsită',
            petType: 'cat',
            species: 'feline',
            breed: 'Persian',
            color: 'alb',
            age: '1 an',
            description: 'Pisică persană albă, foarte frumoasă și blândă.',
            locationName: 'Centrul Vechi, București',
            locationDetails: 'Găsită pe strada Lipscani',
            lastSeenDate: new Date().toISOString(),
            contactInfo: {
                email: 'catfinder@test.com',
                phone: '+40111222333',
                preferredMethod: 'email'
            }
        });

        console.log('\n🎯 Test announcements created successfully!');
        console.log(`Lost dog ID: ${lostDog.announcementId}`);
        console.log(`Found dog ID: ${foundDog.announcementId}`);
        console.log(`Found cat ID: ${foundCat.announcementId}`);
        
        console.log('\n📊 Expected matches:');
        console.log(`- Lost dog "${lostDog.petName}" should match with found dog "${foundDog.petName}"`);
        console.log(`- No match should exist between lost dog and found cat`);

        console.log('\n💡 Next steps:');
        console.log('1. Check matching service logs for Kafka message processing');
        console.log('2. Query MongoDB to verify matches were saved');
        console.log('3. Test matches API endpoint: GET http://localhost:3005/v1/matches');

    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the test
testMatchingFlow();
