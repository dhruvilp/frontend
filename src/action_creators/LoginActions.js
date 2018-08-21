/**
 * @file LoginActions responsible for loginForm specific actions
 * @author TresTres
 */

import { LOGIN_MNGMNT, VIEW_CONTROL } from 'action_creators/ActionTypes';

import { loginUser } from 'action_creators/ViewActions';


import {validateResponse, validateEmail, validatePassword } from 'resources/validation';
import resURLS from 'resources/resURLS';






/**
 * checks if LCS authorization was successful
 * @param {Object} presumed LCS response
 * @returns {Boolean} if successful authorizatoin
 */
const validateAuth = (data) => (
  (dispatch) => {

    if(validateResponse(data) === false) {

      //not a valid response
      dispatch(loginError('invalid response from LCS'));
      return false;
    } else {

      //assume good response
      if(data.status !== 200) {

        //unsuccessful authorization, check the cause
        
        const errorMsgs = {
          'invalid email,hash combo': 'Incorrect email or passsword.',
          'Wrong Password': 'Incorrect password.'
        }; 

        //notify user
        dispatch(loginError(errorMsgs[data.body]));
        return false;
      } else {

        //success
        return true;
      }
    }
  }
);


/**
 * marks a user as logged in
 */
export const loginUser = () => (
  (dispatch) => {
    
    //set the login status to true
    dispatch({
      
      type: VIEW_CONTROL.SET_LOGIN_STATUS,
      loggedIn: true
    });

    //clear the login 
    dispatch({
      type: LOGIN_MNGMNT.RESET_REDUCER
    });
  } 
);

/**
 * marks a user as logged out
 */
export const logoutUser = () => (
  (dispatch) => {

    //set the login status to false
    dispatch({

      type: VIEW_CONTROL.SET_LOGIN_STATUS,
      loggedIn: false
    });
  }
);

/**
 * updates the store with an email for login attempt
 * @param {String} specified email
 * @returns {Boolean} if store update was succesful
 */
export const changeEmail = (email) => (
  (dispatch) => {

    if(validateEmail(email) === false) {

      //validation fails
      return false;
    } else {

      //validation worked, update store
      dispatch({
        type: LOGIN_MNGMNT.CHANGE_EMAIL,
        email: email
      });

      return true;
    }
  }
);

/**
 * updates the store with a password for a login attempt
 * @param {String} specified password
 * @returns {Boolean} if update was successful
 */
export const changePassword = (password) => (
  (dispatch) => {

    if(validatePassword(password) === false) {

      //validation fails
      return false;
    } else {

      //validation worked, update store
      dispatch({
        type: LOGIN_MNGMNT.CHANGE_PASSWORD,
        password: password
      });

      return true;
    }
  }
);


/**
 * sets an alert according to a message
 * @param {String} the message to set
 */
export const loginAlert = (msg) => (
  (dispatch) => {

    //set the alert to msg
    dispatch({

      type: LOGIN_MNGMNT.SET_ALERT,
      alertMessage: msg
    });
  }
);

/**
 * sets an error alert according to a message
 * @param {String} the error message to set
 */
export const loginError = (msg) => (
  (dispatch) => {
    
    //set the alert to the error message
    const err = 'An error occurred: ' + msg;

    console.log('error logged: ' + err);

    //alert the user
    dispatch(loginAlert(err));
  }
);



export const resetPassword = (user) => (
  (dispatch) => { 
      
    if(user.magicLink) {

      //user has already received the magic link and is applying it
      
      if(user.email === '' || user.password === '') {

        //incomplete form
        dispatch({
          type: LOGIN_MNGMNT.SET_ERROR,
          errorMessage: 'Please enter your email and your new password to continue.'
        });
      } else {

        //complete form, send to LCS to consume
        fetch(resURLS.lcsConsumeURL, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({
            email: user.email,
            forgot: user.forgottenPassword,
            password: user.password,
            link: user.magicLink
          })
        }).then(resp => resp.json())
          .then(resp => {

            if(resp.statusCode === 200) {
                
              //notify user and remove link
              dispatch({
                type: LOGIN_MNGMNT.SET_ERROR,
                errorMessage: resp.body + '. \nYou may now login.'
              });
              dispatch({
                type: LOGIN_MNGMNT.SET_MAGIC_LINK, 
                magicLink: ''
              });
              dispatch({
                type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD, 
                forgottenPassword: false
              });
            } else {
  
                          
              //notify user and remove link
              dispatch({
                type: LOGIN_MNGMNT.SET_ERROR,
                errorMessage: resp.body
              });
              dispatch({
                type: LOGIN_MNGMNT.SET_MAGIC_LINK, 
                magicLink: ''
              });
              dispatch({
                type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD, 
                forgottenPassword: false
              });
            }
          })
          .catch(err => {

            //unexpected error
            //console.log(err);
            dispatch(showCaughtError(err.toString()));
          });
      }
    } else {

      //user is requesting a magic link because the password was forgotten
      dispatch({
        type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD,
        forgottenPassword: true
      });
        
      fetch(resURLS.lcsMagicURL,{
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          forgot: user.forgottenPassword
        })
      }).then(resp => resp.json())
        .then(resp => {
          //notify user
          
          let respMes = resp.body || resp.errorMessage;
          dispatch({
            type: LOGIN_MNGMNT.SET_ERROR,
            errorMessage: respMes
          });
        })
        .catch(err => {

          //unexpected error
          //console.log(err.toString());
          dispatch(showCaughtError(err.toString()));
        });
    }
  }
);

export const signUp = (user) => (
  (dispatch) => {
    
    if(user.email === '' || user.password === '') {
      
      //incomplete form
      dispatch({
        type: LOGIN_MNGMNT.SET_ERROR,
        errorMessage: 'Please fill out email and password to continue.'
      });
    } else {


      dispatch({
        type: LOGIN_MNGMNT.SET_ERROR,
        errorMessage: 'New account info submitted.  Awaiting response...'
      });

      //complete form, send to LCS to create user
      fetch(resURLS.lcsCreateURL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      }).then(resp => resp.json())
        .then(data => {
          if(data.statusCode === 200) {

            //successful creation
            dispatch(loginUser({body: data.body}));
          } else if(data.body === 'Duplicate user!') {

            //duplicate user
            dispatch({
              type: LOGIN_MNGMNT.SET_ERROR,
              errorMessage: 'You are already in the system!  Please try logging in.'
            });
          } else {

            //show error
            dispatch({
              type: LOGIN_MNGMNT.SET_ERROR,
              errorMessage: data.body
            });
          }
        })
        .catch(err => {

          //unexpected error
          dispatch(showCaughtError(err.toString()));
        });
    }
  }
);


export const login = (user) => (
  (dispatch) => {

    if(user.email === '' || user.password === '') {
      
      //incomplete form
      dispatch({
        type: LOGIN_MNGMNT.SET_ERROR,
        errorMessage: 'Please fill out email and password to continue.'
      });
    } else {

      dispatch({
        type: LOGIN_MNGMNT.SET_ERROR,
        errorMessage: 'Credentials submitted.  Awaiting response...'
      });

      //complete form, send to LCS to authorize
      fetch(resURLS.lcsAuthURL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      }).then(resp => resp.json())
        .then(data => {
          //post-process
          dispatch(loginPostFetch(data));
        })
        .catch(err => {

          //unexpected error
          //console.log(err);
          dispatch(showCaughtError(err.toString()));
        });
    }
  }
);

/*  NOT NEEDED
export const mlhLogin = (user) => {
  let redir = (user.magicLink && !(user.magicLink.startsWith('forgot-')))? resURLS.magicLinkRedirect + user.magicLink : '';
  let href = resURLS.mlhRedirectURL + redir + resURLS.mlhResponseType;
  window.open(href, '_self');
};
*/


const loginPostFetch = (data) => (
  (dispatch) => {
    if(data.statusCode !== 200) {
      //unsuccessful authorization, check the problem
      const errorMsgs = {
        'invalid email,hash combo': 'Incorrect email or passsword.',
        'Wrong Password': 'Incorrect password.'
      }; 
      //console.log(errorMsgs[data.body]);
      dispatch(showCaughtError(errorMsgs[data.body]));
    } else {
    
      //successful authorization
      dispatch(loginUser({body: data.body})); 
    }
  }
);




