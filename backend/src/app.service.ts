import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Manufacturing Equipment Maintenance Query Agent API';
  }
}

