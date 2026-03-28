type StoredUser = {
  username?: string | null;
};

function parseStoredUser(rawUser: string | null): StoredUser | null {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
}

export function getCurrentAppointmentUserId(): string | null {
  const storedUser = parseStoredUser(localStorage.getItem("onetwo_user"));
  const username = storedUser?.username?.trim();

  if (username) return username;

  const guestName = localStorage.getItem("onetwo_guest_name")?.trim();
  if (guestName) return guestName;

  const lastLoggedUser = localStorage.getItem("last_logged_user")?.trim();
  return lastLoggedUser || null;
}