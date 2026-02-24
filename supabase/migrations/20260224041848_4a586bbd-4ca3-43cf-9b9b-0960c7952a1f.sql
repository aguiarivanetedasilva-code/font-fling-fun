
CREATE POLICY "Admins can delete comprovantes"
ON storage.objects FOR DELETE
USING (bucket_id = 'comprovantes');
