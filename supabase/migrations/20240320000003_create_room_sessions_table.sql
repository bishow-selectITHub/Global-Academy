-- Create room_sessions table to track live session data
CREATE TABLE IF NOT EXISTS room_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- 100ms session ID
    active BOOLEAN DEFAULT true,
    recordings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, session_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_room_sessions_room_id ON room_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_active ON room_sessions(active);
CREATE INDEX IF NOT EXISTS idx_room_sessions_created_at ON room_sessions(created_at);

-- Enable RLS
ALTER TABLE room_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read room_sessions
CREATE POLICY "Users can read room_sessions" ON room_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert room_sessions
CREATE POLICY "Users can insert room_sessions" ON room_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update room_sessions
CREATE POLICY "Users can update room_sessions" ON room_sessions
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
CREATE TRIGGER update_room_sessions_updated_at 
    BEFORE UPDATE ON room_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

