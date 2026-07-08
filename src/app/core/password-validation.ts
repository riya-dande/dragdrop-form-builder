export const strongPasswordMessage = 'Password must be at least 8 characters and include a letter, a number, and a special character.';

export function isStrongPassword(password: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password.trim());
}
