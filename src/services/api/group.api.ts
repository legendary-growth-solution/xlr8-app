import { Group } from 'src/types/session';
import { GroupUserMapping } from 'src/types/mappings';
import { API_ENDPOINTS } from './endpoints';
import { apiClient } from './api-client';
import { GroupUserMappingData } from './api.types';

interface AddUsersResponse {
  success: boolean;
  added_users: any[];
  errors: string[];
}

interface AddUsersRequest {
  users: {
    userId: string;
    timeInMinutes: number;
  }[];
}

interface GroupUserResponse {
  users: {
    id: string;
    group_id: string;
    user_id: string;
    time_in_minutes: number;
    status: string;
    race_status: string;
  }[];
}

interface LiveLeaderboardEntry {
    rank: number;
    name: string;
    cartName: string;
    groupName: string;
    totalLaps: number;
    bestLapTime: number | null;
    timeRemaining: number | null;
}

export const groupApi = {
  addUsers: async (groupId: string, data: AddUsersRequest): Promise<AddUsersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.SESSIONS.GROUPS.ADD_USERS(groupId), 
      data
    );
    return response.data;
  },

  update: async (groupId: string, data: Partial<GroupUserMappingData>): Promise<GroupUserMapping> => {
    const response = await apiClient.put(
      API_ENDPOINTS.SESSIONS.GROUPS.UPDATE(groupId), 
      data
    );
    return response.data;
  },

  delete: async (groupId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SESSIONS.GROUPS.DELETE(groupId));
  },

  deleteMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SESSIONS.GROUPS.DELETE_MEMBER(groupId, userId));
  },

  getUsers: async (groupId: string): Promise<GroupUserResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.SESSIONS.GROUPS.GET_USERS(groupId)
    );
    return response.data;
  },

  getActiveUsers: async (): Promise<GroupUserResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.SESSIONS.GROUPS.ACTIVE_USERS
    );
    return response.data;
  },
  
  recordLap: async (groupId: string, userId: string, data: {
    lap_number: number;
    lap_time: number;
  }): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SESSIONS.GROUPS.RECORD_LAP(groupId, userId), data);
  },

  getLiveLeaderboard: async (sessionId: string): Promise<{
    sessionStatus: string;
    sessionName: string;
    sessionId: string;
    data: LiveLeaderboardEntry[];
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.GET_LIVE_LEADERBOARD(sessionId));
    return response.data;
  },

}; 