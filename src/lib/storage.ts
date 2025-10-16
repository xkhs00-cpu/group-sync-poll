import { Schedule, Participant, DateSelection, TimeOption } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const getSchedules = async (): Promise<Schedule[]> => {
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }

  const schedulesWithData = await Promise.all(
    (schedules || []).map(async (schedule) => {
      const [participants, dateSelections, timeOptions] = await Promise.all([
        getParticipants(schedule.id),
        getDateSelections(schedule.id),
        getTimeOptions(schedule.id),
      ]);

      return {
        id: schedule.id,
        name: schedule.name,
        password: schedule.password,
        participants,
        dateSelections,
        timeOptions,
        createdAt: schedule.created_at,
        userId: schedule.user_id,
      };
    })
  );

  return schedulesWithData;
};

export const getSchedule = async (scheduleId: string): Promise<Schedule | null> => {
  const { data: schedule, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();

  if (error || !schedule) {
    return null;
  }

  const [participants, dateSelections, timeOptions] = await Promise.all([
    getParticipants(schedule.id),
    getDateSelections(schedule.id),
    getTimeOptions(schedule.id),
  ]);

  return {
    id: schedule.id,
    name: schedule.name,
    password: schedule.password,
    participants,
    dateSelections,
    timeOptions,
    createdAt: schedule.created_at,
    userId: schedule.user_id,
  };
};

const getParticipants = async (scheduleId: string): Promise<Participant[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('schedule_id', scheduleId);

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
  }));
};

const getDateSelections = async (scheduleId: string): Promise<DateSelection[]> => {
  const { data, error } = await supabase
    .from('date_selections')
    .select('*')
    .eq('schedule_id', scheduleId);

  if (error) {
    console.error('Error fetching date selections:', error);
    return [];
  }

  return (data || []).map(d => ({
    date: d.date,
    participantIds: d.participant_ids || [],
  }));
};

const getTimeOptions = async (scheduleId: string): Promise<TimeOption[]> => {
  const { data, error } = await supabase
    .from('time_options')
    .select('*')
    .eq('schedule_id', scheduleId);

  if (error) {
    console.error('Error fetching time options:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    time: t.time,
    votes: t.votes || [],
  }));
};

export const saveSchedule = async (schedule: Schedule): Promise<void> => {
  const { error: scheduleError } = await supabase
    .from('schedules')
    .upsert({
      id: schedule.id,
      name: schedule.name,
      password: schedule.password,
      created_at: schedule.createdAt,
      user_id: schedule.userId,
    });

  if (scheduleError) {
    console.error('Error saving schedule:', scheduleError);
    throw scheduleError;
  }

  // Delete existing participants, date_selections, and time_options
  await Promise.all([
    supabase.from('participants').delete().eq('schedule_id', schedule.id),
    supabase.from('date_selections').delete().eq('schedule_id', schedule.id),
    supabase.from('time_options').delete().eq('schedule_id', schedule.id),
  ]);

  // Insert new data
  if (schedule.participants.length > 0) {
    const { error: participantsError } = await supabase
      .from('participants')
      .insert(
        schedule.participants.map(p => ({
          id: p.id,
          schedule_id: schedule.id,
          name: p.name,
          color: p.color,
        }))
      );

    if (participantsError) {
      console.error('Error saving participants:', participantsError);
    }
  }

  if (schedule.dateSelections.length > 0) {
    const { error: dateSelectionsError } = await supabase
      .from('date_selections')
      .insert(
        schedule.dateSelections.map(d => ({
          schedule_id: schedule.id,
          date: d.date,
          participant_ids: d.participantIds,
        }))
      );

    if (dateSelectionsError) {
      console.error('Error saving date selections:', dateSelectionsError);
    }
  }

  if (schedule.timeOptions.length > 0) {
    const { error: timeOptionsError } = await supabase
      .from('time_options')
      .insert(
        schedule.timeOptions.map(t => ({
          id: t.id,
          schedule_id: schedule.id,
          time: t.time,
          votes: t.votes,
        }))
      );

    if (timeOptionsError) {
      console.error('Error saving time options:', timeOptionsError);
    }
  }
};

export const createSchedule = async (name: string, userId: string): Promise<Schedule> => {
  const { data: newSchedule, error } = await supabase
    .from('schedules')
    .insert({
      name,
      user_id: userId,
      password: '', // Password no longer needed for new auth system
    })
    .select()
    .single();

  if (error || !newSchedule) {
    console.error('Error creating schedule:', error);
    throw error;
  }

  return {
    id: newSchedule.id,
    name: newSchedule.name,
    password: newSchedule.password,
    participants: [],
    dateSelections: [],
    timeOptions: [],
    createdAt: newSchedule.created_at,
    userId: newSchedule.user_id,
  };
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};
