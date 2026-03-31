-- Add FK from group_memberships.user_id -> user_profiles.id
-- so PostgREST can resolve the join for member profile data.
SET search_path TO thc, public;

ALTER TABLE group_memberships
  ADD CONSTRAINT fk_group_memberships_user_profile
  FOREIGN KEY (user_id) REFERENCES thc.user_profiles(id) ON DELETE CASCADE;
