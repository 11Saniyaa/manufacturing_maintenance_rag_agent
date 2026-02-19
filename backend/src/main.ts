import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for Angular frontend
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || 3000;
  const llmProvider = process.env.LLM_PROVIDER || 'lmstudio';
  const llmBaseUrl = process.env.LLM_BASE_URL || 'http://localhost:1234/v1';
  
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`🤖 LLM Provider: ${llmProvider}`);
  console.log(`🔗 LLM Base URL: ${llmBaseUrl}`);
  console.log(`💡 To change LLM provider, set LLM_PROVIDER environment variable (lmstudio or openai)`);
  console.log(`📖 See README.md for setup instructions`);
}

bootstrap();

