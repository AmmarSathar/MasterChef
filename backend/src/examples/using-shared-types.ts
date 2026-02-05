// Example: How to use shared types in backend
import { User, Recipe, ApiResponse } from '@masterchef/shared';

// Example controller using shared types
export const getUser = async (id: string): Promise<ApiResponse<User>> => {
  try {
    // Your logic here
    const user: User = {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch user',
    };
  }
};
