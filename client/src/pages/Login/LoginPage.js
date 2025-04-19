/**
 * @fileoverview The very first page the user will see. Asks the user to input
 *               their username credentials and its corresponding password
 * Uses:
 * - React for rendering HTML
 */

// Imports of packages
import React from "react";

// Imports of local components
import LoginForm from "./LoginForm/LoginForm";
import LoginSplash from "./LoginSplash";

// Style-based imports
import "./login.css";

/**
 * Makes the component containing the whole login page, including
 * the splash animation and login form, and mobile version
 * @return {React.Component}
 */
function LoginPage() {
  return (
    <div className="login-page">
      <LoginSplash />
      <div className="login-form">
        <WebsiteBrand />
        <h1>Sign In</h1>
        <h2>Welcome! Log in to access your personal artefact register.</h2>
        <h3>New here? <a href="/signup">Sign up today</a></h3>
        <LoginForm />
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

export default LoginPage;
