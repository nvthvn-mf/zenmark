
import { createClient } from '@supabase/supabase-js';

// These environment variables are assumed to be present.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * DATABASE SCHEMA (Run this in Supabase SQL Editor):
 * 
 * -- Enable UUID extension
 * create extension if not exists "uuid-ossp";
 * 
 * -- Documents Table
 * create table documents (
 *   id uuid primary key default uuid_generate_v4(),
 *   user_id uuid references auth.users(id) not null,
 *   title text not null,
 *   content text,
 *   created_at bigint not null,
 *   updated_at bigint not null,
 *   current_version int default 1,
 *   tags text[],
 *   is_deleted boolean default false
 * );
 * 
 * -- Document Versions Table
 * create table document_versions (
 *   id uuid primary key default uuid_generate_v4(),
 *   document_id uuid references documents(id) on delete cascade not null,
 *   version_number int not null,
 *   content text,
 *   created_at bigint not null,
 *   author_device_id text
 * );
 * 
 * -- RLS Policies
 * alter table documents enable row level security;
 * alter table document_versions enable row level security;
 * 
 * create policy "Users can only see their own documents"
 *   on documents for all using (auth.uid() = user_id);
 * 
 * create policy "Users can only see their own document versions"
 *   on document_versions for all using (
 *     exists (select 1 from documents where id = document_id and user_id = auth.uid())
 *   );
 */
