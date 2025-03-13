// src/services/chatSocket.ts
import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types/socket.types';

class ChatSocketService {
  private static instance: ChatSocketService;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private currentRoom: string | null = null;

  private constructor() {}

  static getInstance(): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService();
    }
    return ChatSocketService.instance;
  }

  connect(token: string) {
    if (this.socket?.connected) return;

    const urlObj = new URL(
      import.meta.env.VITE_ADDONS_API_BASE_URL || 'http://localhost:3000'
    );

    this.socket = io(urlObj.origin, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      // Rejoin current room if any
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });
  }

  joinRoom(conversationId: string) {
    if (!this.socket?.connected) return;

    // Leave current room if any
    if (this.currentRoom) {
      this.socket.emit('leave-room', this.currentRoom);
    }

    this.socket.emit('join-room', conversationId, (response) => {
      console.log('Joined room', response);
    });
    this.currentRoom = conversationId;
  }

  leaveCurrentRoom() {
    if (!this.socket?.connected || !this.currentRoom) return;

    this.socket.emit('leave-room', this.currentRoom);
    this.currentRoom = null;
  }

  sendMessage(text: string) {
    if (!this.socket?.connected || !this.currentRoom) return;

    this.socket.emit('send-message', {
      conversationId: this.currentRoom,
      text,
    });
  }

  subscribeToMessages(callback: (message: any) => void) {
    if (!this.socket) return;

    this.socket.on('new-message', callback);
    return () => this.socket?.off('new-message', callback);
  }

  markMessagesAsRead(messageIds: string[]) {
    if (!this.socket?.connected || !this.currentRoom) return;

    this.socket.emit('mark-read', {
      conversationId: this.currentRoom,
      messageIds,
    });
  }

  disconnect() {
    if (this.currentRoom) {
      this.leaveCurrentRoom();
    }
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const chatSocket = ChatSocketService.getInstance();
