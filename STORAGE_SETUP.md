# Supabase Storage Setup for Property Images

## Steps to set up image upload:

### 1. Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Name it: `property-images`
5. Make it **Public** (check the public checkbox)
6. Click **Create Bucket**

### 2. Set up Storage Policies

After creating the bucket, click on it and go to **Policies** tab. Create these policies:

#### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');
```

#### Policy 2: Allow public to view images
```sql
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');
```

#### Policy 3: Allow owners to delete their images
```sql
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
```

### Alternative: Use the SQL Editor

You can also run the SQL file `supabase-storage-setup.sql` in your Supabase SQL Editor to set everything up at once.

### 3. Verify Setup

- Check that the bucket appears in your Storage section
- Try uploading an image through the dashboard to test
- Verify that you can access the image via the public URL

## That's it! Your storage is now ready for property image uploads.
