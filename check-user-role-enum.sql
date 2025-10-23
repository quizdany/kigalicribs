-- First, let's see what enum values exist
SELECT enum_range(NULL::user_role);

-- If you see the enum values, you can use one of them
-- Common values might be: 'tenant', 'landlord', 'admin', etc.
