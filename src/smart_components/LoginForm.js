//LoginForm.js
import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as loginActions from 'action_creators/LoginActions';

class LoginForm extends React.Component {

  constructor(props) {  
    super(props);
    this.changeEmail = this.changeEmail.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.applyPasswordReset = this.applyPasswordReset.bind(this);
    this.signUp = this.signUp.bind(this);
    this.login = this.login.bind(this);
    this.resetPasswordButton = this.resetPasswordButton.bind(this);
    //this.onMlhLogin = this.onMlhLogin.bind(this);
  }

  componentDidMount() {
    let urlParams = new URLSearchParams(window.location.search);
    this.props.checkMagicLink(urlParams);
  }

  changeEmail = (e) => {
    e.preventDefault();
    this.props.changeEmail(e.target.value);
  }

  changePassword = (e) => {
    e.preventDefault();
    this.props.changePassword(e.target.value);
  }

  requestPasswordReset = (e) => {
    e.preventDefault();
    let attempt = this.props.loginManager;
    this.props.requestLink(attempt);
  }

  applyPasswordReset = (e) => {
    e.preventDefault();
    let attempt = this.props.loginManager;
    this.props.consumeLink(attempt);
  }

  signUp = (e) => {
    e.preventDefault();
    let attempt = this.props.loginManager;
    this.props.attemptSignUp(attempt);
  }

  login = (e) => {
    e.preventDefault();
    let attempt = this.props.loginManager;
    this.props.attemptLogin(attempt);
  }

  resetPasswordButton = () => (

    <div className="col-12">
      {this.props.loginManager.magicLink ?
        <button className="btn btn-primary p-xs-2 p-md-3"
          onClick={this.applyPasswordReset}
          type="button"
        >
          <h6 className="UC">
            {'Apply Magic Link'}
          </h6>
        </button>
        :
        <button className="btn btn-primary p-xs-2 p-md-3"
          onClick={this.requestPasswordReset}
          type="button"
        >
          <h6 className="UC">
            {'Forgot Password'}
          </h6>
        </button>
      }
    </div>

  )
  
  /*NOT NEEDED
  onMlhLogin = (e) => {
    e.preventDefault();
    let user = this.props.loginManager;
    this.props.mlhLogin(user);
  }*/

  render() {

    return (
      <div className="content-section " id="announcements-div">
        <h2 className="content-section-title">
          <span className="u-highlight">{'Login:'}</span>
        </h2>
        <div className="content-section-desc register-root">
          <div className="react-form">
            <form className="form-group">
              <div className="form-group row my-3"> {/*EMAIL FIELD*/}
                <label className="col-lg-3 col-form-label" htmlFor="email-input">
                  <h4 className="font-weight-bold blue">{'EMAIL'}</h4>
                </label>
                <div className="col-lg-9">
                  <input className="form-control form-control"
                    id="email-input"
                    onChange={this.changeEmail}
                    type="email"
                    autoFocus="true"
                  />
                </div>
              </div>
              <div className="form-group row my-1"> {/*PASSWORD FIELD*/}
                <label className="col-lg-3 col-form-label" htmlFor="pw-input">
                  <h4 className="font-weight-bold blue">{'PASSWORD'}</h4>
                </label>
                <div className="col-lg-9">
                  <input className="form-control form-control"
                    id="pw-input"
                    onChange={this.changePassword}
                    type="password"
                  />
                </div>
              </div>
              <div className="row text-center"> {/*ERROR MESSAGE*/}
                <label className="col-12 col-form-label mb-2 mt-2">
                  <h4 className="text-lg p-xs-2 p-md-3 badge badge-purple">
                    {this.props.loginManager.alertMessage}
                  </h4>
                </label>
                {this.props.loginManager.alertMessage && this.resetPasswordButton()}
              </div>
              <div className="form-group row mt-2">
                <div className="col-12 text-center">
                  <button className="btn btn-primary custom-btn p-xs-2 p-md-3 mr-2"
                    onClick={this.login}
                    type="button"
                  >
                    <h6 className="UC">{'Login'}</h6>
                  </button>
                  <button className="btn btn-primary custom-btn my-1 p-xs-2 p-md-3"
                    onClick={this.signUp}
                    type="button"
                  >
                    <h6 className="UC">{'Sign Up'}</h6>
                  </button>
                  {/*<button className="btn btn-primary p-xs-2 p-md-3 my-2"
                    onClick={this.onMlhLogin}
                    type="button"
                  >
                    <h6 className=" UC">{'Log in/Sign Up with MLH'}</h6>
                  </button>*/}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

LoginForm.propTypes = {
  loginManager: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    isLoggedIn: PropTypes.bool,
    forgottenPassword: PropTypes.bool,
    magicLink: PropTypes.string,
    alertMessage: PropTypes.string
  }).isRequired,
  checkMagicLink: PropTypes.func.isRequired,
  attemptSignUp: PropTypes.func.isRequired,
  attemptLogin: PropTypes.func.isRequired,
  consumeLink: PropTypes.func.isRequired,
  requestLink: PropTypes.func.isRequired,
  changeEmail: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired
  //mlhLogin: PropTypes.func.isRequired not in use

};

function mapStateToProps(state) {
  return {
    loginManager: state.loginManager
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    checkMagicLink: loginActions.checkMagicLink,
    attemptSignUp: loginActions.attemptSignUp,
    attemptLogin: loginActions.attemptLogin,
    consumeLink: loginActions.consumeLink,
    requestLink: loginActions.requestLink,
    changeEmail: loginActions.changeEmail,
    changePassword: loginActions.changePassword,
    //mlhLogin: loginActions.mlhLogin not in use
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps) (LoginForm);
