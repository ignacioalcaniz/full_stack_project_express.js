import React from "react";
import { render } from "@react-email/render";
import PurchaseEmail from "../components/PurchaseEmail.jsx";

export function renderEmail(props = {}) {
  return render(<PurchaseEmail {...props} />);
}

