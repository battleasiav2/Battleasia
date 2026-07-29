/* eslint-disable import/no-extraneous-dependencies */
import { io, Socket } from 'socket.io-client';
import { store } from 'src/store';

class SocketService {
  private socket: Socket | null = null;

  private reconnectAttempts = 0;

  private maxReconnectAttempts = 5;

  private messageCallback: ((message: any) => void) | null = null;

  private typingCallback: ((data: any) => void) | null = null;

  private isConnecting = false;

  connect(serverUrl: string) {
    if (this.socket?.connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return;
    }

    const state = store.getState() as any;
    const token = state.auth.token;

    if (!token) {
      return;
    }

    this.isConnecting = true;

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts += 1;
      this.isConnecting = false;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    if (!this.socket) {
      return;
    }

    if (!this.socket.connected) {
      this.socket.once('connect', () => {
        this.socket!.emit('join-conversation', conversationId);
      });
      return;
    }

    this.socket.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      if (this.messageCallback) {
        this.socket.off('new-message', this.messageCallback);
      }
      
      this.messageCallback = (message: any) => {
        callback(message);
      };
      
      this.socket.on('new-message', this.messageCallback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      if (this.typingCallback) {
        this.socket.off('user-typing', this.typingCallback);
      }
      
      this.typingCallback = callback;
      this.socket.on('user-typing', this.typingCallback);
    }
  }

  offNewMessage() {
    if (this.socket && this.messageCallback) {
      this.socket.off('new-message', this.messageCallback);
      this.messageCallback = null;
    }
  }

  offUserTyping() {
    if (this.socket && this.typingCallback) {
      this.socket.off('user-typing', this.typingCallback);
      this.typingCallback = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
