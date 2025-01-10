import axios from "axios";
import { apiEndpoints } from "./apiEndpoints";

export const api = {
  session: {
    getActiveSession: axios.get(apiEndpoints.session.activeSession).then((res)=>res.data),
    startSession: axios.post(apiEndpoints.session.startSession).then((res)=>res.data),
    endSession: (sessionId: string) => axios.post(apiEndpoints.session.endSession(sessionId)).then((res)=>res.data),
    get: (sessionId: string) => axios.post(apiEndpoints.session.sessionById(sessionId)).then((res)=>res.data),
    getCompletedSessions: axios.get(apiEndpoints.session.completedSessions).then((res)=>res.data),
    getSessionLaps: (sessionId: string) => axios.post(apiEndpoints.session.sessionLaps(sessionId)).then((res)=>res.data),
    getSessionLeaderboard: (sessionId: string) => axios.post(apiEndpoints.session.sessionLeaderboard(sessionId)).then((res)=>res.data),
    group: {
      getList: (sessionId: string) => axios.post(apiEndpoints.session.group.groupsBySessionId(sessionId)).then((res)=>res.data),
      create: (sessionId: string, data: object) => axios.post(apiEndpoints.session.group.groupsBySessionId(sessionId), data).then((res)=>res.data),
      update: (sessionId: string, groupId: string, data: object) => axios.put(apiEndpoints.session.group.groupByGroupId(sessionId, groupId), data).then((res)=>res.data),
      delete: (sessionId: string, groupId: string) => axios.delete(apiEndpoints.session.group.groupByGroupId(sessionId, groupId)).then((res)=>res.data),
      users: {
        getList: (sessionId: string, groupId: string) => axios.get(apiEndpoints.session.group.user.usersByGroupId(sessionId, groupId)).then((res)=>res.data),
        create: (sessionId: string, groupId: string, data: object) => axios.post(apiEndpoints.session.group.user.usersByGroupId(sessionId, groupId), data).then((res)=>res.data),
        createMultiple: (sessionId: string, groupId: string, data: object) => axios.post(apiEndpoints.session.group.user.usersInBulk(sessionId, groupId), data).then((res)=>res.data),
        update: (sessionId: string, groupId: string, userId: string, data: object) => axios.put(apiEndpoints.session.group.user.userByUserId(sessionId, groupId, userId), data).then((res)=>res.data),
        delete: (sessionId: string, groupId: string, userId: string) => axios.delete(apiEndpoints.session.group.user.userByUserId(sessionId, groupId, userId)).then((res)=>res.data),
        laps: {
          getList: (sessionId: string, groupId: string, userId: string) => axios.get(apiEndpoints.session.group.user.laps.lapsByUserId(sessionId, groupId, userId)).then((res)=>res.data),
          create: (sessionId: string, groupId: string, userId: string, data: object) => axios.get(apiEndpoints.session.group.user.laps.lapsByUserId(sessionId, groupId, userId), data).then((res)=>res.data),
          update: (sessionId: string, groupId: string, userId: string, lapId: string, data: object) => axios.put(apiEndpoints.session.group.user.laps.lapByLapId(sessionId, groupId, userId, lapId), data).then((res)=>res.data),
          delete: (sessionId: string, groupId: string, userId: string, lapId: string) => axios.delete(apiEndpoints.session.group.user.laps.lapByLapId(sessionId, groupId, userId, lapId)).then((res)=>res.data),
        },
        cart: {
          assign: (sessionId: string, groupId: string, userId: string, data: object) => axios.post(apiEndpoints.session.group.user.cart.assign(sessionId, groupId, userId), data).then((res)=>res.data),
          unassign: (sessionId: string, groupId: string, userId: string, data: object) => axios.post(apiEndpoints.session.group.user.cart.unAssign(sessionId, groupId, userId), data).then((res)=>res.data),
        },
        race: {
          start: (sessionId: string, groupId: string, userId: string) => axios.post(apiEndpoints.session.group.user.race.start(sessionId, groupId, userId)).then((res)=>res.data),
          pause: (sessionId: string, groupId: string, userId: string) => axios.post(apiEndpoints.session.group.user.race.pause(sessionId, groupId, userId)).then((res)=>res.data),
          end: (sessionId: string, groupId: string, userId: string) => axios.post(apiEndpoints.session.group.user.race.end(sessionId, groupId, userId)).then((res)=>res.data),
        }
      }
    }
  },
  cart: {
    getCarts: axios.get(apiEndpoints.cart.cart).then((res)=>res.data),
  },
  plan: {
    getPlans: axios.get(apiEndpoints.plan.plan).then((res)=>res.data),
  },
  billing: {
    create: (data: object) => axios.post(apiEndpoints.billingData.billingData, data).then((res)=>res?.data),
    get: (billing_id: string) => axios.get(apiEndpoints.billingData.billingDataById(billing_id)).then((res)=>res?.data),
  }
}