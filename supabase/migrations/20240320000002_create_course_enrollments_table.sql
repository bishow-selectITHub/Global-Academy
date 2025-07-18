-- Create course_enrollments table
CREATE TABLE course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0,
    lessons JSONB DEFAULT '[]',
    quiz_score INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_enrollments_updated_at();

-- Enable Row Level Security
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own enrollments
CREATE POLICY "Users can create their own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments
CREATE POLICY "Users can update their own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all enrollments (you may want to add admin role check)
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
    FOR ALL USING (true); 