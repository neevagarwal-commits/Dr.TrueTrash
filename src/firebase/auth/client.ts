'use client';

import {
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as signOutFirebase,
  type ConfirmationResult,
} from 'firebase/auth';

let recaptchaVerifier: RecaptchaVerifier | null = null;

const getRecaptchaVerifier = (auth: Auth) => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: (response: any) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      // This callback is for invisible reCAPTCHA.
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    }
  });
  return recaptchaVerifier;
}


export const signInWithPhoneNumber = async (auth: Auth, phoneNumber: string): Promise<ConfirmationResult> => {
  const appVerifier = getRecaptchaVerifier(auth);
  try {
    // We need to render the reCAPTCHA widget before calling signInWithPhoneNumber
    await appVerifier.render();
    const confirmationResult = await firebaseSignInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error signing in with phone number', error);
    // Reset reCAPTCHA on error
    if (appVerifier) {
      appVerifier.clear();
    }
    throw error;
  }
};

export const confirmVerificationCode = async (confirmationResult: ConfirmationResult, code: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Error confirming verification code', error);
    throw error;
  }
}

export const signOut = async (auth: Auth): Promise<void> => {
  try {
    await signOutFirebase(auth);
  } catch (error) {
    console.error('Error signing out', error);
  }
};