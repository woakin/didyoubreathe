-- Create storage bucket for audio guides
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-guides', 'audio-guides', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to audio files
CREATE POLICY "Public read access for audio guides"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-guides');

-- Allow service role to insert audio files
CREATE POLICY "Service role can upload audio guides"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-guides');