-- ==============================================================================
-- SCHOOL MANAGEMENT SYSTEM (SMS) - SUPABASE DATABASE SETUP SCRIPT
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
-- Required for securely hashing passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------

-- Students Data Table
CREATE TABLE IF NOT EXISTS public.students_data (
    "Student_ID" serial PRIMARY KEY,
    "First_Name" text NOT NULL,
    "Last_Name" text NOT NULL,
    "Email" text UNIQUE NOT NULL,
    "Date_of_Birth" date,
    "Grade_Level" text NOT NULL,
    "GPA" numeric(3,2),
    "Enrollment_Date" date,
    "Status" text DEFAULT 'Active',
    "Gender" text,
    "Phone_Number" text,
    "Address" text,
    "Emergency_Contact_Name" text,
    "Emergency_Contact_Phone" text,
    "Blood_Group" text,
    "pp_img_url" text,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Staff Data Table
CREATE TABLE IF NOT EXISTS public.staff_data (
    "Staff_ID" serial PRIMARY KEY,
    "Auth_ID" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    "First_Name" text NOT NULL,
    "Last_Name" text NOT NULL,
    "Email" text UNIQUE NOT NULL,
    "Phone_Number" text,
    "Department" text,
    "Role_Title" text,
    "Hire_Date" date DEFAULT CURRENT_DATE,
    "Status" text DEFAULT 'Active',
    "created_at" timestamp with time zone DEFAULT now()
);


-- ------------------------------------------------------------------------------
-- 3. CUSTOM ROLE SYSTEM (JWT CLAIMS)
-- ------------------------------------------------------------------------------

-- Function to set custom JWT claims (like 'staff' or 'admin' roles)
CREATE OR REPLACE FUNCTION set_claim(uid uuid, claim text, value jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
      json_build_object(claim, value)::jsonb
  WHERE id = uid;
  
  RETURN 'OK';
END;
$$;


-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC ROLE ASSIGNMENT TRIGGER
-- ------------------------------------------------------------------------------

-- Function that sets the default role to 'student' when a new user is created
CREATE OR REPLACE FUNCTION public.set_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set default role to 'student' inside the raw_app_meta_data JSON
  NEW.raw_app_meta_data = COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || '{"role": "student"}'::jsonb;
  RETURN NEW;
END;
$$;

-- Trigger to run the function automatically every time a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_default_role();


-- ------------------------------------------------------------------------------
-- 5. ADMIN PASSWORD RESET
-- ------------------------------------------------------------------------------

-- Secure function allowing Admins or Staff to reset a student's password
CREATE OR REPLACE FUNCTION admin_reset_password(student_email text, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller is an admin or staff member
  IF (auth.jwt() -> 'app_metadata' ->> 'role') NOT IN ('admin', 'staff') THEN
    RAISE EXCEPTION 'Not authorized to reset passwords';
  END IF;

  -- Hash the new password and update the auth.users table directly
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = student_email;
END;
$$;


-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on tables
ALTER TABLE public.students_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_data ENABLE ROW LEVEL SECURITY;

-- STAFF DATA POLICIES
-- Allow only admins to access and modify staff data
CREATE POLICY "Allow admins full access to staff_data"
ON public.staff_data
FOR ALL
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- STUDENTS DATA POLICIES
-- Allow admins and staff to have full control over students_data
CREATE POLICY "Allow staff and admins full access to students"
ON public.students_data
FOR ALL
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' IN ('staff', 'admin')
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' IN ('staff', 'admin')
);

-- Allow students to ONLY read and update their own specific row
CREATE POLICY "Allow students to view and update their own data"
ON public.students_data
FOR SELECT
USING (
  Email = auth.jwt() ->> 'email'
);

CREATE POLICY "Allow students to update their own data"
ON public.students_data
FOR UPDATE
USING (
  Email = auth.jwt() ->> 'email'
)
WITH CHECK (
  Email = auth.jwt() ->> 'email'
);
-- ================================================== 
-- Add Role to the Supabase table
-- ==================================================

SELECT set_claim('YOUR-UUID-HERE', 'role', '"admin"');
