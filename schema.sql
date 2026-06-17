-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create profile trigger when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);


-- Create files table
CREATE TABLE public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL, -- in bytes
    type TEXT NOT NULL, -- mime type
    storage_path TEXT NOT NULL, -- path inside storage bucket
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files in their projects" ON public.files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert files into their projects" ON public.files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files from their projects" ON public.files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );


-- RLS / Bucket Policies for Supabase Storage
-- Note: Make sure the 'research-files' bucket exists in your Supabase storage.
-- Run these scripts to configure bucket access if not done via the Supabase Dashboard UI.

-- Insert policy for storage bucket (upload files)
-- CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
--     FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'research-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Select policy for storage bucket (download/read files)
-- CREATE POLICY "Allow users to read their own files" ON storage.objects
--     FOR SELECT TO authenticated
--     USING (bucket_id = 'research-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Delete policy for storage bucket (remove files)
-- CREATE POLICY "Allow users to delete their own files" ON storage.objects
--     FOR DELETE TO authenticated
--     USING (bucket_id = 'research-files' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ==========================================
-- MIGRATION: Project Status & Research Files
-- ==========================================

-- 1. Add status column to projects with constraint
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Draft';

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE public.projects ADD CONSTRAINT status_check CHECK (status IN ('Draft', 'Analyzing', 'Research Ready', 'Generating', 'Completed', 'Failed'));

-- 2. Create research_files table
CREATE TABLE IF NOT EXISTS public.research_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL, -- in bytes
    type TEXT NOT NULL, -- mime/extension type
    storage_path TEXT NOT NULL, -- path inside storage bucket (research-files/{user_id}/{project_id}/file)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on research_files
ALTER TABLE public.research_files ENABLE ROW LEVEL SECURITY;

-- Create policies for research_files
CREATE POLICY "Users can view research_files in their projects" ON public.research_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.research_files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert research_files into their projects" ON public.research_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.research_files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete research_files from their projects" ON public.research_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.research_files.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

