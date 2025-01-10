import { BASE_URL } from "src/services/api/endpoints";

export const apiEndpoints = {
  session: {
    activeSession: `${BASE_URL}/sessions/active`,
    startSession: `${BASE_URL}/sessions/start`,
    endSession: (sessionId: string) => `${BASE_URL}/sessions/${sessionId}/end`,
    completedSessions: `${BASE_URL}sessions/completed`,
    sessionById: (sessionId: string) => `${BASE_URL}/sessions/${sessionId}`,
    sessionLaps: (sessionId: string) => `${BASE_URL}/sessions/${sessionId}/laps`,
    sessionLeaderboard: (sessionId: string) => `${BASE_URL}/sessions/${sessionId}/leaderboard`,
    group: {
      groupsBySessionId: (sessionId: string) => `${BASE_URL}sessions/${sessionId}/groups`,
      groupByGroupId: (sessionId: string, groupId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}`,
      user: {
        usersByGroupId: (sessionId: string, groupId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users`,
        usersInBulk: (sessionId: string, groupId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/bulk`,
        userByUserId: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}`,
        laps: {
          lapsByUserId: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/laps`,
          lapByLapId: (sessionId: string, groupId: string, userId: string, lapId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/laps/${lapId}`,
        },
        cart: {
          assign: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/assign_cart`,
          unAssign: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/unassign_cart`,
        },
        race: {
          start: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/start_race`,
          pause: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/pause_race`,
          end: (sessionId: string, groupId: string, userId: string) => `${BASE_URL}sessions/${sessionId}/groups/${groupId}/users/${userId}/end_race`,
        }
      }
    }
  },
  cart: {
    cart: `${BASE_URL}/carts`,
  },
  plan: {
    plan: `${BASE_URL}/plans`
  },
  billingData: {
    billingData: `${BASE_URL}/billing`,
    billingDataById: (billing_id: string) => `${BASE_URL}/billing/${billing_id}`
  }
}