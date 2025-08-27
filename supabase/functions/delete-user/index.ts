// supabase/functions/delete-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id_to_delete, current_user_token } = await req.json()

    if (!user_id_to_delete || !current_user_token) {
      throw new Error('Missing required parameters')
    }

    console.log('🔍 [DEBUG] Starting user deletion process for:', user_id_to_delete)

    // Verify the current user's token and get their role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(current_user_token)

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    console.log('✅ [DEBUG] Current user authenticated:', user.id)

    // Get current user's role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !roleData) {
      throw new Error('Role not found')
    }

    const currentUserRole = roleData.role
    console.log('✅ [DEBUG] Current user role:', currentUserRole)

    // Check permissions - only superadmin can delete
    if (currentUserRole !== 'superadmin') {
      throw new Error('Insufficient permissions - only superadmin can delete users')
    }

    // Prevent self-deletion
    if (user.id === user_id_to_delete) {
      throw new Error('Cannot delete your own account')
    }

    // Check if user to delete exists
    const { data: targetUser, error: targetError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id_to_delete)
      .single()

    if (targetError || !targetUser) {
      throw new Error('User to delete not found')
    }

    console.log('✅ [DEBUG] Target user found with role:', targetUser.role)

    // Delete from user_roles table first
    console.log('🗑️ [DEBUG] Deleting from user_roles table...')
    const { error: rolesDeleteError } = await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', user_id_to_delete)

    if (rolesDeleteError) {
      console.error('❌ [DEBUG] Error deleting from user_roles:', rolesDeleteError)
      throw new Error(`Failed to delete from user_roles: ${rolesDeleteError.message}`)
    }

    console.log('✅ [DEBUG] Deleted from user_roles table')

    // Delete from users table
    console.log('🗑️ [DEBUG] Deleting from users table...')
    const { error: usersDeleteError } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', user_id_to_delete)

    if (usersDeleteError) {
      console.error('❌ [DEBUG] Error deleting from users:', usersDeleteError)
      throw new Error(`Failed to delete from users: ${usersDeleteError.message}`)
    }

    console.log('✅ [DEBUG] Deleted from users table')

    // Delete user from auth system using service role
    console.log('🗑️ [DEBUG] Deleting from auth system...')
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id_to_delete)

    if (deleteError) {
      console.error('❌ [DEBUG] Error deleting from auth:', deleteError)
      throw new Error(`Failed to delete user from auth: ${deleteError.message}`)
    }

    console.log('✅ [DEBUG] Deleted from auth system')

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully from all systems' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ [DEBUG] Edge Function Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})