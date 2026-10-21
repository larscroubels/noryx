"use client";

/** Last-resort error boundary (replaces the root layout, so it carries its own minimal styles). */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#fbf8f5",
          color: "#292626",
          display: "grid",
          placeItems: "center",
          minHeight: "100dvh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          {/* Rendered outside the root layout (no dictionary available), so both languages are shown. */}
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>NORYX is tijdelijk niet beschikbaar</h1>
          <p style={{ color: "#6e6764" }}>Probeer het zo meteen opnieuw.</p>
          <p lang="en" style={{ color: "#6e6764", fontSize: 14 }}>
            NORYX is temporarily unavailable. Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#b83d5d",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Opnieuw proberen <span lang="en">· Try again</span>
          </button>
        </div>
      </body>
    </html>
  );
}
