export class AuthError extends Error {
  constructor(readonly type: string, public errorMessage: string) {
    super(errorMessage);
  }

  readonly error = 'AUTH'
}