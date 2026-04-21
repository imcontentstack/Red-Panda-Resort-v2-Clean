
export default function ButtonCTA({ content }){
    return(
        <div className="flex flex-col px-8 py-5 items-center">
            {!content?.image?.url &&
                 <div className="h-[18px] w-[100px] bg-gray-400 flex items-center justify-center" {...content?.$?.image}>
                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                    </svg>
                </div>
            }
            {content?.image?.url &&
                <img className="h-[18px]" src={content?.image?.url} {...content?.image?.$?.url}/>
            }
            
            <p className="mt-5 text-2xl tracking-tight" {...content?.$?.headline}>{content?.headline}</p>
            <p className="text-[16px] tracking-tight text-center mt-5" {...content?.$?.details}>{content?.details}</p>
        
            <button 
                className="w-full py-2 bg-[#1628c7] text-white text-[17px] mt-5 rounded bg-gradient-to-b from-white/15 from-45% to-white/0 to-50%"
                {...content?.$?.button_1_text}
            >
                {content?.button_1_text}
            </button>

            <button 
                className="border-2 border-[#1628c7] rounded text-[#1628c7] mt-4 w-full py-2 text-[17px] tracking-tight"
                {...content?.$?.button_2_text}
            >
                {content?.button_2_text}
            </button>
        
            <p className="text-[14px] tracking-tight mt-4" {...content?.$?.footer_text}>{content?.footer_text}</p>
            <p className="text-[#1628c7] font-medium" {...content?.$?.footer_link_text}>{content.footer_link_text}</p>
        </div>
    )
}