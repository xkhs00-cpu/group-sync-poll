import { Schedule } from '@/types';

const STORAGE_KEY = 'schedules';

export const getSchedules = (): Schedule[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSchedule = (name: string, password: string): Schedule | null => {
  const schedules = getSchedules();
  return schedules.find(s => s.name === name && s.password === password) || null;
};

export const saveSchedule = (schedule: Schedule): void => {
  const schedules = getSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  
  if (index >= 0) {
    schedules[index] = schedule;
  } else {
    schedules.push(schedule);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

export const createSchedule = (name: string, password: string): Schedule => {
  const newSchedule: Schedule = {
    id: Date.now().toString(),
    name,
    password,
    participants: [],
    dateSelections: [],
    timeOptions: [],
    createdAt: new Date().toISOString(),
  };
  
  saveSchedule(newSchedule);
  return newSchedule;
};

export const deleteSchedule = (scheduleId: string): void => {
  let schedules = getSchedules();
  schedules = schedules.filter(s => s.id !== scheduleId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};
