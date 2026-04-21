"use client"
import Header from "@/components/header";
import { useState, useEffect } from 'react';
import { ContentstackClient } from '@/lib/contentstack-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser, faTrash, faPlus, faCheck } from "@awesome.me/kit-610837e1f9/icons/classic/solid";
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { setPersonalizeLiveAttributesCookie } from '@/lib/cspersonalize';

export default function Profiles({ }) {
    const [profiles, setProfiles] = useState([]);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [audiences, setAudiences] = useState([]);
    const [saving, setSaving] = useState(-1);
    const [deleting, setDeleting] = useState(-1);
    const params = useParams();


    const getUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setAuthLoading(false);
        return user;
    }

    const getAudiences = async () => {
        const entry = await ContentstackClient.getElementByType("config", "en");
        setAudiences(entry?.[0]?.audience ?? []);
    }

    const getProfiles = async (user_id) => {
        let result = await fetch(`/api/profiles/${user_id}`, {
            method: 'GET',
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                else
                    return Promise.reject(response);
            })
            .then((result) => {
                let tempProfiles = [];
                for(const profile of result.profiles){
                    tempProfiles.push({
                        fname: profile?.first_name,
                        lname: profile?.last_name,
                        audience: profile?.audience,
                        id: profile?.id,
                        image: profile?.avatar_url ? profile?.avatar_url : '',
                        file: ''
                    })
                }
                setProfiles(tempProfiles);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    useEffect(() => {
        const init = async () => {
            getAudiences();
            const currentUser = await getUser();
            if (currentUser) {
                getProfiles(currentUser.id);
            }
        };
        init();
    }, []);

    const handleFieldChange = (id, key, value, checked) => {
        if(key === 'audience'){
            let auds = profiles.find(p => p.id === id).audience;
            if(checked)
                auds += "|" + value;
            else
                auds = auds.replace('|' + value, '');
            setProfiles(profiles =>
                profiles.map(profile =>
                    profile?.id === id ? { ...profile, ['audience']: auds } : profile
                )
            )
        }
        else{
            setProfiles(profiles =>
                profiles.map(profile =>
                    profile?.id === id ? { ...profile, [key]: value } : profile
                )
            )
        }
    }

    const addProfile = () => {
        setProfiles([...profiles,
        {
            id: Math.random(),
            fname: '',
            lname: '',
            audience: '',
            isNew: true,
            file: null,
            image: ''
        }
        ])
    }

    const deleteProfile = async (id) => {
        var index = profiles.findIndex(p => p.id === id);
        if(profiles[index].isNew){
            const temp = profiles;
            temp.splice(index, 1);
            setProfiles([...temp]);
        }
        else{
            let result = await fetch(`/api/profiles/${user.id}/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (response.ok)
                        return response.json();
                    else
                        return Promise.reject(response);
                })
                .then((result) => {
                    if (result.result === 'error')
                        console.log('error', result);
                    else {
                        const temp = profiles;
                        temp.splice(index, 1);
                        setProfiles([...temp]);
                    }
                    setDeleting(-1);
                })
                .catch((error) => {
                    console.log('error', error);
                    setDeleting(-1);
                })
        }
    }

    const saveProfile = async (id) => {
        setSaving(id);
        const profile = profiles.find(p => p.id === id);

        const formData = new FormData();
        formData.append('profile', JSON.stringify({
            fname: profile?.fname,
            lname: profile?.lname,
            id: profile?.id,
            audience: profile?.audience,
            isNew: profile?.isNew
        }))

        if(profile?.file)
            formData.append('file', profile?.file, profile?.file.name);

        let result = await fetch(`/api/profiles/${user.id}`, {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                else
                    return Promise.reject(response);
            })
            .then((result) => {
                if (result.result === 'error')
                    console.log('error', result);
                else {
                    if(profile?.isNew){
                        handleFieldChange(id, 'id', result.profiles[0].id);
                    }
                    setPersonalizeLiveAttributesCookie({ client_type: profile?.audience });
                    localStorage.setItem('profile', profile?.fname);
                }
                setTimeout(() => {
                    setSaving(-1);
                }, 1000)
            })
            .catch((error) => {
                console.log('error', error);
                setTimeout(() => {
                    setSaving(-1);
                }, 1000)
            })
    }

    return (
        <div>
            <Header locale={params.locale} />

            <div className="max-w-8xl mx-auto px-8 pt-16">
                <div className={`${!authLoading && !user ? "flex" : "hidden"}`}>
                    <div className="w-full text-center mt-32">
                        <h3>You must be logged in.</h3>
                    </div>
                </div>
                <div className={`mb-16 ${user ? "" : "hidden"}`}>
                    <div className="flex flex-col gap-y-8">
                        {profiles.map((profile, index) => (
                            <div key={profile?.id}>
                                <div className="w-full bg-blue-500 text-white py-4 px-5 rounded-t-lg items-center flex justify-between">
                                    <p className="font-medium">{profile?.fname === "" ? (profile?.isNew ? "New Profile": "Enter Name") : profile?.fname}</p>
                                    <div className="flex">
                                        <p className={`mr-4 font-medium ${deleting === profile?.id ? 'block' : 'hidden'}`}>Are you sure?</p>
                                        {deleting === profile?.id &&
                                            <button
                                                onClick={() => deleteProfile(profile?.id)}
                                                className="text-white hover:text-red-400"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="text-2xl" />
                                            </button>
                                        }
                                        {deleting !== profile?.id &&
                                            <button
                                                onClick={() => setDeleting(profile?.id)}
                                                className="text-white hover:text-red-400"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-2xl" />
                                            </button>
                                        }
                                    </div>
                                </div>
                                <div className={`border border-blue-500 p-4 grid grid-cols-6 w-full ${saving === profile?.id ? 'opacity-25 pointer-events-none' : ''}`}>
                                    <div className="col-span-8 md:col-span-4 ">
                                        <label htmlFor="fname">First Name*</label>
                                        <div className="mt-2">
                                            <input
                                                name="fname"
                                                id="fname"
                                                value={profile?.fname || ''}
                                                onChange={(e) => handleFieldChange(profile?.id, 'fname', e.target.value)}
                                                className="border p-2 w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-8 md:col-span-4 mt-5">
                                        <label htmlFor="lname">Last Name</label>
                                        <div className="mt-2">
                                            <input
                                                name="lname"
                                                id="lname"
                                                value={profile?.lname || ''}
                                                onChange={(e) => handleFieldChange(profile?.id, 'lname', e.target.value)}
                                                className="border p-2 w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="my-10 col-span-full">
                                        <div className="max-w-[96px]">
                                            <label htmlFor={"upload-image" + profile?.id} className="max-w-[96px]">
                                                {profile?.image !== '' &&
                                                    <img className="size-[96px] rounded-full ml-5" src={profile?.image} />
                                                }
                                                {profile?.image === '' &&
                                                    <FontAwesomeIcon icon={faCircleUser} className="text-8xl ml-5 text-neutral-700 cursor-pointer" />
                                                }
                                            </label>
                                            <input
                                                id={"upload-image" + profile?.id}
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                className="max-w-min"
                                                onChange={ (e) => {
                                                    console.log('in on change', index,  profiles[index].id);
                                                    let selectedFiles = e.target.files;
                                                    if (selectedFiles && selectedFiles[0]) {
                                                        let blobUrl = URL.createObjectURL(selectedFiles[0]);
                                                        handleFieldChange(profile?.id, 'image', blobUrl);
                                                        handleFieldChange(profile?.id, 'file', e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 col-span-full">
                                        <p>Audiences</p>
                                        {audiences.map((audience, audienceIdx) => (
                                            <div className="mt-2" key={audienceIdx}>
                                                <input 
                                                    type="checkbox" 
                                                    id={profile?.id + audience} 
                                                    name={"audience" + index}
                                                    value={audience}
                                                    checked={profile?.audience?.includes(audience)}
                                                    onChange={(e) => handleFieldChange(profile?.id, 'audience', e.target.value, e.target.checked)}
                                                />
                                                <label htmlFor={profile?.id + audience} className="ml-2">{audience}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end col-span-full">
                                        <button
                                            onClick={() => saveProfile(profile?.id)}
                                            className="border border-blue-500 rounded py-2 px-5 hover:bg-blue-500 hover:text-white"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex justify-center">
                        <button
                            onClick={() => addProfile()}
                            className="text-neutral-700  border border-neutral-700 rounded py-2 px-16"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-5xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
