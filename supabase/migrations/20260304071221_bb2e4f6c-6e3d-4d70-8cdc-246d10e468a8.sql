
-- Fix overly permissive INSERT policy on notifications
-- The trigger functions use SECURITY DEFINER so they bypass RLS.
-- Restrict direct inserts to only the user's own notifications.
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
