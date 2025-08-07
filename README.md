# 🐾 matching_service

> Pet Finder Matching Service - AI-powered pet matching algorithms

## 📋 Overview

This is part of the Pet Finder microservices architecture. matching_service handles specific functionality within the distributed system for reuniting lost pets with their families.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the service
npm start

# Development mode with hot reload
npm run dev
```

## 🏗️ Architecture

This service is built with:
- **Framework:** Fastify (high performance Node.js framework)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens
- **Messaging:** Kafka for inter-service communication
- **Caching:** Redis for performance optimization

## 📊 API Endpoints

See the main documentation for detailed API endpoints and usage examples.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 🐳 Docker

```bash
# Build image
docker build -t petfinder/matching_service .

# Run container
docker run -p 3000:3000 petfinder/matching_service
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 3000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT signing secret | - |
| KAFKA_BROKERS | Kafka broker URLs | localhost:9092 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Services

- [Auth Service](https://github.com/PaulChelaru/petfinder-auth-service)
- [User Service](https://github.com/PaulChelaru/petfinder-user-service)
- [Announcement Service](https://github.com/PaulChelaru/petfinder-announcement-service)
- [Matching Service](https://github.com/PaulChelaru/petfinder-matching-service)

## 📞 Support

For questions and support, please open an issue in this repository.

---

> 🐾 **Pet Finder** - Reuniting families with their furry friends through technology.
