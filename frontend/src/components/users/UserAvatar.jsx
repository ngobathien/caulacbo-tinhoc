const BASE_URL = import.meta.env.VITE_API_URL;

export default function UserAvatar({ user, size = "h-8 w-8", className = "" }) {
  if (!user) return null;
  let src = null;
  if (user.avatar?.startsWith("blob:") || user.avatar?.startsWith("data:")) {
    src = user.avatar;
  } else if (user.avatar) {
    src = `${BASE_URL}${user.avatar}`;
  }
  return (
    <span
      className={`${size} rounded-full bg-blue-500 flex items-center justify-center overflow-hidden relative ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt="avatar"
          className={`${size} object-cover rounded-full`}
        />
      ) : (
        <span className="text-white text-base font-semibold">
          {user.username?.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
