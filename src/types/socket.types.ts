// src/types/socket.types.ts
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ServerToClientEvents {
  'new-message': (message: Message) => void;
  'message-status': (data: {
    messageId: string;
    status: Message['status'];
  }) => void;
  'typing-status': (data: { userId: string; isTyping: boolean }) => void;
  'user-status': (data: { userId: string; isOnline: boolean }) => void;
}

export interface ClientToServerEvents {
  'join-room': (
    conversationId: string,
    callback?: (response: any) => void
  ) => void;
  'leave-room': (conversationId: string) => void;
  'send-message': (data: { conversationId: string; text: string }) => void;
  'mark-read': (data: { conversationId: string; messageIds: string[] }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
}
