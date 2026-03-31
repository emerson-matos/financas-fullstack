SET search_path TO thc, public;

-- Fix 1: user_profiles — restrict to own profile OR profiles of users in shared groups
DROP POLICY IF EXISTS "User Profiles Select" ON user_profiles;
CREATE POLICY "User Profiles Select" ON user_profiles FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM thc.group_memberships gm1
            JOIN thc.group_memberships gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid()
              AND gm2.user_id = user_profiles.id
              AND gm1.deactivated_at IS NULL
              AND gm2.deactivated_at IS NULL
        )
    );

-- Fix 2: group_memberships — allow seeing all members of groups you belong to
DROP POLICY IF EXISTS "Memberships Select" ON group_memberships;
CREATE POLICY "Memberships Select" ON group_memberships FOR SELECT TO authenticated
    USING (
        deactivated_at IS NULL
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM thc.group_memberships gm
                WHERE gm.group_id = group_memberships.group_id
                  AND gm.user_id = auth.uid()
                  AND gm.deactivated_at IS NULL
            )
        )
    );
