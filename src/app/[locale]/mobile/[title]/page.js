"use client"
import {
  useEffect,
  useState,
} from 'react';
import BackgroundAndButtons from '@/components/mobile/backgroundAndButtons';
import ButtonCTA from '@/components/mobile/buttonCTA';
import IconGrid from '@/components/mobile/iconGrid';
import { ContentstackClient } from "@/lib/contentstack-client"
import { setPersonalizeLiveAttributesCookie } from '@/lib/cspersonalize';
import { createClient } from '@/utils/supabase/client';
import { faUser } from '@awesome.me/kit-610837e1f9/icons/classic/light';
import {
  faBars,
  faCheck,
  faUser as loggedIn,
} from '@awesome.me/kit-610837e1f9/icons/classic/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Helper function to get cookie value
function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        try {
            return JSON.parse(decodeURIComponent(cookieValue));
        } catch {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

// Helper function to delete cookie
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export default function Mobile({ }) {
    const [entry, setEntry] = useState({});
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState("");
    const params = useParams();


    const getUser = () => {
        const oauthUser = getCookie('oauth_user');
        setUser(oauthUser);
        return oauthUser;
    }

    async function logout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        deleteCookie('oauth_user');
        deleteCookie('oauth_token');
        deleteCookie('oauth_session');
        localStorage.setItem('profile', "");
        setPersonalizeLiveAttributesCookie({ client_type: "" });
        window.location.reload();
    }

    // Generate random state for CSRF protection
    function generateState() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }

    // Handle OAuth login
    function handleOAuthLogin() {
        // Generate and store state
        const state = generateState();
        sessionStorage.setItem('oauth_state', state);

        // Build OAuth URL
        const authUrl = new URL(process.env.NEXT_PUBLIC_OAUTH_URL);
        authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth/callback`);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('response_type', 'code');

        // Redirect to OAuth server
        window.location.href = authUrl.toString();
    }

    const getContent = async () => {
        const data = await ContentstackClient.getElementByUrl(
            "mobile",
            "/mobile/" + params.title,
            params.locale
        );
        const normalized = Array.isArray(data) ? data[0] : data;
        setEntry(normalized ?? {});
    };

    useEffect(() => {
        const currentUser = getUser();
        if(currentUser){
          getProfiles(currentUser.id);
        }
        ContentstackClient.onEntryChange(getContent);
      }, []);

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
                console.log('profiles', result);
                let tempProfiles = [];
                for (const profile of result.profiles) {
                    tempProfiles.push({
                        fname: profile.first_name,
                        lname: profile.last_name,
                        audience: profile.audience,
                        id: profile.id
                    })
                }
                setProfiles(tempProfiles);
                let saved = localStorage.getItem('profile');
                if (saved) {
                    const foundProfile = tempProfiles.find(p => p.audience === saved);
                    if (foundProfile) {
                        setSelectedProfile(foundProfile.fname);
                    }
                }

            })
            .catch((error) => {
                console.log(error);
            })
    }

    const changeProfile = async (name) => {
        setSelectedProfile(name);

        if (name === ""){
            localStorage.setItem('profile', "");
            setPersonalizeLiveAttributesCookie({ client_type: "" });
        }
        else {
            const profile = profiles.find(p => p.fname === name);
            localStorage.setItem('profile', profile.audience);
            setPersonalizeLiveAttributesCookie({ client_type: profile.audience });
        }
        window.location.reload();
    }

    return (
        <div>
            <div className="flex justify-between items-center py-2.5 px-4 border-b">
                <FontAwesomeIcon icon={faBars} className="text-xl text-neutral-700" />
                <img className="w-[40px] h-[25px]" src={entry?.header?.image?.url}  {...entry?.header?.image?.$?.url}/>
                {!user &&
                    <Popover className="relative">
                        <PopoverButton className="outline-none">
                            <FontAwesomeIcon icon={faUser} className="text-xl text-neutral-700" />
                        </PopoverButton>

                        <PopoverPanel anchor="bottom end" className="flex flex-col py-2 px-4 rounded text-neutral-700 bg-[#f3f3f9] shadow-lg">
                            <button
                                onClick={handleOAuthLogin}
                                className="text-nowrap font-light cursor-pointer text-left"
                            >
                                Log In
                            </button>
                        </PopoverPanel>
                    </Popover>
                }
                {user &&
                    <Popover className="relative">
                        <PopoverButton className="outline-none">
                            <FontAwesomeIcon icon={loggedIn} className="text-2xl ml-5" />
                        </PopoverButton>

                        <PopoverPanel anchor="bottom end" className="flex flex-col py-2 px-4 gap-y-1 bg-[#f3f3f9] rounded-lg mt-2 text-neutral-700 shadow-lg">
                            <PopoverButton
                                className="group flex w-full items-center font-light"
                                onClick={() => changeProfile("")}
                            >
                                <FontAwesomeIcon icon={faCheck} className={`mr-2 ${!selectedProfile ? "" : "opacity-0"}`} />
                                Anonymous
                            </PopoverButton>
                            {profiles?.map((profile, index) => (
                                <PopoverButton key={index}
                                    className="group flex w-full items-center font-light"
                                    onClick={() => changeProfile(profile.fname)}
                                >
                                    <FontAwesomeIcon icon={faCheck} className={`mr-2 ${selectedProfile === profile.fname ? "" : "opacity-0"}`} />
                                    {profile.fname}
                                </PopoverButton>
                            ))}
                            <div className="my-1 h-px bg-black/25" />
                            <Link href="/profiles" className="font-light">MANAGE PROFILES</Link>
                            <div className="my-1 h-px bg-black/25" />
                            <button
                                className="text-nowrap font-light cursor-pointer text-left"
                                onClick={handleOAuthLogin}
                            >
                                SWITCH ACCOUNT
                            </button>
                            <a
                                className="text-nowrap font-light cursor-pointer"
                                onClick={logout}
                            >
                                LOG OUT
                            </a>
                        </PopoverPanel>
                    </Popover>
                }
            </div>


            <div className="flex items-center justify-between py-3 px-4">
                <p className="font-normal text-[16px] tracking-tight" {...entry?.header?.$?.text}>{entry?.header?.text} </p>
                <button className={"py-2.5 px-4 rounded bg-[#1628c7] text-white bg-gradient-to-b from-white/15 from-45% to-white/0 to-50% " + (!entry?.header?.button_text ? 'hidden' : '')} {...entry?.header?.$?.button_text}>{entry?.header?.button_text}</button>
            </div>


            <div className={entry?.modular_block_1?.length === 0 ? "visual-builder__empty-block-parent" : ""} {...entry?.$?.modular_block_1}>
                {entry?.modular_block_1?.map((block, index) => (
                    <div key={index} {...entry?.$?.['modular_block_1__' + index]}>
                        {block.hasOwnProperty('image') &&
                            <div>
                                {!block.image?.image?.url &&
                                    <div className="h-[400px] w-full bg-gray-400 flex items-center justify-center" {...block.image?.$?.image}>
                                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                    </div>
                                }
                                {block.image?.image?.url &&
                                    <img className="object-center object-cover h-[400px]" src={block.image?.image?.url} {...block.image?.image?.$?.url}/>    
                                }
                            </div>
                        }
                        {block.hasOwnProperty('button_cta') &&
                            <ButtonCTA content={block.button_cta} />
                        }
                        {block.hasOwnProperty('icon_grid') &&
                            <IconGrid content={block.icon_grid} />
                        }
                        {block.hasOwnProperty('background_and_buttons') &&
                            <BackgroundAndButtons content={block.background_and_buttons} />
                        }
                    </div>
                ))}
            </div>

            <div className={entry?.modular_block_2?.length === 0 ? "visual-builder__empty-block-parent" : ""} {...entry?.$?.modular_block_2}>
                {entry?.modular_block_2?.map((block, index) => (
                    <div key={index} {...entry?.$?.['modular_block_2__' + index]}>
                        {block.hasOwnProperty('image') &&
                            <img className="object-center object-cover h-[400px]" src={block.image?.image?.url} />
                        }
                        {block.hasOwnProperty('button_cta') &&
                            <ButtonCTA content={block.button_cta} />
                        }
                        {block.hasOwnProperty('icon_grid') &&
                            <IconGrid content={block.icon_grid} />
                        }
                    </div>
                ))}
            </div>

        </div>
    )
}
