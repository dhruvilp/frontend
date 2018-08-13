//LoginActions.test.js

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';

import { LOGIN_MNGMNT } from 'action_creators/ActionTypes';
import * as actions from 'action_creators/LoginActions';


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('LoginActions', () => {

  //after each test, clean up the store
  afterEach(() => {

    fetchMock.reset();
    fetchMock.restore();
  });

  //URL Params

  it('should dispatch an email change when asked', () => {
    
    const email = 'test@test.com';
    const expectedActions = [{
      type: LOGIN_MNGMNT.CHANGE_EMAIL,
      email: email
    }];

    const store = mockStore({ email: '' });

    store.dispatch(actions.changeEmail(email));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch a password change when asked', () => {

    const password = 'yerryeetyahh';
    const expectedActions = [{
      type: LOGIN_MNGMNT.CHANGE_PASSWORD,
      password: password
    }];

    const store = mockStore({ passord: '' });

    store.dispatch(actions.changePassword(password));
    expect(store.getActions()).toEqual(expectedActions);
  });

});
