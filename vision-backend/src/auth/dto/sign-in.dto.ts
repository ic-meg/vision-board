export class SignInDto {
  email: string;
  // For now we treat this as a plain-text password sent from the UI
  passwordHash: string;
}
