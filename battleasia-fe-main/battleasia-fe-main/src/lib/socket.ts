import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { store } from 'src/store';

function resolveSocketUrl(serverUrl: string) {
  if (serverUrl && serverUrl.length > 0) {
    return serverUrl;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

class SocketService {
  private socket: Socket | null = null;
  private publicSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = Infinity;
  private messageCallback: ((message: any) => void) | null = null;
  private typingCallback: ((data: any) => void) | null = null;
  private matchCreatedCallbacks: Array<(match: any) => void> = [];
  private matchUpdatedCallbacks: Array<(match: any) => void> = [];
  private userStatsUpdatedCallbacks: Array<(data: any) => void> = [];
  private balanceUpdatedCallbacks: Array<(data: any) => void> = [];
  private dashboardStatsUpdatedCallbacks: Array<(data: any) => void> = [];
  private newNotificationCallbacks: Array<(data: any) => void> = [];
  private isConnecting = false;
  private currentGameRoom: string | null = null;
  private coreHandlersAttached = false;

  private attachCoreHandlers() {
    if (!this.socket || this.coreHandlersAttached) {
      return;
    }

    this.coreHandlersAttached = true;

    this.socket.on('user-stats-updated', (data: any) => {
      this.userStatsUpdatedCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error('[SocketService] Error in user-stats-updated callback:', error);
        }
      });
    });

    this.socket.on('balance-updated', (data: any) => {
      this.balanceUpdatedCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error('[SocketService] Error in balance-updated callback:', error);
        }
      });
    });

    this.socket.on('new-notification', (data: any) => {
      this.newNotificationCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error('[SocketService] Error in new-notification callback:', error);
        }
      });
    });

    this.socket.on('match-created', (match: any) => {
      this.matchCreatedCallbacks.forEach((cb) => {
        try {
          cb(match);
        } catch (error) {
          console.error('[SocketService] Error in match-created callback:', error);
        }
      });
    });

    this.socket.on('match-updated', (match: any) => {
      this.matchUpdatedCallbacks.forEach((cb) => {
        try {
          cb(match);
        } catch (error) {
          console.error('[SocketService] Error in match-updated callback:', error);
        }
      });
    });

    this.socket.on('dashboard-stats-updated', (data: any) => {
      this.dashboardStatsUpdatedCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error('[SocketService] Error in dashboard-stats-updated callback:', error);
        }
      });
    });
  }

  connect(serverUrl: string) {
    const state = store.getState() as any;
    const token = state.auth.token;

    if (!token) {
      return;
    }

    const url = resolveSocketUrl(serverUrl);

    if (this.socket?.connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    if (this.socket && !this.socket.connected) {
      this.socket.auth = { token };
      this.socket.connect();
      return;
    }

    this.isConnecting = true;
    this.coreHandlersAttached = false;

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.attachCoreHandlers();

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;

      if (this.currentGameRoom && this.socket) {
        this.socket.emit('join-game', this.currentGameRoom);
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnecting = false;
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts += 1;
      this.isConnecting = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.coreHandlersAttached = false;
    this.isConnecting = false;
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

  joinGameRoom(gameId: string) {
    this.currentGameRoom = gameId;

    if (!this.socket) {
      return;
    }

    if (this.socket.connected) {
      this.socket.emit('join-game', gameId);
    }
  }

  leaveGameRoom(gameId: string) {
    if (this.currentGameRoom === gameId) {
      this.currentGameRoom = null;
    }

    if (this.socket?.connected) {
      this.socket.emit('leave-game', gameId);
    }
  }

  onMatchCreated(callback: (match: any) => void) {
    if (!this.matchCreatedCallbacks.includes(callback)) {
      this.matchCreatedCallbacks.push(callback);
    }
  }

  onMatchUpdated(callback: (match: any) => void) {
    if (!this.matchUpdatedCallbacks.includes(callback)) {
      this.matchUpdatedCallbacks.push(callback);
    }
  }

  offMatchCreated(callback?: (match: any) => void) {
    if (callback) {
      this.matchCreatedCallbacks = this.matchCreatedCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.matchCreatedCallbacks = [];
  }

  offMatchUpdated(callback?: (match: any) => void) {
    if (callback) {
      this.matchUpdatedCallbacks = this.matchUpdatedCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.matchUpdatedCallbacks = [];
  }

  onUserStatsUpdated(callback: (data: any) => void) {
    if (!this.userStatsUpdatedCallbacks.includes(callback)) {
      this.userStatsUpdatedCallbacks.push(callback);
    }
  }

  offUserStatsUpdated(callback?: (data: any) => void) {
    if (callback) {
      this.userStatsUpdatedCallbacks = this.userStatsUpdatedCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.userStatsUpdatedCallbacks = [];
  }

  onBalanceUpdated(callback: (data: any) => void) {
    if (!this.balanceUpdatedCallbacks.includes(callback)) {
      this.balanceUpdatedCallbacks.push(callback);
    }
  }

  offBalanceUpdated(callback?: (data: any) => void) {
    if (callback) {
      this.balanceUpdatedCallbacks = this.balanceUpdatedCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.balanceUpdatedCallbacks = [];
  }

  onNewNotification(callback: (data: any) => void) {
    if (!this.newNotificationCallbacks.includes(callback)) {
      this.newNotificationCallbacks.push(callback);
    }
  }

  offNewNotification(callback?: (data: any) => void) {
    if (callback) {
      this.newNotificationCallbacks = this.newNotificationCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.newNotificationCallbacks = [];
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connectPublic(serverUrl: string) {
    if (this.publicSocket?.connected) {
      return;
    }

    if (this.publicSocket && !this.publicSocket.connected) {
      this.publicSocket.connect();
      return;
    }

    const url = resolveSocketUrl(serverUrl);

    this.publicSocket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.publicSocket.on('connect', () => {
      this.wirePublicDashboardListener();
    });

    this.wirePublicDashboardListener();
  }

  private wirePublicDashboardListener() {
    if (!this.publicSocket) return;

    this.publicSocket.off('dashboard-stats-updated');
    this.publicSocket.on('dashboard-stats-updated', (data: any) => {
      this.dashboardStatsUpdatedCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error('[SocketService] dashboard-stats-updated callback error:', error);
        }
      });
    });
  }

  disconnectPublic() {
    if (this.publicSocket) {
      this.publicSocket.disconnect();
      this.publicSocket = null;
    }
  }

  onDashboardStatsUpdated(callback: (data: any) => void) {
    if (!this.dashboardStatsUpdatedCallbacks.includes(callback)) {
      this.dashboardStatsUpdatedCallbacks.push(callback);
    }

    if (this.socket) {
      this.attachCoreHandlers();
    }
    if (this.publicSocket) {
      this.wirePublicDashboardListener();
    }
  }

  offDashboardStatsUpdated(callback?: (data: any) => void) {
    if (callback) {
      this.dashboardStatsUpdatedCallbacks = this.dashboardStatsUpdatedCallbacks.filter((cb) => cb !== callback);
      return;
    }
    this.dashboardStatsUpdatedCallbacks = [];
  }
}

export const socketService = new SocketService();
