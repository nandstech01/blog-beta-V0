import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl!,
  supabaseKey!,
  {
    auth: {
      persistSession: false
    }
  }
)

// サーバーサイド用のクライアント（管理者権限）
export const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // サービスロールキー
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
) 