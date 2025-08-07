import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "test-producer",
    brokers: ["localhost:9094"],
    sasl: {
        mechanism: "plain",
        username: "petfinder",
        password: "petfinder123",
    },
});

const producer = kafka.producer();

async function sendTestMessage() {
    try {
        await producer.connect();
        console.log("✅ Connected to Kafka");

        // Mesaj de test pentru un anunț pierdut
        const testAnnouncement = {
            _id: "test-lost-123",
            type: "lost",
            petType: "dog", // Adăugat petType pentru compatibilitate cu query
            species: "câine", // Română pentru compatibilitate cu baza de date
            breed: "Golden Retriever",
            location: {
                coordinates: [44.4268, 26.1025], // București
                address: "Piața Universității, București"
            },
            lastSeenDate: new Date().toISOString(),
            description: "Câine Golden Retriever pierdut, foarte prieten cu copiii",
            photos: ["photo1.jpg"],
            contactInfo: {
                phone: "0742123456",
                email: "test@example.com"
            },
            status: "active" // Adăugat status pentru completitudine
        };

        console.log("📤 Sending test message:", JSON.stringify(testAnnouncement, null, 2));

        await producer.send({
            topic: "announcement-match",
            messages: [
                {
                    key: testAnnouncement._id,
                    value: JSON.stringify(testAnnouncement),
                }
            ],
        });

        console.log("✅ Message sent successfully");
        
        // Așteaptă un pic pentru processing
        await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await producer.disconnect();
        console.log("🔌 Disconnected from Kafka");
    }
}

sendTestMessage();
