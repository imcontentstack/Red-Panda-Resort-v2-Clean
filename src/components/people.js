export default function People({ content, isKiosk }) {
    return (
        <div className="mt-24 mx-auto max-w-7xl">
            <p className="text-center text-3xl" {...content?.$?.heading}>{content?.heading}</p>
            <div className=" flex flex-wrap gap-8 px-8 justify-center mt-8" {...content?.$?.people}>
                {content?.people?.people?.length === 0 &&
                    [0, 1, 2].map((item, index) => (
                        <div key={index} className="animate-pulse w-[274px] h-96">
                            <div className="bg-gray-300 flex items-center justify-center h-full">
                                <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                </svg>
                            </div>
                        </div>
                    ))
                }
                {(content?.people?.people && content?.people?.people?.length > 0) && (
                    content?.people?.people?.map((person, index) => (
                        <div key={index} className="font-cabin">
                            <img className="h-96  object-cover object-center" src={person.headshot} />
                            <p className="text-center text-xl mt-2">{person.name}</p>
                            <p className="text-center text-lg text-neutral-500 italic">{person.title}</p>
                        </div>
                )))}
            </div>
        </div>
    )
}