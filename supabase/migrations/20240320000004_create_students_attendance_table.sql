-- Create students_attendance table to track student attendance in live sessions
CREATE TABLE IF NOT EXISTS students_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_students_attendance_user_id ON students_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_students_attendance_session_id ON students_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_students_attendance_joined_at ON students_attendance(joined_at);

-- Enable RLS
ALTER TABLE students_attendance ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read students_attendance
CREATE POLICY "Users can read students_attendance" ON students_attendance
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert students_attendance
CREATE POLICY "Users can insert students_attendance" ON students_attendance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update students_attendance
CREATE POLICY "Users can update students_attendance" ON students_attendance
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
CREATE TRIGGER update_students_attendance_updated_at 
    BEFORE UPDATE ON students_attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

