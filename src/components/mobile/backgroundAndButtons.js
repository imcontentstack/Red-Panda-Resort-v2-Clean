
export default function BackgroundAndButtons({ content }){
    return(
        <div className="my-10 flex justify-center ">
            <div 
                className="bg-cover bg-bottom max-w-[432px] h-[514px] drop-shadow-lg text-center mx-5 rounded-xl flex flex-col gap-y-3 p-10 "
                {...content?.background_image?.$?.url}
                style={{backgroundImage : `url(${content?.background_image?.url})`}}
            >
                <p className="font-medium text-[15px]" {...content?.$?.category}>{content?.category}</p>
                <p className="font-light text-[24px]" {...content?.$?.title}>{content?.title}</p>
                <p className="text-[15px] tracking-tight" {...content?.$?.details}>{content?.details}</p>
                <div className="flex justify-center items-center">
                    <button className="border-2 border-[#1628c7] rounded text-[#1628c7] mt-4 py-2 px-4 text-[15px] tracking-tight " {...content?.$?.button_1_text}>{content?.button_1_text}</button>
                    <button className="ml-4 py-2 px-4 bg-[#1628c7] text-white text-[15px] mt-5 rounded bg-gradient-to-b from-white/15 from-45% to-white/0 to-50%" {...content?.$?.button_2_text}>{content?.button_2_text}</button>
                </div>
            </div>
        </div>
    )
}