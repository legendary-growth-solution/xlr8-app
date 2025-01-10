import axios from 'axios';
import { TimeSlot } from 'src/types/bookings';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  const response = await api.get('/timeslots');
  return response.data.timeslots;
};

export const getTimeSlotsForDay = async (day: string): Promise<TimeSlot[]> => {
  const response = await api.get(`/timeslots?day=${day.toLowerCase()}`);
  return response.data.timeslots;
};

export const createTimeSlot = async (data: Omit<TimeSlot, 'id'>): Promise<TimeSlot> => {
  const response = await api.post('/timeslots', data);
  return response.data;
};

export const updateTimeSlot = async (id: string, data: Partial<TimeSlot>): Promise<TimeSlot> => {
  const response = await api.put(`/timeslots/${id}`, data);
  return response.data;
};

export const deleteTimeSlot = async (id: string): Promise<void> => {
  await api.delete(`/timeslots/${id}`);
};