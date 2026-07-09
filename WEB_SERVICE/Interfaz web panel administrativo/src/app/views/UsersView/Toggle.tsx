export const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    style={{ width: "40px", height: "22px" }}
  >
    <span
      className="absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200"
      style={{
        width: "18px",
        height: "18px",
        transform: checked ? "translateX(18px)" : "translateX(2px)",
      }}
    />
  </button>
);
