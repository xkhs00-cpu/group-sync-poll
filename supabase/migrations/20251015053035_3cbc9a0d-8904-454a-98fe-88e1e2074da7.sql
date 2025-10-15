-- Create schedules table
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, password)
);

-- Create participants table
CREATE TABLE public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create date_selections table
CREATE TABLE public.date_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  participant_ids text[] NOT NULL DEFAULT '{}',
  UNIQUE(schedule_id, date)
);

-- Create time_options table
CREATE TABLE public.time_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  time text NOT NULL,
  votes text[] NOT NULL DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_options ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for all tables)
CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Anyone can create schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update schedules" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete schedules" ON public.schedules FOR DELETE USING (true);

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can create participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete participants" ON public.participants FOR DELETE USING (true);

CREATE POLICY "Anyone can view date_selections" ON public.date_selections FOR SELECT USING (true);
CREATE POLICY "Anyone can create date_selections" ON public.date_selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update date_selections" ON public.date_selections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete date_selections" ON public.date_selections FOR DELETE USING (true);

CREATE POLICY "Anyone can view time_options" ON public.time_options FOR SELECT USING (true);
CREATE POLICY "Anyone can create time_options" ON public.time_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update time_options" ON public.time_options FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete time_options" ON public.time_options FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_participants_schedule_id ON public.participants(schedule_id);
CREATE INDEX idx_date_selections_schedule_id ON public.date_selections(schedule_id);
CREATE INDEX idx_time_options_schedule_id ON public.time_options(schedule_id);