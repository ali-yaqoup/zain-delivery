/** Client-side admin auth headers (email + password). */
export function adminAuthHeaders(email: string, password: string) {
  return {
    "x-admin-email": email.trim().toLowerCase(),
    "x-admin-key": password,
  };
}
