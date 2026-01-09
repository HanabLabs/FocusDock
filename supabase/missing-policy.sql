-- Add missing DELETE policy for github_commits table
-- This policy is required for the sync operation to delete old commits before inserting new ones

CREATE POLICY "Users can delete their own commits"
  ON public.github_commits FOR DELETE
  USING (auth.uid() = user_id);
