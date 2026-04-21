import { NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server'

export async function DELETE(req, { params }) {
    const supabase = await createClient()

    const { profile_id } = await params;

    const { data: profiles, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile_id);
        
    if (error) {
        console.log('Error deleting profiles:', error);
        return NextResponse.json({ result: "error", error: error });
    }
    else
        return NextResponse.json({ profiles: profiles });
}