/**
 * @file validation responsible for custom validating parameters across whole app
 * @author TresTres
 */


/**
 * checks if an object has all the properties specified
 * @param {Object} object to interrogate
 * @param {Object} array of {String} fields to check
 */
export const hasFields = (obj, fields) => {

  //check each field for its existence and initialization
  //for-of seems to be most appropriate
  for (var f of fields) {
    
    if(!obj.hasOwnProperty(f) ||  obj.f === undefined) {
      return false;
    }
  }
  return true;
};

/**
 * checks if data is a valid fetch response
 * TODO: make this robust
 * @param {Object} data to validate
 * @returns {Boolean} if validation was successful
 */
export const validateResponse = (data) => {
  
  if(typeof(data) !== 'object') {

    //reject non-object
    return false;
  } else {

    const responseFields = ['status', 'body'];

    if(hasFields(data, responseFields) === false) {

      //not a response
      return false;
    } else {

      return true;
    }
  }
};

/**
 * checks if an email is valid according to regex check
 * TODO: make this robust (naughty string, etc)
 * @param {String} email
 * @returns {Boolean} if validation was successful
 */
export const validateEmail = (email) => {

  if(typeof(email) !== 'string') {

    //reject if not a string
    return false;
  }

  //string@string.string
  const simpleCheck = /\S+@\S+\.\S+/;

  return simpleCheck.test(email);
};

/**
 * checks if a password is valid (there is no character limit currently)
 * TODO: make this robust (naughty strings, etc)
 * @param {String} password
 * @returns {Boolean} if validation was successful
 */
export const validatePassword = (pwd) => {
  
  if(typeof(pwd) !== 'string') {
    
    //reject if not a string
    return false;
  } else {

    return true;
  }
};

