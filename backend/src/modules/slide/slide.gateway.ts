import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class SlideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastResult(result: {
    gameId: string;
    userId: string;
    userNumber: number;
    targetNumber: number;
    isWinner: boolean;
    mode: string;
  }) {
    this.server.emit('slide-result', result);
  }

  broadcastNewTarget(targetNumber: number) {
    this.server.emit('new-target', { targetNumber });
  }
}
