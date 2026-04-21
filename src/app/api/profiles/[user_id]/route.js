import { NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server'

export async function GET(req, { params }) {
    const supabase = await createClient()

    const { user_id } = await params;
    

    const { data: profiles, error, status } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, audience')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: true });

    // console.log('profiles', profiles);

    if (error) {
        console.log('Error getting profiles:', error);
        return NextResponse.json({ result: "error", error: error });
    }
    else
        return NextResponse.json({ profiles: profiles });
}

export async function POST(req, { params }) {
    const supabase = await createClient()

    const { user_id } = await params;

    const form = await req.formData();
    const profile = JSON.parse(form.get('profile'));
    const file = form.get('file');

    let path = '';
    if(file){
        const ext = file.name.split('.').pop();
        const randomFile = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
        path = `${randomFile}.${ext}`

        const { error: uploadError} = await supabase.storage.from(user_id).upload(path, file);
        
        if (uploadError?.statusCode === '404') {
            const {data: bucket, error: bucketError} = await supabase.storage.createBucket(user_id, {
                public: true
            })
            const { error: uploadError2} = await supabase.storage.from(user_id).upload(path, file);
            if(uploadError2)
                console.log('error', uploadError2);
        }
    }

    if (profile.isNew) {
        const { data: profile_id, error } = await supabase
            .from('profiles')
            .insert({
                first_name: profile.fname,
                last_name: profile.lname,
                audience: profile.audience,
                user_id: user_id,
                avatar_url: file ? `https://wtxrbukgejhzplfwzamn.supabase.co/storage/v1/object/public/${user_id}/${path}` : null
            })
            .select('id');

        if (error) {
            console.log('Error adding profile:', error);
            return NextResponse.json({ result: "error", error: error });
        }
        else
            return NextResponse.json({ profiles: profile_id });
    }
    else {
        let upObj = {}
        if(file){
            upObj = {
                first_name: profile.fname,
                last_name: profile.lname,
                audience: profile.audience,
                user_id: user_id,
                avatar_url: `https://wtxrbukgejhzplfwzamn.supabase.co/storage/v1/object/public/${user_id}/${path}`
            }
        }
        else{
            upObj = {
                first_name: profile.fname,
                last_name: profile.lname,
                audience: profile.audience,
                user_id: user_id
            }
        }

        const { data: profile_result, error } = await supabase
            .from('profiles')
            .update(upObj)
            .eq('id', profile.id)

        if (error) {
            console.log('Error adding profile:', error);
            return NextResponse.json({ result: "error", error: error });
        }
        else
            return NextResponse.json({ profiles: profile_result });
    }
}