import { cslp } from "@/lib/cstack";

export default function FormBuilder({ content }) {
  

  async function sendForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    let result = await fetch('/api/formBuilder/', {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("email result", result);
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className="py-8 w-full h-4/6 bg-[#F0F9FF] flex justify-center items-center">
      {content && (
        <div className="flex flex-col justify-center ">
          <div className="flex flex-col items-center my-4 p-4">
            <h3 {...content?.$?.title}>{content?.title}</h3>
            <div {...content?.$?.description}>{content?.description}</div>
          </div>

          <form onSubmit={sendForm}>
            {content?.form?.length === 0 && (
              <div
                className="h-5/6 visual-builder__empty-block-parent py-24"
                {...content?.$?.form}
              ></div>
            )}
            {content?.form?.map((block, index) => {
              return (
                <div
                  className="w-[600px] flex flex-col justify-center self-center"
                  key={index}
                  {...content?.$?.form}
                >
                  {block?.hasOwnProperty("text") && (
                    <div
                      key={index}
                      className="flex flex-col items-center w-full my-4"
                      {...cslp(content, "form__", index)}
                    >
                      <label
                        className="leading-loose self-start"
                        {...block?.text?.$?.label}
                      >
                        {block?.text?.label}
                      </label>
                      <input
                        name={"text" + index}
                        className="p-1 border text-black border-gray-200 bg-white w-full"
                        placeholder={block?.text?.placeholder_text}
                      />
                    </div>
                  )}

                  {block?.hasOwnProperty("number") && (
                    <div
                      key={index}
                      className="flex flex-col items-start w-full my-4"
                      {...cslp(content, "form__", index)}
                    >
                      <label
                        className="leading-loose"
                        {...block?.number?.$?.label}
                      >
                        {block?.number?.label}
                      </label>
                      <input
                        type="number"
                        name={"number" + index}
                        className="p-1 border mr-0 text-black border-gray-200 bg-white w-full"
                        placeholder={block?.number?.placeholder}
                      />
                    </div>
                  )}

                  {block?.hasOwnProperty("radio") && (
                    <div
                      key={index}
                      className="flex flex-col items-start my-3"
                      {...cslp(content, "form__", index)}
                    >
                      <p {...block?.radio?.$?.title}>{block?.radio?.title}</p>
                      <div className="w-full" {...block?.radio?.$?.group} >

                        {block?.radio?.group?.option?.length === 0 && (
                          <div
                            className="h-1/3 visual-builder__empty-block-parent py-24"
                            {...block?.radio?.group?.$?.option}
                          ></div>
                        )}

                        {block?.radio?.group?.option?.length > 0 &&
                          <div {...block?.radio?.group?.$?.option}>
                            {block?.radio?.group?.option?.map((option, index) => (
                              <div className="py-1 w-full" key={index} {...cslp(block?.radio?.group, "option__", index)}>
                                <input
                                  type="radio"
                                  value={option?.option_text}
                                  name="option"
                                ></input>
                                <label className="p-2" {...option?.$?.option_text} >
                                  {option?.option_text}
                                </label>
                              </div>
                            ))}
                          </div>
                        }

                      </div>
                    </div>
                  )}

                  {block.hasOwnProperty("text_box") && (
                    <div
                      key={index}
                      className="flex flex-col items-center my-3"
                      {...cslp(content, "form__", index)}
                    >
                      <label className="leading-loose flex self-start">
                        <div
                          className="self-start"
                          {...block?.text_box?.$?.label}
                        >
                          {block?.text_box?.label}
                        </div>
                      </label>
                      <textarea
                        name={"textarea" + index}
                        className="p-1 border text-black border-gray-200 bg-white w-full"
                        placeholder={block?.text_box?.placeholder_text}
                      />
                    </div>
                  )}

                  {block.hasOwnProperty("checkbox") && (
                    <div
                      key={index}
                      className="flex flex-row items-start justify-between my-4"
                      {...cslp(content, "form__", index)}
                    >
                      <div>
                        <input type="checkbox" className=" self-start" name={"checkbox" + index}/>
                        <label
                          className="leading-loose px-2"
                          {...block?.checkbox?.$?.title}
                        >
                          {" "}
                          {block?.checkbox?.title}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="w-[600px] items-start self-center">
              <button
                className="border border-2-white py-2 mt-6 bg-white hover:bg-transparent w-1/4"
                {...content?.$?.button_text}
              >
                {content?.button_text}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
