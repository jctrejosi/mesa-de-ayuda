export const Avatar = ({
  initials,
  size = "md",
  avatarColor = "black",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  avatarColor?: string;
}) => {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      {initials}
    </div>
  );
};
