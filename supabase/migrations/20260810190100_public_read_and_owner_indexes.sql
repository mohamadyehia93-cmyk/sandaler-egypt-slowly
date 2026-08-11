-- P1 / P2 — indexes for the predicates every RLS policy evaluates per row.
--
-- P1: every public read policy is `status = 'published'`, and no table had an
-- index supporting it. Partial indexes are used rather than a plain index on
-- status: the column has 3-4 distinct values, so a full index is usually
-- ignored by the planner, while a partial index matching the policy predicate
-- is both smaller and reliably chosen. The indexed column is created_at DESC
-- because listing queries read published rows newest-first.
--
-- P2: owner columns feed the `OR owner = auth.uid()` branch of the
-- authenticated read policies and the owns_provider_record() checks on
-- update/delete. Twelve were unindexed.
--
-- CREATE INDEX CONCURRENTLY is deliberately NOT used: the Supabase migration
-- runner executes each file inside a single transaction, and CONCURRENTLY
-- cannot run in a transaction block. These take an ordinary ShareLock for the
-- duration of the build. If any of these tables has grown large enough for
-- that to matter, build them by hand with CONCURRENTLY outside a transaction
-- and this migration becomes a no-op via IF NOT EXISTS.

-- ---------------------------------------------------------------- P1
CREATE INDEX IF NOT EXISTS idx_experiences_published     ON public.experiences     (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_trips_published           ON public.trips           (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_accommodations_published  ON public.accommodations  (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_transport_published       ON public.transport       (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_published        ON public.products        (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_causes_published          ON public.causes          (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_organizations_published   ON public.organizations   (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_published           ON public.posts           (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_audio_tours_published     ON public.audio_tours     (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_meetups_published         ON public.meetups         (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_events_published          ON public.events          (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_providers_published       ON public.providers       (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_culture_actors_published  ON public.culture_actors  (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_programs_published        ON public.programs        (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_collections_published     ON public.collections     (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_whos_who_published        ON public.whos_who        (created_at DESC) WHERE status = 'published';

-- ---------------------------------------------------------------- P2
CREATE INDEX IF NOT EXISTS idx_experiences_provider_id   ON public.experiences   (provider_id);
CREATE INDEX IF NOT EXISTS idx_trips_organizer_id        ON public.trips         (organizer_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id        ON public.products      (seller_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_host_id    ON public.accommodations(host_id);
CREATE INDEX IF NOT EXISTS idx_transport_provider_id     ON public.transport     (provider_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id           ON public.posts         (author_id);
CREATE INDEX IF NOT EXISTS idx_causes_owner_id           ON public.causes        (owner_id);
CREATE INDEX IF NOT EXISTS idx_programs_owner_id         ON public.programs      (owner_id);
CREATE INDEX IF NOT EXISTS idx_meetups_organizer_id      ON public.meetups       (organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id       ON public.events        (organizer_id);
CREATE INDEX IF NOT EXISTS idx_collections_expert_id     ON public.collections   (expert_id);
CREATE INDEX IF NOT EXISTS idx_audio_tours_creator_id    ON public.audio_tours   (creator_id);
