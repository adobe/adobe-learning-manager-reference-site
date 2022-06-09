/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { Button, Form, TextField } from "@adobe/react-spectrum";
import { useState } from "react";
import { useAlmSignIn } from "../../hooks/SignIn/useSignIn";
import CommerceLoader from "../Common/Loader";
import styles from "./signIn.module.css";

const LOGIN = "LOGIN";
const FORGOT_PASSWORD = "FORGOT_PASSWORD";
const CREATE_ACCOUNT = "CREATE_ACCOUNT";
const RESET_PASSWORD = "RESET_PASSWORD";

const SignIn = () => {
  const {
    signInHandler,
    createAccountHandler,
    forgotPasswordHandler,
    isLoading,
    error,
  } = useAlmSignIn();
  const emptyForgotPasswordFormValue = { email: "" };
  const emptySignInFormValues = { email: "", password: "" };
  const emptyAccountFormValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    is_subscribed: false,
  };
  const [forgotPasswordForm, setForgotPasswordForm] = useState(
    emptyForgotPasswordFormValue
  );
  const [signInForm, setSignInForm] = useState(emptySignInFormValues);
  const [createAccountForm, setCreateAccountForm] = useState(
    emptyAccountFormValues
  );

  const [view, setView] = useState(LOGIN);

  let firstname, lastname, email, password;

  if (view === CREATE_ACCOUNT) {
    ({ firstname, lastname, email, password } = createAccountForm);
  } else if (view === LOGIN) {
    ({ email, password } = signInForm);
  } else {
    ({ email } = forgotPasswordForm);
  }

  const submitHandler = (event) => {
    event.preventDefault();
    if (view === CREATE_ACCOUNT) {
      createAccountHandler(createAccountForm);
    } else if (view === LOGIN) {
      signInHandler(signInForm);
    } else {
      try {
        forgotPasswordHandler(forgotPasswordForm);
        setView(RESET_PASSWORD);
      } catch (e) {
        console.error("Reset password failed");
      }
    }
  };

  const setValue = (key, value) => {
    if (view === CREATE_ACCOUNT) {
      setCreateAccountForm((prevState) => {
        return { ...prevState, [key]: value };
      });
    } else if (view === LOGIN) {
      setSignInForm((prevState) => {
        return { ...prevState, [key]: value };
      });
    } else {
      setForgotPasswordForm((prevState) => {
        return { ...prevState, [key]: value };
      });
    }
  };

  return (
    <div className={styles.signInContainer}>
      <h1 className={styles.label}>Login</h1>
      {view !== RESET_PASSWORD ? (
        <Form
          maxWidth="size-3600"
          UNSAFE_className={styles.form}
        >
          <span className={styles.error}>
            {error["signInError"] || error["createAccountError"]}
          </span>

          {view === CREATE_ACCOUNT && (
            <>
              <TextField
                label="First Name"
                name="firstname"
                value={firstname}
                onChange={(value) => setValue("firstname", value)}
                isRequired={true}
                UNSAFE_className={styles.mandatory}
                onKeyDown={(event) => console.log(event)}
              />
              <TextField
                label="Last Name"
                value={lastname}
                name="lastname"
                onChange={(value) => setValue("lastname", value)}
                isRequired={true}
                UNSAFE_className={styles.mandatory}
              />
            </>
          )}

          <TextField
            label="Email"
            name="email"
            value={email}
            onChange={(value) => setValue("email", value)}
            isRequired={true}
            UNSAFE_className={styles.mandatory}
          />
          {view !== FORGOT_PASSWORD && (
            <TextField
              label="Password"
              value={password}
              type="password"
              onChange={(value) => setValue("password", value)}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          )}

          {view === LOGIN && (
            <div>
              <Button
                variant="overBackground"
                type="button"
                onPress={() => setView(FORGOT_PASSWORD)}
                isDisabled={isLoading}
                UNSAFE_className={styles.forgotPassword}
              >
                Forgot Password?
              </Button>
              <button
                type="submit"
                onClick={submitHandler}
                disabled={isLoading}
                className={`almButton primary ${styles.commonButton}`}
              >
                {isLoading ? <CommerceLoader size="S" /> : "Login"}
              </button>

              <button
                type="button"
                onClick={() => setView(CREATE_ACCOUNT)}
                disabled={isLoading}
                className={`almButton secondary ${styles.commonButton}`}

              >
                Create an Account
              </button>
            </div>
          )}
          {view !== LOGIN && (
            <div>
              <button
                type="submit"
                onClick={submitHandler}
                disabled={isLoading}
                className={`almButton primary ${styles.commonButton}`}

              >
                {view === CREATE_ACCOUNT ? "Create an Account" : "Submit"}
              </button>

              <button
                type="button"
                onClick={() => setView(LOGIN)}
                disabled={isLoading}
                className={`almButton secondary ${styles.commonButton}`}


              >
                Cancel
              </button>
            </div>
          )}
        </Form>
      ) : (
        <div className={styles.recoverPassword}>
          <div className={styles.recoverPasswordText}>Recover Password</div>
          <div className={styles.emailSentText}>
            If there is an account associated with {email} you will receive an
            email with a link to change your password.
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
