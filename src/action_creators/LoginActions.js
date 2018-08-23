/**
 * @file LoginActions responsible for loginForm specific actions
 * @author TresTres
 */

import { LOGIN_MNGMNT, VIEW_CONTROL } from 'action_creators/ActionTypes';
import * as PageActions from 'action_creators/PageActions';
import * as Utils from 'resources/Utils';

import resURLS from 'resources/resURLS';


/**
 * attempts to create a new user in LCS from the one specified in an attempt
 * @param {Object} specified attempt
 * @returns {Boolean} if the creation was successful
 */
export const attemptSignUp = (attempt) => (
  (dispatch) => {

    if(!Utils.validateAttempt(attempt)) {
      
      //reject non-attempt
      return false;
    } else {

      //check for unfilled fields
      if(attempt.email === '' || attempt.password === '') {

        //incomplete form
        dispatch(loginAlert('Please fill out valid email and password.'));
        return false;
      } else {

        //filled form, alert attempt
        dispatch(loginAlert('New account info submitted.  Awaiting response...'));
        
        //send to LCS to create
        const body = {
          email: attempt.email,
          password: attempt.password
        };
  
        fetch(resURLS.lcsCreateURL, Utils.makePostBody(body))
          .then(resp => resp.json())
          .then(resp => {

            //post-process
            if(!Utils.validateResponse(resp)) {

              //non-response
              dispatch(loginResponseError());
              return false;
            }
            if(resp.ok){

              //successful, proceed to log in
              //save authorization data 
              const data = resp.body;

              //this could fail, but idk if user needs to know this
              dispatch(PageActions.saveCookie(data, 'authdata'));
              
              //log in
              dispatch(loginUser());

              return true;
            } else {

              //unsuccessful
              dispatch(determineIssue(resp));
              return false;
            }  
          })
          .catch(err => {

            //error
            dispatch(loginError(err.toString));
            return false;
          });
      }
    }
  }
);

/**
 * attempts to login the attempt-specified user through LCS
 * @param {Object} specified attempt
 * @returns {Boolean} if the login was successful
 */
export const attemptLogin = (attempt) => (
  (dispatch) => {
     
    if(!Utils.validateAttempt(attempt)) {
       
      //reject non-attempt
      return false;
    } else {

      //check for unfilled fields
      if(attempt.email === '' || attempt.password === '') {

        //incomplete form
        dispatch(loginAlert('Please fill out valid email and password.'));
        return false;
      } else {

        //filled form, alert attempt
        dispatch(loginAlert('Credentials submitted. Awaiting response...'));

        //send to LCS to authorize
        const body = {
          email: attempt.email,
          password: attempt.password
        };

        fetch(resURLS.lcsAuthURL, Utils.makePostBody(body))
          .then(resp => resp.json())
          .then(resp => {

            //post-process
            if(!Utils.validateResponse(resp)) {

              //non-response
              dispatch(loginResponseError());
              return false;
            }
            if(resp.ok){

              //successful, save authorization data 
              const data = resp.body;

              //this could fail, but idk if user needs to know this
              dispatch(PageActions.saveCookie(data, 'authdata'));
              
              //log in
              dispatch(loginUser());
              return true;
            } else {
              
              //unsuccessful, ensure logout
              dispatch(determineIssue(resp));
              dispatch(PageActions.deleteCookie('authdata'));
              dispatch(logoutUser());
              return false;
            }
          })
          .catch(err => {

            //error
            dispatch(loginError(err.toString()));
            return false;
          });
      }
    }
  }
);

/**
 * attempts to send a magic link to LCS to consume from an attempt so password could be reset
 * @param {Object} the specified attempt
 * @returns {Boolean} if the link was consumed
 */
export const consumeLink = (attempt) => (
  (dispatch) => {
    if(dispatch(Utils.validateAttempt(attempt)) === false) {

      //reject non-attempt
      return false;
    }
    
    if(attempt.email === '' || attempt.password === '') {
      
      //form not filled out
      dispatch(loginAlert('Please fill in a valid email and a new password.'));
      return false;
    }
    
    //notify attempt of application
    dispatch(loginAlert('Sending info for a password reset...'));
    
    const body = {
      email: attempt.email,
      forgot: attempt.forgottenPassword,
      password: attempt.password,
      link: attempt.magicLink
    };

    fetch(resURLS.lcsConsumeURL, Utils.makePostBody(body))
      .then(resp => resp.json())
      .then(resp => {

        //post-process
        if(!Utils.validateResponse(resp)) {

          //non-response
          dispatch(loginResponseError());
          return false;
        }
        if(resp.ok){

          //successful
          //notify attempt
          dispatch(loginAlert('Password updated.  Click login to use the new password.'));
          //remove the magic link from the store
          dispatch({
            type: LOGIN_MNGMNT.SET_MAGIC_LINK, 
            magicLink: ''
          });
          //attempt has no longer forgotten the password
          dispatch({
            type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD,
            forgottenPassword: false
          });
          return true;
        } else {
        
          //unsuccessful
          dispatch(determineIssue(resp));
          //don't remove link or forgottenPassword in case they will try again
          return false;
        }
      })
      .catch(err => {

        //error
        dispatch(loginError(err.toString()));
        return false;
      });
  }
);

/**
 * attempts to request a magic link from LCS for an attempt to reset theuser password
 * @param {Object} the specified attempt
 * @returns {Boolean} if the magic link was sent
 */
export const requestLink = (attempt) => (
  (dispatch) => {

    if(dispatch(Utils.validateAttempt(attempt)) === false) {

      //reject non-attempt
      return false;
    }
    if(attempt.email === '') {
      
      //email not filled out
      dispatch(loginAlert('Please fill in a vaild email.'));
      return false;
    }

    //a request means the user has forgotten their password
    dispatch({
      type: LOGIN_MNGMNT.HAS_FORGOTTEN_PASSWORD,
      forgottenPassword: true
    });

    //notify attempt that a requst is being made
    dispatch(loginAlert('Email submitted. Requesting a magic link...'));

    const body = {
      email: attempt.email,
      forgot: attempt.forgottenPassword
    };

    fetch(resURLS.lcsMagicURL, Utils.makePostBody(body))
      .then(resp => resp.json())
      .then(resp => {

        //post-process
        if(!Utils.validateResponse(resp)) {

          //non-response
          dispatch(loginResponseError());
          return false;
        }
        if(resp.ok){

          //successsful
          const notif = resp.body;

          //notify user to check email
          dispatch(loginAlert(notif));
          return true;
        } else {

          //unsuccessful
          dispatch(determineIssue(resp));
          return false;
        }
      })
      .catch(err => {

        //error
        dispatch(loginError(err.toString()));
        return false;
      });
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

    //clear the reducer 
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

    //clear the reducer?
    dispatch({
      type: LOGIN_MNGMNT.RESET_REDUCER
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

    if(Utils.validateEmail(email) === false) {

      //validation fails, clear the email
      dispatch({
        type: LOGIN_MNGMNT.CHANGE_EMAIL,
        email: ''
      });
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

    if(Utils.validatePassword(password) === false) {

      //validation fails, clear the password
      dispatch({
        type: LOGIN_MNGMNT.CHANGE_PASSWORD,
        password: ''
      });
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

/**
 * sets an error alert specific for a failed LCS response
 */
export const loginResponseError = () => (
  (dispatch) => {

    dispatch(loginError('invalid LCS response'));
  }
);


/**
 * makes an alert based on the response body of a non-200 response
 * @param {Object} presumed LCS response
 */
export const determineIssue = (resp) => (
  (dispatch) => {

    const issue = resp.body || resp.errMessage;

    const alerts = {
      'invalid email, hash combo': 'Incorrect email or password.',
      'Wrong Password': 'Incorrect password.',
      'Duplicate attempt!': 'You are already in the system- Please retry logging in.',
      'No email provided!': 'No email provided.',
      'No password provided': 'No password provided.',
      'Registration is closed': 'Registration is currently closed.'
    };

    if(Object.keys(alerts).includes(issue)) {
      dispatch(loginAlert(alerts[issue]));
    } else {
      
      dispatch(loginAlert(issue));
    }
  }
);



