/** Renders help-centre text where **bold** marks the exact button or menu name. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-fg">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** The same text without markup, for search and metadata. */
export function plainText(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}
