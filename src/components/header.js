"use client";
import { Fragment, useEffect, useState} from 'react';
import { cslp } from '@/lib/cstack';
import { useRouter } from 'next/navigation';
import { ContentstackClient } from "@/lib/contentstack-client";
import { setPersonalizeLiveAttributesCookie } from '@/lib/cspersonalize';
import { createClient } from '@/utils/supabase/client';
import { faCheck, faCircleUser as loggedIn, faCircleQuestion } from '@awesome.me/kit-610837e1f9/icons/classic/solid';
import { faCircleUser as loggedOut } from '@awesome.me/kit-610837e1f9/icons/classic/thin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJstag } from '../context/lyticsTracking';
import { useParams } from 'next/navigation';
import { useSlidePanel } from '@/context/slidePanel.context';

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Contentstack returns a single-item multiple-group field as a plain object, not an array.
// This normalises both cases so .length and .map() always work correctly.
const toArray = (val) => !val ? [] : Array.isArray(val) ? val : [val];

function MegaMenuItem({ item, index, entry }) {
  const [activeSubIdx, setActiveSubIdx] = useState(null);
  const [activeChildIdx, setActiveChildIdx] = useState(null);

  if (item?.sub_items?.length > 0) {
    const activeSubItem = activeSubIdx !== null ? item.sub_items[activeSubIdx] : null;
    const activeChildItem = activeChildIdx !== null ? activeSubItem?.child_items?.[activeChildIdx] : null;

    return (
      <Popover className="relative px-5" {...cslp(entry, 'menu_items__', index)}>
        <div {...item.$?.page}>
          <PopoverButton className="font-paragraph flex items-center outline-none bg-transparent" {...item.$?.text}>
            {item?.text}
            <ChevronDownIcon className="h-5 w-5 flex-none" aria-hidden="true" />
          </PopoverButton>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            className="absolute top-full right-0 z-10 mt-3 overflow-hidden rounded-lg bg-[#f3f3f9] shadow-lg"
            onMouseLeave={() => { setActiveSubIdx(null); setActiveChildIdx(null); }}
          >
            <div className="p-4 text-neutral-700 flex">
              {/* Column 1: sub_items */}
              <div className="flex flex-col gap-1 min-w-[180px]" {...item.$?.sub_items}>
                {item.sub_items.map((sub, subIdx) => (
                  sub?.child_items?.length > 0 ? (
                    <div
                      key={subIdx}
                      onMouseEnter={() => { setActiveSubIdx(subIdx); setActiveChildIdx(null); }}
                      className={`px-3 py-1.5 rounded-md cursor-default ${activeSubIdx === subIdx ? 'bg-white font-semibold' : 'font-light'}`}
                      {...sub.$?.text}
                    >
                      {sub.text}
                    </div>
                  ) : (
                    sub?.page && (
                      <Link
                        key={subIdx}
                        href={sub?.page?.length > 0 ? sub?.page?.[0]?.url : "#"}
                        className="px-3 py-1.5 rounded-md font-light hover:bg-white"
                        {...sub.$?.text}
                      >
                        {sub.text}
                      </Link>
                    )
                  )
                ))}
              </div>

              {/* Column 2: child_items of hovered sub_item */}
              {activeSubItem?.child_items?.length > 0 && (
                <>
                  <div className="w-px mx-3 bg-neutral-300 self-stretch" />
                  <div className="flex flex-col gap-1 min-w-[180px]">
                    {activeSubItem.child_items.map((child, childIdx) => (
                      toArray(child?.sub_child_items).length > 0 ? (
                        <div
                          key={childIdx}
                          onMouseEnter={() => setActiveChildIdx(childIdx)}
                          className={`px-3 py-1.5 rounded-md cursor-default ${activeChildIdx === childIdx ? 'bg-white font-semibold' : 'font-light'}`}
                          {...child.$?.text}
                        >
                          {child.text}
                        </div>
                      ) : (
                        child?.page && (
                          <Link
                            key={childIdx}
                            href={child?.page?.length > 0 ? child?.page?.[0]?.url : "#"}
                            className="px-3 py-1.5 rounded-md font-light hover:bg-white"
                            {...child.$?.text}
                          >
                            {child.text}
                          </Link>
                        )
                      )
                    ))}
                  </div>
                </>
              )}

              {/* Column 3: sub_child_items of hovered child_item — toArray handles 1 or many */}
              {toArray(activeChildItem?.sub_child_items).length > 0 && (
                <>
                  <div className="w-px mx-3 bg-neutral-300 self-stretch" />
                  <div className="flex flex-col gap-1 min-w-[180px]">
                    {toArray(activeChildItem.sub_child_items).map((subChild, subChildIdx) => (
                      subChild?.text && (
                        <Link
                          key={subChildIdx}
                          href={subChild?.page?.[0]?.url ?? "#"}
                          className="px-3 py-1.5 font-light flex items-center justify-between hover:bg-white rounded-md"
                          {...subChild.$?.text}
                        >
                          {subChild.text}
                          <ChevronRightIcon className="h-4 w-4 flex-none text-neutral-400 ml-4" />
                        </Link>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          </PopoverPanel>
        </Transition>
      </Popover>
    );
  }

  return (
    <div className="px-5" {...cslp(entry, 'menu_items__', index)}>
      <div {...item.$?.page}>
        {item?.page && (
          <Link
            href={(item?.page?.length > 0 && item?.page?.[0]?.url) ? item?.page?.[0]?.url : "#"}
            {...item.$?.text}
          >
            {item.text}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Header({ color, locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [entry, setEntry] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [avatar, setAvatar] = useState('');
  const router = useRouter();
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const slug = pathname.split('/').slice(2).join('/');
  const jstag = useJstag();
  const params = useParams();
  const { togglePanel } = useSlidePanel();

  const getUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    return user;
  }

  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      if (user) {
        const saved = localStorage.getItem('profile');
        if (saved) {
          setSelectedProfile(saved);
          const foundProfile = profiles?.find(p => p.fname === saved);
          if (foundProfile) {
            setAvatar(foundProfile.avatar);
            setPersonalizeLiveAttributesCookie({ client_type: foundProfile.audience });
          }
        }
      }
    };
    init();
  }, [profiles]);

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

  function generateState() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  function handleOAuthLogin() {
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    const authUrl = new URL(process.env.NEXT_PUBLIC_OAUTH_URL);
    authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth/callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    window.location.href = authUrl.toString();
  }

  const getContent = async () => {
    const entry = await ContentstackClient.getElementByTypeWithRefs("header", locale, [
      "menu_items.page",
      "menu_items.sub_items.page",
      "menu_items.sub_items.child_items.page",
      "menu_items.sub_items.child_items.sub_child_items.page",
    ]);
    setEntry(entry?.[0] ?? {});
    setIsLoading(false);
  };

  const getProfiles = async (user_id) => {
    try {
      const response = await fetch(`/api/profiles/${user_id}`, { method: 'GET' });
      if (!response.ok) throw response;
      const result = await response.json();

      const tempProfiles = (result?.profiles ?? []).map(profile => ({
        fname: profile.first_name,
        lname: profile.last_name,
        audience: profile.audience,
        id: profile.id,
        avatar: profile.avatar_url,
      }));
      setProfiles(tempProfiles);

      const saved = localStorage.getItem('profile');
      if (saved) {
        setSelectedProfile(saved);
        const foundProfile = tempProfiles.find(p => p.fname === saved);
        if (foundProfile) {
          setAvatar(foundProfile.avatar);
          setPersonalizeLiveAttributesCookie({ client_type: foundProfile.audience });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const init = async () => {
      const currentUser = await getUser();
      if (currentUser) {
        getProfiles(currentUser.id);
      }
      ContentstackClient.onEntryChange(getContent);
      jstag.call("resetPolling");
    };
    init();
  }, []);

  if (isLoading) return;

  function changeLang(language) {
    const path = language + '/' + slug;
    router.push("/" + path);
  }

  const changeProfile = async (name) => {
    setSelectedProfile(name);
    if (name === "") {
      localStorage.setItem('profile', "");
      setPersonalizeLiveAttributesCookie({ client_type: "" });
    } else {
      const profile = profiles.find(p => p.fname === name);
      localStorage.setItem('profile', profile.fname);
      setPersonalizeLiveAttributesCookie({ client_type: profile.audience });
    }
    window.location.reload();
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div
      className={
        " top-0 min-h-20 flex justify-between w-full font-paragraph py-8 px-8 " +
        (color === "white" ? "text-white absolute" : "text-neutral-700")
      }
    >
      <Link href="/" prefetch={false}
        onClick={(e) => {
          window.location.href = "/";
        }} className={"my-auto" +
        (entry?.image_width === "Auto" ? " w-auto" : " w-40")}>
        {color === "white" && (
          <img className="" src={entry?.light_logo?.url} {...entry?.$?.light_logo} />
        )}
        {color !== "white" && (
          <img className="" src={entry?.dark_logo?.url} {...entry?.$?.dark_logo} />
        )}
      </Link>

      <div className="flex lg:hidden">
        <button className="" onClick={() => setMenuOpen(true)}>
          <Bars3Icon className="h-8 w-8" />
        </button>
      </div>

      {/* Desktop nav */}
      <div className="hidden gap-8 lg:flex " {...entry?.$?.menu_items}>
        {entry?.menu_items?.map((item, index) => (
          <MegaMenuItem key={index} item={item} index={index} entry={entry} />
        ))}
      </div>

      <div className="hidden lg:flex justify-center align-top items-center" style={{ width: '150px', justifyContent: 'end' }}>

        <button
          onClick={togglePanel}
          className="outline-none mr-5"
          aria-label="Toggle slide panel"
        >
          <Squares2X2Icon className="h-6 w-6" />
        </button>

        <Link href="/faqs/maldives">
          <FontAwesomeIcon icon={faCircleQuestion} className="mr-5" />
        </Link>

        <div>
          <select
            className="outline-none bg-transparent mr-5"
            value={locale}
            onChange={(e) => {
              changeLang(e.target.value);
            }}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
            <option value="pl">PL</option>
          </select>
        </div>

        {!user &&
          <Popover className="relative">
            <PopoverButton className="outline-none">
              <FontAwesomeIcon icon={loggedOut} className="text-2xl ml-5" />
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
              {avatar &&
                <img className="w-8 h-8 min-w-8 min-h-8 flex-shrink-0 rounded-full object-cover -mt-1.5" src={avatar} />
              }
              {!avatar &&
                <FontAwesomeIcon icon={loggedIn} className="text-4xl -mt-1.5 " />
              }
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

      {/* Mobile nav */}
      <div
        className={`p-5 right-0 top-0 w-full z-50 duration-200 ease-in-out bg-white fixed h-full ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="text-right">
          <button
            className="cursor-pointer ms-auto text-neutral-700"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <XMarkIcon className="h-10" />
          </button>
        </div>
        <div className="flex flex-col text-neutral-700 text-2xl leading-10 uppercase font-paragraph">
          {entry?.menu_items?.map((item, index) => {
            if (item.sub_items?.length > 0) {
              return (
                <Disclosure as="div" className="-mx-3" key={index + item.text}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center pl-3 pr-3.5 uppercase font-paragraph">
                        {item.text}
                        <ChevronDownIcon
                          className={classNames(open ? "rotate-180" : "", "ml-2 h-7 w-7 flex-none")}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2 pb-2 font-paragraph">
                        {item.sub_items.map((subItem, subIdx) => (
                          subItem?.child_items?.length > 0 ? (
                            <Disclosure as="div" key={subIdx + subItem?.text} className="-mx-0">
                              {({ open }) => (
                                <>
                                  <Disclosure.Button className="flex w-full items-center pl-6 pr-3.5 text-sm uppercase font-paragraph">
                                    {subItem.text}
                                    <ChevronDownIcon
                                      className={classNames(open ? "rotate-180" : "", "ml-2 h-5 w-5 flex-none")}
                                      aria-hidden="true"
                                    />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="mt-1 space-y-1 pb-1 font-paragraph">
                                    {subItem.child_items.map((child, childIdx) => (
                                      toArray(child?.sub_child_items).length > 0 ? (
                                        <Disclosure as="div" key={childIdx + child?.text} className="-mx-0">
                                          {({ open }) => (
                                            <>
                                              <Disclosure.Button className="flex w-full items-center pl-9 pr-3.5 text-sm uppercase font-paragraph">
                                                {child.text}
                                                <ChevronDownIcon
                                                  className={classNames(open ? "rotate-180" : "", "ml-2 h-5 w-5 flex-none")}
                                                  aria-hidden="true"
                                                />
                                              </Disclosure.Button>
                                              <Disclosure.Panel className="mt-1 space-y-1 pb-1 font-paragraph">
                                                {toArray(child.sub_child_items).map((subChild, subChildIdx) => (
                                                  subChild?.text && (
                                                    <Disclosure.Button
                                                      key={subChildIdx + subChild?.text}
                                                      as="a"
                                                      href={subChild?.page?.[0]?.url ?? "#"}
                                                      className="block rounded-lg pt-2 pl-12 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50 font-paragraph"
                                                    >
                                                      {subChild?.text}
                                                    </Disclosure.Button>
                                                  )
                                                ))}
                                              </Disclosure.Panel>
                                            </>
                                          )}
                                        </Disclosure>
                                      ) : (
                                        <Disclosure.Button
                                          key={childIdx + child?.text}
                                          as="a"
                                          href={child?.page?.[0]?.url ?? "#"}
                                          className="block rounded-lg pt-2 pl-9 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50 font-paragraph"
                                        >
                                          {child?.text}
                                        </Disclosure.Button>
                                      )
                                    ))}
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          ) : (
                            <Disclosure.Button
                              key={subIdx + subItem?.text}
                              as="a"
                              href={subItem?.page?.[0]?.url ?? "#"}
                              className="block rounded-lg pt-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50 font-paragraph"
                            >
                              {subItem?.text}
                            </Disclosure.Button>
                          )
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            } else {
              return (
                <Link
                  key={index}
                  href={(item?.page?.length > 0 && item?.page?.[0]?.url) ? item?.page?.[0]?.url : "#"}
                >
                  {item.text}
                </Link>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
