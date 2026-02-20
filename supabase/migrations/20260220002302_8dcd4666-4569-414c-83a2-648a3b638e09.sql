
CREATE POLICY "Admins can delete visits" ON public.site_visits FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.site_events FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
