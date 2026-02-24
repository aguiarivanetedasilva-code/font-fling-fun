
-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', true);

-- Allow anyone to upload to comprovantes bucket
CREATE POLICY "Anyone can upload comprovantes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'comprovantes');

-- Allow anyone to read comprovantes
CREATE POLICY "Anyone can read comprovantes"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprovantes');
