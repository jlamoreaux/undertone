-- Verify Reading Progress Table Configuration

-- 1. Check if the table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'reading_progress'
ORDER BY ordinal_position;

-- 2. Check for the composite unique constraint
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_namespace nsp ON nsp.oid = con.connamespace
INNER JOIN pg_class cls ON cls.oid = con.conrelid
WHERE nsp.nspname = 'public' 
    AND cls.relname = 'reading_progress'
    AND con.contype = 'u'; -- 'u' for unique constraints

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename = 'reading_progress';

-- 4. Check all RLS policies for the reading_progress table
SELECT 
    polname AS policy_name,
    CASE polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    CASE 
        WHEN polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS type,
    pg_get_expr(polqual, polrelid) AS using_expression,
    pg_get_expr(polwithcheck, polrelid) AS with_check_expression,
    rolname AS applicable_to
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
LEFT JOIN pg_roles rol ON pol.polroles @> ARRAY[rol.oid]
WHERE nsp.nspname = 'public' 
    AND cls.relname = 'reading_progress'
ORDER BY polname;

-- 5. Summary of findings
SELECT 'Configuration Check Summary:' AS status;
SELECT '✓ Table exists: reading_progress' AS check_item
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reading_progress'
);

SELECT '✓ Unique constraint exists on (user_id, book_name, chapter, read_date)' AS check_item
WHERE EXISTS (
    SELECT 1 FROM pg_constraint con
    INNER JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    INNER JOIN pg_class cls ON cls.oid = con.conrelid
    WHERE nsp.nspname = 'public' 
        AND cls.relname = 'reading_progress'
        AND con.contype = 'u'
        AND pg_get_constraintdef(con.oid) LIKE '%user_id%book_name%chapter%read_date%'
);

SELECT '✓ RLS is enabled' AS check_item
WHERE EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename = 'reading_progress' 
        AND rowsecurity = true
);

SELECT '✓ SELECT policy exists for auth.uid() = user_id' AS check_item
WHERE EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' 
        AND cls.relname = 'reading_progress'
        AND polcmd = 'r'
        AND pg_get_expr(polqual, polrelid) LIKE '%auth.uid()%user_id%'
);

SELECT '✓ INSERT policy exists for auth.uid() = user_id' AS check_item
WHERE EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' 
        AND cls.relname = 'reading_progress'
        AND polcmd = 'a'
        AND pg_get_expr(polwithcheck, polrelid) LIKE '%auth.uid()%user_id%'
);

SELECT '✓ UPDATE policy exists for auth.uid() = user_id' AS check_item
WHERE EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' 
        AND cls.relname = 'reading_progress'
        AND polcmd = 'w'
        AND pg_get_expr(polqual, polrelid) LIKE '%auth.uid()%user_id%'
);
