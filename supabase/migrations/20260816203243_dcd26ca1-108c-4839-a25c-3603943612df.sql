-- Admins can see and manage the ambassador capability only. Admin grants stay
-- reserved for claim_first_admin so nobody can escalate themselves.
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "Admins read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins grant ambassador"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND role = 'ambassador');

CREATE POLICY "Admins revoke ambassador"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND role = 'ambassador');