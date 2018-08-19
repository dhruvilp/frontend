//PageActions.js

import { getCookie, setCookie } from 'redux-cookie';

import { LOGIN_MNGMNT } from 'action_creators/ActionTypes';

export const checkURL = (urlParams) => (
  (dispatch) => {

    if(!urlParams || !(typeof(urlParams) === 'string')) {

      //not readable
      return 'unreadable url parameters';
    } else if(urlParams.has('error')) {

      //has error
      const errMes = urlParams.get('error');
      return errMes;
    } else {

      //is valid
      return 'valid';
    }
  } 
);

const confirmLink = (urlParams) => (
  (dispatch) => {

    //check the URL parameters
    const magicLink = urlParams.get('magiclink');
    if(!magicLink || !magicLink.startsWith('forgot-')) {

      //not a valid magic link
      dispatch(showError('not an acceptable magic link.  Please contact info@hackru.org'));
    } else {

      //user forgot password and is attempting to reset
      //notify user
      const notice = 'You have a magic link! Please enter your email and new password.';
      dispatch(notifyUser(notice));

      //put the link in the store
      dispatch({
        type: LOGIN_MNGMNT.SET_MAGIC_LINK,
        magicLink: magicLink
      });

      //the store should know the user forgot password
      dispatch({
        type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD,
        forgottenPasssword: true
      });
    }
  }
);


export const retrieveCookie = () => (
  (dispatch) => {

    //get the authdata cookie
    const cookie = dispatch(getCookie('authdata'));

    if(cookie && typeof(cookie) === 'string') {

      //useable cookie
      return JSON.parse(cookie);
    } else {

      //fails
      return null;
    }
  }
);

export const validateCookie = (cookie) => (
  (dispatch) => {

    //check the validation date
    if(Date.parse(cookie.auth.valid_until) > Date.now()) {

      //still valid
      return true;
    } else {

      //invalid
      return false;
    }
  }
);


export const saveCookie = (cookie) => (
  (dispatch) => {

    //set the authdata cookie
    dispatch(setCookie('authdata', cookie));

    return true;
  }
);
