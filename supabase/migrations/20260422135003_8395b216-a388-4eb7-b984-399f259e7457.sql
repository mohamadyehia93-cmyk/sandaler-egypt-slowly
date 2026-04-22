-- Allow authenticated users to manage demo (sample_id) rows
CREATE POLICY "Authenticated can insert sample statuses"
  ON public.provider_statuses
  FOR INSERT
  TO authenticated
  WITH CHECK (sample_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Authenticated can update sample statuses"
  ON public.provider_statuses
  FOR UPDATE
  TO authenticated
  USING (sample_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Authenticated can delete sample statuses"
  ON public.provider_statuses
  FOR DELETE
  TO authenticated
  USING (sample_id IS NOT NULL AND user_id IS NULL);