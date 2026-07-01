INSERT INTO public.platform_admins (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'superadmin@gmail.com'
LIMIT 1;