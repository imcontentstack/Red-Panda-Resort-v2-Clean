"use client"
import { useState } from 'react';

export default function LeadCapture({ content }) {
  const [inputValue, setInputValue] = useState("");
  
  function clickHandle(){
    jstag.send({"email" : inputValue});
    setInputValue("");
  }
  const handleChange = (event) => {
    event.preventDefault();
    setInputValue(event.target.value);
  };

  return (
    <div className="mx-auto p-8 max-w-8xl">
      <div className="flex flex-row max-md:flex-col justify-center items-center">
        <div
          className="h-[430px] w-1/2 max-md:w-full flex flex-col content-center justify-center"
          style={{ backgroundColor: content?.background_color?.hex }}
        >
          <div className="flex flex-col justify-center font-extralight text-neutral-700 px-4">
            <div className="text-4xl flex justify-center font-thin" {...content?.$?.title}>
             {content?.title}
            </div>
            <div className="w-full my-2 flex justify-center"{...content?.$?.description}>{content?.description}</div>
          </div>
          <form onSubmit={clickHandle}className="mt-10 flex justify-center">
            <input
              className="rounded-l-lg py-2 px-4 max-md:p-1 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white"
              placeholder={content?.input_label}
              value={inputValue}
              onChange={handleChange}
            />
            <button type="submit" className="px-4 max-md:px-1 rounded-r-lg bg-white hover:text-white hover:bg-cyan-600 text-cyan-600 font-medium p-2 uppercase border-cyan-600 border-solid shadow-sm ring-2 ring-inset ring-cyan-600" {...content?.$?.button_text}>
             {content?.button_text}
            </button>
          </form>
        </div>
        <div className="w-1/2 max-md:w-full">
            <img src={content?.image?.url} className="object-cover w-full h-[430px]" {...content?.$?.image}></img>
        </div>
      </div>
    </div>
  );
}
