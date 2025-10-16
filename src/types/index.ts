export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface DateSelection {
  date: string; // YYYY-MM-DD format
  participantIds: string[];
}

export interface TimeOption {
  id: string;
  time: string;
  votes: string[]; // participant IDs
}

export interface Schedule {
  id: string;
  name: string;
  password: string;
  participants: Participant[];
  dateSelections: DateSelection[];
  timeOptions: TimeOption[];
  createdAt: string;
  userId: string | null;
}

export const PARTICIPANT_COLORS = [
  'hsl(14 100% 57%)',   // Orange
  'hsl(142 71% 45%)',   // Green
  'hsl(221 83% 53%)',   // Blue
  'hsl(280 100% 70%)',  // Purple
  'hsl(45 93% 47%)',    // Yellow
  'hsl(339 90% 51%)',   // Pink
  'hsl(173 80% 40%)',   // Teal
  'hsl(25 95% 53%)',    // Red-Orange
];
