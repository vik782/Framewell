/**
 * @fileoverview The very first page the user will see. Asks the user to input
 *               their username credentials and its corresponding password
 * Uses:
 * - React for rendering HTML
 */

// Imports of packages
import React from "react";

// Imports of local components
import SignUpForm from "./SignUpForm";
import LoginSplash from "../Login/LoginSplash";

// Style-based imports
import "../Login/login.css";

/**
 * Makes the component containing the whole login page, including
 * the splash animation and login form, and mobile version
 * @return {React.Component}
 */
function SignUpPage() {
  return (
    <div className="login-page">
      <LoginSplash />
      <div className="login-form">
        <WebsiteBrand />
        <h1>Sign Up</h1>
        <h2>Make a new account today!</h2>
        <h3>Have an account? <a href="/login">Sign in!</a></h3>
        <SignUpForm />
      </div>
    </div>
  );
}

/**
 * A component that uses the webiste logo to make a brand for
 * the Framewell
 * @return {React.Component}
 */
function WebsiteBrand() {
  let /** @file The website logo */ picture =
    require("../../pictures/WebsiteLogo.png");

  return (
    <div className="website-brand">
      <img src={picture} alt=""/>
      <span>Framewell</span>
    </div>
  );
}

export default SignUpPage;
