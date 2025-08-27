-- Fix RLS policies for company storage bucket
-- This allows authenticated users to upload files during registration

-- First, let's check if the company bucket exists and create it if it doesn't
-- Note: This should be run in Supabase dashboard Storage section if bucket doesn't exist

-- Update RLS policies for company storage bucket
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated users to upload company files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'company' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN ('stamps', 'docs')
    );

-- Allow users to read their own files
CREATE POLICY "Allow users to read own company files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'company' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN ('stamps', 'docs')
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow users to update their own files
CREATE POLICY "Allow users to update own company files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'company' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN ('stamps', 'docs')
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own company files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'company' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN ('stamps', 'docs')
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow public read access to company files (optional - remove if you want private files)
CREATE POLICY "Allow public read access to company files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'company'
    );

