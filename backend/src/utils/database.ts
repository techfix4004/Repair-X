
import { User } from '../types';

interface MockUser extends User {
  id: string;
}

let mockUsers: MockUser[] = [];
let mockIdCounter = 1;

export const mockDatabase = {
  user: {
    create: async ({ data }: { data: Partial<User> }): Promise<User> => {
      const newUser: MockUser = {
        ...data as User,
        id: (mockIdCounter++).toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUsers.push(newUser);
      return newUser;
    },
    
    findUnique: async ({ where }: { where: { email?: string; id?: string } }): Promise<User | null> => {
      if (where.email) {
        return mockUsers.find((user: unknown) => (user as any).email === where.email) || null;
      }
      if (where.id) {
        return mockUsers.find((user: unknown) => (user as any).id === where.id) || null;
      }
      return null;
    },
    
    update: async ({ where, data }: { where: { id: string }; data: Partial<User> }): Promise<User> => {
      const index = mockUsers.findIndex(user => (user as any).id === where.id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index]!, ...data };
        return mockUsers[index]!;
      }
      throw new Error('User not found');
    },
    
    delete: async ({ where }: { where: { id: string } }): Promise<User> => {
      const index = mockUsers.findIndex(user => (user as any).id === where.id);
      if (index !== -1) {
        const deletedUser = mockUsers[index];
        mockUsers.splice(index, 1);
        return deletedUser!;
      }
      throw new Error('User not found');
    }
  }
};
