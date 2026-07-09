export const Avatar = ({
  user,
  size = "md",
}: {
  user: { initials: string; avatarColor: string };
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: user.avatarColor }}
    >
      {user.initials}
    </div>
  );
};
