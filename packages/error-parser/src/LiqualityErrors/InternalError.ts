import { LiqualityError } from '.';
class InternalError extends LiqualityError {
  public readonly name = 'InternalError';

  constructor(lang?: string) {
    super();
    this.wrapUserErrorMessage(lang);
  }

  wrapUserErrorMessage(lang?: string): void {
    switch (lang) {
      default:
        this.userMsg = {
          cause: 'Sorry, something went wrong while processing this transaction.',
          suggestions: ['Try again at a later time', this.suggestContactSupport()],
        };
        break;
    }
  }
}

export default InternalError;
