"use client"
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react'
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from 'react';

export default function ResortPackage({ content }) {
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [bookOpen, setBookOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    function clickHandle(index) {
        setModalContent(index);
        setActivityModalOpen(true);
    };

    function closeHandle() {
        setImageIndex(0);
        setActivityModalOpen(false);
    }


    return (
        <div className="py-24 px-8">
            <div className="max-w-8xl mx-auto py-20 max-xl:py-4 flex flex-col border-[#FFFFF0] border px-12 relative overflow-hidden">
                <div className="flex max-lg:flex-col-reverse">
                    <div className="w-1/2 max-lg:w-full pr-24 max-lg:pr-2 flex flex-col justify-center">
                        <h3 className="text-[#9dabcf]">{content?.title}</h3>
                        <p className="mt-6">{content?.price}</p>
                        <p className="mt-6">{content?.description}</p>
                        <p className="mt-6 mb-4 text-[#ffeecb]">Included Activities:</p>

                        <div className="flex flex-row flex-wrap xl:flex-nowrap gap-8">
                            {(content?.products && content?.products.length > 0) && (
                                content?.products?.map((item, index) => (
                                    <div key={index} className="cursor-pointer max-xl:w-[150px] w-[160px]" onClick={() => clickHandle(index)}>
                                        {(item?.images && item?.images.length > 0) &&
                                            <img className="h-[115px] object-cover " src={(item?.images?.[0]?.url ? item?.images?.[0]?.image?.url : "#")} />
                                        }
                                        <p className="mt-3 text-sm ">{item?.title}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="w-1/2 max-lg:w-full flex flex-col items-end max-xl:items-start">
                        <img className="max-lg:w-full object-cover h-[500px]" src={content?.image?.url} />
                        <button className="py-2.5 px-16 rounded-full bg-[#ffeecb] text-[#101827] mt-5 ml-auto" onClick={() => setBookOpen(true)}>BOOK</button>
                    </div>
                </div>

                <div className={`absolute top-0 right-0 z-50 w-full h-full transition-all bg-white duration-700 ease-in-out transform ${activityModalOpen ? 'translate-x-0 ' : 'translate-x-[100%]'}`}>
                    <div className="flex flex-wrap overflow-y-auto w-[100%] items-center justify-center h-full max-lg:flex-row-reverse max-xl:items-start">
                        <div className="bg-white max-lg:px-14 lg:px-6">
                            <div className="flex justify-between items-center pb-6">
                                {content?.products && content?.products?.length > 0 && (
                                <div className="font-bold text-black text-4xl">{content?.products?.[modalContent]?.title}</div>
                                )}
                                <XMarkIcon className="size-8 cursor-pointer text-black" onClick={() => closeHandle()} />
                            </div>


                            <div className="flex gap-5 max-lg:flex-col-reverse">
                                <div className="flex flex-col gap-y-5 max-lg:flex-row">
                                    {((content?.products && content?.products?.length > 0)  && (content?.products?.[modalContent]?.images && content?.products?.[modalContent]?.images?.length > 0)) &&
                                        content?.products?.[modalContent]?.images?.map((item, index) => (
                                            <div key={index} onClick={() => setImageIndex(index)} className="size-[80px] border flex items-center-justify-center p-1">
                                                <img className="object-cover" src={item?.image?.url} />
                                            </div>
                                        ))}
                                </div>
                                {((content?.products && content?.products?.length > 0) && (content?.products?.[modalContent]?.images && content?.products?.[modalContent]?.images?.length > 0)) && (
                                <img className="h-[500px] w-[60%] max-lg:w-[95%] lg:h-[600px] xl:h-[500px] object-cover" src={content?.products?.[modalContent]?.images?.[imageIndex]?.image?.url} />
                                )}
                                <p className="font-extralight whitespace-pre-line [&_p]:mt-3 [&_ul]:list-disc  [&_ul]:pl-10 text-sm tracking-wide xl:h-[500px] lg:h-[600px] max-lg:my-auto lg:overflow-y-auto text-black" dangerouslySetInnerHTML={{ __html: content?.products?.[modalContent]?.description }}></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={bookOpen} onClose={() => setBookOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/60" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-4xl bg-white p-8 shadow-2xl border border-neutral-300 relative">
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setBookOpen(false)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 focus:outline-none"
                        >
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            <span className="sr-only">Close</span>
                        </button>

                        {/* Header */}
                        <header>
                            <h3 className="text-xl font-semibold tracking-wide uppercase text-neutral-900">
                                {content?.title}
                            </h3>
                            <p className="mt-2 text-neutral-600 leading-relaxed">
                                {content?.description}
                            </p>
                        </header>

                        <hr className="my-6 border-neutral-200" />

                        {/* Body */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left: Activities + Payment */}
                            <section className="min-w-0">
                                <p className="mb-2 text-sm font-medium text-neutral-800">Activities</p>

                                {(content?.products && content?.products.length > 0) && (
                                    <ul className="divide-y divide-neutral-200 border border-neutral-200">
                                        {content?.products?.map((item, index) => (
                                            <li
                                                key={item.id ?? index}
                                                className="px-3 py-2 text-sm text-neutral-800 truncate"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Payment Summary */}
                                <div className="mt-6 flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">Package price</span>
                                    <span className="font-medium text-neutral-900">{content?.price}</span>
                                </div>

                                {/* Payment Form */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const email = e.target.email.value; // grab value of the email input
                                        console.log('buy clicked');
                                        setIsProcessing(true)
                                        setIsSuccess(false)
                                        console.log("sending tag info")
                                        const changedPrice = content?.price.slice(1);
                                        jstag.send({
                                            total_spent: changedPrice, //pulls price of product entry and increments field
                                            _e: "purchase", //sends event named purchase to Data Cloud
                                            email: email, // pulls input value from form and sends to Data Cloud
                                            "attr.membership_status" : "Diamond"
                                        });
                                        jstag.call("resetPolling"); // resets polling to fetch profile quicker

                                        setTimeout(() => {
                                            setIsProcessing(false)
                                            setIsSuccess(true)
                                            e.target.reset();
                                        }, 3000)
                                        //buyClick(content?.price, email);

                                        // handle submit
                                    }}
                                    className="mt-4 border border-neutral-300 bg-neutral-50 p-5 space-y-4"
                                    aria-describedby="payment-note"
                                >
                                    <p className="text-sm font-medium text-neutral-900 tracking-wide uppercase">
                                        Payment Details
                                    </p>

                                    {/* Email Address */}
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-medium text-neutral-600">
                                            Email address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            required
                                            className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="cc-name" className="block text-xs font-medium text-neutral-600">
                                            Name on card
                                        </label>
                                        <input
                                            id="cc-name"
                                            type="text"
                                            autoComplete="cc-name"
                                            placeholder="Jane Doe"
                                            className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="cc-number" className="block text-xs font-medium text-neutral-600">
                                            Card number
                                        </label>
                                        <input
                                            id="cc-number"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            placeholder="1234 5678 9012 3456"
                                            pattern="[0-9 ]*"
                                            className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-black/10"
                                        />
                                        <p className="mt-1 text-[11px] text-neutral-500">Numbers only • No dashes</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cc-exp" className="block text-xs font-medium text-neutral-600">
                                                Expiration (MM/YY)
                                            </label>
                                            <input
                                                id="cc-exp"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="cc-exp"
                                                placeholder="MM/YY"
                                                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="cc-cvc" className="block text-xs font-medium text-neutral-600">
                                                    CVC
                                                </label>
                                                <span className="text-[11px] text-neutral-500">3–4 digits</span>
                                            </div>
                                            <input
                                                id="cc-cvc"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                                placeholder="CVC"
                                                pattern="^[0-9]{3,4}$"
                                                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="postal" className="block text-xs font-medium text-neutral-600">
                                            ZIP / Postal code
                                        </label>
                                        <input
                                            id="postal"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                            placeholder="12345"
                                            className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>

                                    <div className="pt-1 flex items-center justify-between">
                                        <label className="inline-flex items-center gap-2 text-xs text-neutral-600 select-none">
                                            <input
                                                id="save"
                                                type="checkbox"
                                                className="h-4 w-4 border border-neutral-400"
                                            />
                                            Save card for future payments
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className={`inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-black/30 active:translate-y-px ${isProcessing
                                                ? 'bg-neutral-700 cursor-wait'
                                                : 'bg-neutral-900 hover:bg-black'
                                                }`}
                                        >{isProcessing ? 'Processing...' : content?.price}</button>
                                        {/* <button
                                            type="submit"
                                            className="inline-flex items-center justify-center bg-neutral-900 px-5 py-3 text-sm font-medium text-white tracking-wide uppercase hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/30 active:translate-y-px"
                                        >
                                            {content?.price}
                                        </button> */}
                                    </div>

                                    <p id="payment-note" className="text-[11px] text-neutral-500 leading-relaxed">
                                        Demo only — do not enter real card details.
                                    </p>
                                </form>
                            </section>

                            {/* Right: Hero Image + Price Tag */}
                            <aside className="min-w-0 flex flex-col">
                                <div className="border border-neutral-300">
                                    <img
                                        src={content?.image?.url}
                                        alt={content?.title ?? 'Selected package'}
                                        className="w-full aspect-[4/3] object-cover"
                                    />
                                </div>

                                <div className="mt-4 flex items-baseline justify-between">
                                    <span className="text-sm tracking-wide uppercase text-neutral-600">Total</span>
                                    <span className="text-2xl font-semibold text-neutral-900">{content?.price}</span>
                                </div>

                                {/* Success Message */}
                                <div className=" grow flex items-center">
                                <div
                                    className={`transition-opacity duration-500 w-full text-center  ${isSuccess ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    {isSuccess && (
                                        <div className="p-3 bg-green-100 border border-green-300 text-green-800 text-sm">
                                            Payment successful! Thank you for your booking.
                                        </div>
                                    )}
                                </div>
                                </div>
                            </aside>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

        </div>
    )
}