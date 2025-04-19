/**
 * @fileoverview The component that renders the fancy animation splash
 * Uses:
 * - React for rendering HTML
 */

// Imports of packages
import React from "react";

// Style-based imports
import "./splash.css";

/**
 * Renders divs in a way that obeys `splash.css` to do an animation
 */
export default function LoginSplash() {
  /* Since it is a static image, it makes sense to store it
   * in the client-side */
  /** @file The website logo */
  const websiteLogo = require("../../pictures/WebsiteLogo.png");
  return (
    <div className="login-splash">
      <div className="imgCenter">
        <div className="titled-logo">
          <img src={websiteLogo} alt="Website Logo" />
          <h1>Framewell</h1>
        </div>
      </div>
      <div className="circle-wrapper">
        <div className="left-circle"></div>
        <div className="right-circle"></div>
      </div>
    </div>
  );
}
