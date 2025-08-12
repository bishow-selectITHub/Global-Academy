-- Create quizes table to store quiz data
CREATE TABLE IF NOT EXISTS quizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    time_limit INTEGER, -- in minutes
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quizes_course_id ON quizes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizes_created_by ON quizes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizes_is_active ON quizes(is_active);

-- Enable RLS
ALTER TABLE quizes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read quizes
CREATE POLICY "Users can read quizes" ON quizes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for instructors and admins to insert quizes
CREATE POLICY "Instructors and admins can insert quizes" ON quizes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for instructors and admins to update quizes
CREATE POLICY "Instructors and admins can update quizes" ON quizes
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
CREATE TRIGGER update_quizes_updated_at 
    BEFORE UPDATE ON quizes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

