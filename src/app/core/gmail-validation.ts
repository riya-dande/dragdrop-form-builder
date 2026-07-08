export const gmailOnlyMessage = 'Please enter a Gmail account only.';

export function isGmailAddress(email: string) {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}
