-- Create live_rooms table to track live session rooms
CREATE TABLE IF NOT EXISTS live_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'completed', 'cancelled')),
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_live_rooms_course_id ON live_rooms(course_id);
CREATE INDEX IF NOT EXISTS idx_live_rooms_instructor_id ON live_rooms(instructor_id);
CREATE INDEX IF NOT EXISTS idx_live_rooms_status ON live_rooms(status);
CREATE INDEX IF NOT EXISTS idx_live_rooms_scheduled_start ON live_rooms(scheduled_start);

-- Enable RLS
ALTER TABLE live_rooms ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read live_rooms
CREATE POLICY "Users can read live_rooms" ON live_rooms
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert live_rooms
CREATE POLICY "Users can insert live_rooms" ON live_rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update live_rooms
CREATE POLICY "Users can update live_rooms" ON live_rooms
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_live_rooms_updated_at 
    BEFORE UPDATE ON live_rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
