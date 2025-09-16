import React from "react";
import { render } from "@react-email/render";
import WelcomeEmail from "../components/WelcomeEmail.jsx";

export function renderEmail(props = {}) {
  return render(<WelcomeEmail {...props} />);
}
