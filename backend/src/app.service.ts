import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'bv-barker-inventarios-api',
      version: '0.0.1',
    };
  }
}
