import axios from 'axios';
import { TimeSlot } from 'src/types/bookings';
import { apiClient } from './api-client';

export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  const response = await apiClient.get('/timeslots');
  return response.data.timeslots;
};

export const getTimeSlotsForDay = async (day: string): Promise<TimeSlot[]> => {
  const response = await apiClient.get(`/timeslots?day=${day.toLowerCase()}`);
  return response.data.timeslots;
};

export const createTimeSlot = async (data: Omit<TimeSlot, 'id'>): Promise<TimeSlot> => {
  const response = await apiClient.post('/timeslots', data);
  return response.data;
};

export const updateTimeSlot = async (id: string, data: Partial<TimeSlot>): Promise<TimeSlot> => {
  const response = await apiClient.put(`/timeslots/${id}`, data);
  return response.data;
};

export const deleteTimeSlot = async (id: string): Promise<void> => {
  await apiClient.delete(`/timeslots/${id}`);
};

export const releaseTimeSlot = async (id: string): Promise<{ message: string; timeslot: TimeSlot }> => {
  const response = await apiClient.post(`/timeslots/${id}/release`);
  return response.data;
};

export const releaseTimeSlotsForDay = async (day: string): Promise<{ message: string; released_count: number; released_slots: TimeSlot[] }> => {
  const response = await apiClient.post('/timeslots/release-day', { day: day.toLowerCase() });
  return response.data;
};