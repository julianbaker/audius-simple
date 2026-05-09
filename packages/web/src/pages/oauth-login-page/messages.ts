export const messages = {
  allow: 'Allow Audius to Connect to',
  permissionsRequestedHeader: 'This application will receive',
  readOnlyAccountAccess: 'Read-only Access',
  readOnlyGrants:
    'This app cannot interact with or make changes to your account.',
  writeAccountAccess: 'Read/Write Access',
  yourAccountData: 'Your Audius Account Data',
  yourAccountDataAccess:
    'Account activity, and identifying information, including the email address',
  yourAccountDataAccessNoEmail: 'Account activity and identifying information.',
  writeAccessGrants:
    'Grant this app permission to make changes to your account on your behalf.',
  signOut: 'Sign Out',
  signUp: `Don't have an account? Sign up`,
  switchAccount: 'Switch Account',
  authorizeButton: 'Sign In & Authorize',
  continueButton: 'Continue',
  signInButton: 'Sign In & Authorize',
  invalidCredentialsError: 'Invalid Credentials',
  miscError: 'An error has occurred. Please try again.',
  accountIncompleteError:
    'It looks like your account was never fully completed! Please complete your sign-up first.',
  redirectURIInvalidError:
    'Whoops, this is an invalid link (redirect URI missing or invalid).',
  missingAppNameError: 'Whoops, this is an invalid link (app name missing).',
  otpPrompt: 'Enter the verification code sent to your email',
  scopeError: `Whoops, this is an invalid link (scope missing or invalid).`,
  txError: `Whoops, this is an invalid link (transaction requests are not supported).`,
  missingFieldError: 'Whoops, you must enter both your email and password.',
  originInvalidError:
    'Whoops, this is an invalid link (redirect URI is set to `postMessage` but origin is missing).',
  noWindowError:
    'Whoops, something went wrong. Please close this window and try again.',
  responseModeError:
    'Whoops, this is an invalid link (response mode invalid - if set, must be "fragment" or "query").',
  signedInAs: `You’re Signed in as`,
  missingApiKeyError: 'Whoops, this is an invalid link (app API Key missing)',
  invalidApiKeyError: 'Whoops, this is an invalid link (app API Key invalid)',
  redirectUriNotRegisteredError: (uri: string) =>
    `Redirect URI not registered. Add "${uri}" to your app's allowed redirect URIs in Settings on audius.co.`,
  missingCodeChallengeError:
    'Whoops, this is an invalid link (code_challenge is required for PKCE flow).',
  invalidCodeChallengeMethodError:
    'Whoops, this is an invalid link (code_challenge_method must be S256).',
  back: 'Back',
  signUpEmailTitle: 'Create Your Account',
  signUpEmailDescription: 'Enter your email to get started',
  signUpPasswordTitle: 'Create Your Password',
  signUpPasswordDescription: 'Choose a secure password for your account',
  signUpHandleTitle: 'Choose Your Handle',
  signUpHandleDescription: 'Your handle is your unique identifier on Audius',
  signUpDisplayNameTitle: 'What should we call you?',
  signUpDisplayNameDescription: 'This is how other users will see you',
  creatingAccount: 'Creating your account...',
  accountCreated: 'Account created successfully!'
}
