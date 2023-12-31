"use client";
import { useState } from "react";
import CreateNameForm from "./CreateNameForm";
import SignUpForm from "./SignUpForm";

interface Props {
  authStatus: "unauthenticated" | "signingUp";
}

export default function FormWrapper({ authStatus }: Props) {
  const [hasSignedUp, setHasSignedUp] = useState(authStatus === "signingUp");

  function goToSecondStage() {
    setHasSignedUp(true);
  }

  function goToFirstStage() {
    setHasSignedUp(false);
  }

  return hasSignedUp ? (
    <CreateNameForm goToFirstStage={goToFirstStage} />
  ) : (
    <SignUpForm goToSecondStage={goToSecondStage} />
  );
}
