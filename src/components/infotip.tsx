/**
 * Small info tooltip: a bordered "i" dot that reveals an explanation on hover
 * or keyboard focus. Pure CSS (see .infotip in globals.css) — no client JS.
 */
export function InfoTip({ label, text }: { label?: string; text: string }) {
  return (
    <span className="infotip align-middle">
      <button
        type="button"
        className="infotip-dot"
        aria-label={label ? `What is ${label}? ${text}` : text}
      >
        i
      </button>
      <span role="tooltip" className="infotip-bubble">
        {text}
      </span>
    </span>
  );
}
