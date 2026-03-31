-- Migration: Add user_profiles table for member name/email display
SET search_path TO thc, public;

-- User profiles table (synced from auth.users via trigger)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User Profiles Select" ON user_profiles;
CREATE POLICY "User Profiles Select" ON user_profiles FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "User Profiles Insert" ON user_profiles;
CREATE POLICY "User Profiles Insert" ON user_profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "User Profiles Update" ON user_profiles;
CREATE POLICY "User Profiles Update" ON user_profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- Function to sync profile from auth.users on signup
CREATE OR REPLACE FUNCTION thc.sync_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = thc, public
AS $$
BEGIN
    INSERT INTO thc.user_profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            name  = COALESCE(EXCLUDED.name, thc.user_profiles.name),
            updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION thc.sync_user_profile();

-- Backfill existing users
INSERT INTO thc.user_profiles (id, name, email)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
    email
FROM auth.users
ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name  = COALESCE(EXCLUDED.name, thc.user_profiles.name),
        updated_at = NOW();
