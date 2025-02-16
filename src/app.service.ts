import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "<H1>If you are seeing this, the server is running!</H1>";
  }
}
