"use client"
import {
  Fragment,
  useEffect,
  useState,
} from 'react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { ContentstackClient } from '../../../lib/contentstack-client';
import { setPersonalizeLiveAttributesCookie } from '@/lib/cspersonalize';
import {
  Dialog,
  Transition,
} from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

export default function Page({ }) {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [category, setCategory] = useState('None');
    const [entry, setEntry] = useState({});
    const params = useParams();


    const getContent = async () => {
        const entry = await ContentstackClient.getElementByUrl('rewards', '/rewards', params.locale);
        setEntry(entry?.[0] ?? {});
        setIsLoading(false);
    }

    useEffect(() => {
        ContentstackClient.onEntryChange(getContent);
    }, []);

    async function submit (e) {
        e.preventDefault();

        setPersonalizeLiveAttributesCookie({ client_type: category })
        setDialogOpen(true);
    }

    if(isLoading)
        return;

    return (
        <div>
            <Transition.Root show={dialogOpen} as={Fragment}>
                {console.log(entry)}
                <Dialog className="relative z-10" onClose={setDialogOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                    <div>
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                            <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-5">
                                            <Dialog.Title as="p" className="text-base font-semibold leading-6 text-gray-900">{entry?.submit_modal?.headline}</Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">{entry?.submit_modal?.body} </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            {entry?.submit_modal?.button_text}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <Header locale={params.locale} />
            <div className="flex max-w-7xl mx-auto px-8 gap-8">
                <div className="w-1/2">
                    <img src={entry?.image?.url} />
                </div>

                <div className="w-1/2 my-auto">
                    <h1 className="text-neutral-700 uppercase">{entry?.headline}</h1>
                    <p>{entry?.body}</p>
                </div>
            </div>

            <div className="mt-16  max-w-7xl mx-auto px-8 font-paragraph">
                <div className="w-full  bg-[#F0F9FF]  text-neutral-700">
                    <p className="text-3xl pt-5 text-center font-light">{entry?.form?.headline}</p>
                    <p className="text-[1.125rem] mt-5 text-center font-light">{entry?.form?.body}</p>

                    <div className="max-w-xl mx-auto">
                        <div className="space-y-12">
                            <form className=" pb-12">

                                <div className="mt-10">

                                    <label htmlFor="username" className="block text-sm font-light leading-6 ">{entry?.form?.name_label}</label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="p-2 w-64 text-neutral-700"
                                        />
                                    </div>

                                    <label htmlFor="username" className="block text-sm font-light leading-6 mt-3 ">{entry?.form?.email_label}</label>
                                    <div className="mt-2">
                                        <input
                                            type="email"
                                            name="user_name"
                                            id="user_email"
                                            className="p-2 w-64 text-neutral-700"
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <label htmlFor="about" className="block text-sm font-light leading-6 ">{entry?.form?.category_label}</label>
                                        <div className="mt-2">
                                            <select 
                                                className="p-2 w-64"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}    
                                            >
                                                {entry?.form?.categories?.map((category, index) => (
                                                    <option key={index} value={category.value}>{category.text}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => submit(e)}
                                        className="border border-2-white py-2 px-4 mt-8 bg-white hover:bg-transparent">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}