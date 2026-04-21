export default function TextSection({ content }) {
  return (
    <div className="max-w-7xl px-8 mx-auto py-12">
      <p className="text-neutral-700 font-semibold text-xl" {...content?.$?.title}>{content?.title}</p>
      <div
        className={`w-full text-md mt-8 temp ${
          content?.two_columns ? "two-cols" : ""
        } whitespace-break-spaces`}
        dangerouslySetInnerHTML={{ __html: content?.body }}
        {...content?.$?.body}
      ></div>
    </div>
  );
}
