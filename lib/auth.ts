export type UserRole = "pm";

interface DemoUser {
  email: string;
  password: string;
  role: UserRole;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin1@gmail.com",
    password: "admin123",
    role: "pm",
  },
];

export function verifyCredentials(
  email: string,
  password: string,
): DemoUser | null {
  const normalizedEmail = email.toLowerCase();
  return (
    DEMO_USERS.find(
      (user) => user.email === normalizedEmail && user.password === password,
    ) || null
  );
}
