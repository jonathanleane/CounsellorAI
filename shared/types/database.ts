export interface DatabaseInterface {
  // Initialize database
  initialize(): Promise<void>;
  
  // User methods
  getUserById(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(username: string, passwordHash: string): Promise<number>;
  updatePassword(userId: number, passwordHash: string): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  
  // Profile methods
  getProfile(): Promise<any>;
  createProfile(data: any): Promise<any>;
  updateProfile(field: string, value: any): Promise<void>;
  
  // Conversation methods
  getAllConversations(): Promise<any[]>;
  getRecentConversations(limit?: number): Promise<any[]>;
  getConversation(id: string): Promise<any>;
  createConversation(data: any): Promise<any>;
  updateConversation(id: string, data: any): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  
  // Message methods
  getMessages(conversationId: string): Promise<any[]>;
  addMessage(conversationId: string, data: any): Promise<any>;
  deleteMessage(conversationId: string, messageId: string): Promise<void>;
}

// Backward compatibility
export type IDatabase = DatabaseInterface;