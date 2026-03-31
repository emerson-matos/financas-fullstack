-- Fix: allow invite recipient to read their own invite (needed for accept flow)
-- Previously the policy only allowed group members to read invites, blocking
-- the accept flow for users who are not yet members.
ALTER POLICY "Group Invites Select" ON thc.group_invites
USING (
  EXISTS (
    SELECT 1 FROM thc.group_memberships
    WHERE group_memberships.group_id = group_invites.group_id
      AND group_memberships.user_id = auth.uid()
  )
  OR email = auth.email()
);
