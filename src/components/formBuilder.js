"use client"
import { cslp } from "@/lib/cstack";

export default function FormBuilder({ content }) {

  // Track which fields have been focused (to fire once per field)
  const focusedFields = new Set();

  function handleFieldFocus(fieldName) {
    if (!focusedFields.has(fieldName)) {
      focusedFields.add(fieldName);
      jstag.send({
        event: "form_field_focus",
        form_title: content?.title,
        field_name: fieldName,
        page_path: window.location.pathname,
      });
    }
  }

  function handleRadioChange(groupTitle, value) {
    jstag.send({
      event: "form_field_change",
      form_title: content?.title,
      field_name: groupTitle,
      field_type: "radio",
      field_value: value,
      page_path: window.location.pathname,
    });
  }

  function handleCheckboxChange(fieldName, checked) {
    jstag.send({
      event: "form_field_change",
      form_title: content?.title,
      field_name: fieldName,
      field_type: "checkbox",
      field_value: checked ? "checked" : "unchecked",
      page_path: window.location.pathname,
    });
  }

  async function sendForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Build a plain object of all form values for Lytics
    const formValues = {};
    formData.forEach((value, key) => (formValues[key] = value));

    // Fire submit event to Lytics before posting
    jstag.send({
      event: "form_submit",
      form_title: content?.title,
      page_path: window.location.pathname,
      ...formValues, // spreads all field values (name, email, radio, etc.)
    });

    let result = await fetch("/api/formBuilder/", {
      method: "POST",
      body: formData,
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
                        onFocus={() => handleFieldFocus(block?.text?.label || "text" + index)}
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
                        onFocus={() => handleFieldFocus(block?.number?.label || "number" + index)}
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
                      <div className="w-full" {...block?.radio?.$?.group}>
                        {block?.radio?.group?.option?.length === 0 && (
                          <div
                            className="h-1/3 visual-builder__empty-block-parent py-24"
                            {...block?.radio?.group?.$?.option}
                          ></div>
                        )}
                        {block?.radio?.group?.option?.length > 0 && (
                          <div {...block?.radio?.group?.$?.option}>
                            {block?.radio?.group?.option?.map((option, index) => (
                              <div className="py-1 w-full" key={index} {...cslp(block?.radio?.group, "option__", index)}>
                                <input
                                  type="radio"
                                  value={option?.option_text}
                                  name="option"
                                  onChange={() => handleRadioChange(block?.radio?.title, option?.option_text)}
                                />
                                <label className="p-2" {...option?.$?.option_text}>
                                  {option?.option_text}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
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
                        <div className="self-start" {...block?.text_box?.$?.label}>
                          {block?.text_box?.label}
                        </div>
                      </label>
                      <textarea
                        name={"textarea" + index}
                        className="p-1 border text-black border-gray-200 bg-white w-full"
                        placeholder={block?.text_box?.placeholder_text}
                        onFocus={() => handleFieldFocus(block?.text_box?.label || "textarea" + index)}
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
                        <input
                          type="checkbox"
                          className="self-start"
                          name={"checkbox" + index}
                          onChange={(e) => handleCheckboxChange(block?.checkbox?.title || "checkbox" + index, e.target.checked)}
                        />
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