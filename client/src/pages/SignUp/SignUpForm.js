/**
 * @fileoverview The form that parses the username and password for making a
 *               valid authentication
 * Uses:
 * - React for rendering HTML
 * - Universal Cookie for handling browser cookies and validating logins
 */

// Imports of packages
import React, { useState } from "react";
import Cookies from "universal-cookie";

// Imports of local components
import Enquiries from "../Login/LoginForm/Enquiries";
import TextInteractions from "../Login/LoginForm/TextInteractions";

// Imports of local utils
import { getSignUpPromise } from "../../utils/dataHandler";

// Style-based imports
import "../Login/login.css";

// Cookies for checking if the user is currently logged in
const cookies = new Cookies();

// login states for adding CSS coloring on top of the CSS class "inputClass"
/** {{initial: string, invalid: string, valid: string}} */
const states = {
  initial: "login-initial",
  invalid: "login-invalid",
  valid: "login-valid",
};

/** {{login-initial: string, login-invalid: string, login-valid: string}} */
const feedbackMapper = {
  "login-initial": "",
  "login-invalid": "Invalid username or password. Please try again",
  "login-valid": "Successfully logged in!",
};

/**
 * The component that contains the form data, stores the username and password
 * and compares it against the database credentials
 * @return {React.Component}
 */
export default function SignUpForm() {
  // const navigate = useNavigate();
  /** {{isValid: boolean, currState: string}} */
  let [loginState, setLoginState] = useState({
    isValid: false,
    currState: states.initial,
  });

  const /** string */ [username, setUserName] = useState("");
  const /** string */ [password, setPassword] = useState("");
  const /** string */ [isDisabled, setIsDisabled] = useState(false);

  /**
   * Requests the server-side to create a new user account
   * @param e The javascript event
   */
  async function handleSignUp(e) {
    // prevent the form from refreshing the whole page
    e.preventDefault();

    setIsDisabled(true);

    setLoginState({
      isValid: false,
      currState: states.initial,
    });

    getSignUpPromise(username, password)
      .then((res) => {
        // set the cookie upon successful login
        cookies.set("TOKEN", res.data.token, {
          path: "/",
        });
        inputClass = res.data.isValid ? states.valid : states.invalid;
        setLoginState({
          currState: inputClass,
          isValid: res.data.isValid,
        });
      })
      .catch((err) => {
        console.log(isDisabled);
        // Login returned an invalid input
        inputClass = states.invalid;
        setLoginState({
          currState: inputClass,
          isValid: false,
        });
        console.log(err);
        setIsDisabled(false);
      });
  }

  if (loginState.isValid) {
    window.location.href = "/dashboard";
  }

  let inputClass /** string */;
  inputClass = "input-field " + loginState.currState;
  let /** string */ feedbackMessage = feedbackMapper[loginState.currState];

  return (
    <form action="/signup" method="post" onSubmit={(e) => handleSignUp(e)}>
      <ul>
        <Enquiries
          inputClass={inputClass}
          setUserName={setUserName}
          setPassword={setPassword}
        />
        <TextInteractions feedbackMessage={feedbackMessage} />
        <li>
          <button type="submit" disabled={isDisabled}>
            Sign Up
          </button>
        </li>
      </ul>
    </form>
  );
}
