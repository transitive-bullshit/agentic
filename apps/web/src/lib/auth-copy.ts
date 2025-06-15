import type {
  PasswordChangeError,
  PasswordLoginError,
  PasswordRegisterError
} from '@agentic/openauth/provider/password'

export const authCopy = {
  /**
   * Error message when email is already taken.
   */
  error_email_taken: 'There is already an account with this email.',

  /**
   * Error message when the confirmation code is incorrect.
   */
  error_invalid_code: 'Code is incorrect.',

  /**
   * Error message when the email is invalid.
   */
  error_invalid_email: 'Email is not valid.',

  /**
   * Error message when the password is incorrect.
   */
  error_invalid_password: 'Password is incorrect.',

  /**
   * Error message when the passwords do not match.
   */
  error_password_mismatch: 'Passwords do not match.',

  /**
   * Error message when the user enters a password that fails validation.
   */
  error_validation_error: 'Password does not meet requirements.',

  /**
   * Title of the register page.
   */
  register_title: 'Welcome to Agentic',

  /**
   * Description of the register page.
   */
  register_description: 'Sign in with your email',

  /**
   * Title of the login page.
   */
  login_title: 'Welcome to Agentic',

  /**
   * Description of the login page.
   */
  login_description: 'Sign in with your email',

  /**
   * Copy for the register button.
   */
  register: 'Sign Up',

  /**
   * Copy for the register link.
   */
  register_prompt: "Don't have an account?",

  /**
   * Copy for the login link.
   */
  login_prompt: 'Already have an account?',

  /**
   * Copy for the login button.
   */
  login: 'Login',

  /**
   * Copy for the forgot password link.
   */
  change_prompt: 'Forgot password?',

  /**
   * Copy for the resend code button.
   */
  code_resend: 'Resend code',

  /**
   * Copy for the "Back to" link.
   */
  code_return: 'Back to',

  /**
   * Copy for the logo.
   * @internal
   */
  logo: 'A',

  /**
   * Copy for the email input.
   */
  input_email: 'Email',

  /**
   * Copy for the password input.
   */
  input_password: 'Password',

  /**
   * Copy for the code input.
   */
  input_code: 'Code',

  /**
   * Copy for the repeat password input.
   */
  input_repeat: 'Repeat password',

  /**
   * Copy for the continue button.
   */
  button_continue: 'Continue'
} satisfies {
  [key in `error_${
    | PasswordLoginError['type']
    | PasswordRegisterError['type']
    | PasswordChangeError['type']}`]: string
} & Record<string, string>
