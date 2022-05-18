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
      {view !== RESET_PASSWORD ? (
        <Form
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
              <br />
              <Button
                variant="cta"
                type="submit"
                onPress={submitHandler}
                isDisabled={isLoading}
                UNSAFE_className={styles.button}
              >
                {isLoading ? <CommerceLoader size="S" /> : "LOGIN"}
              </Button>

              <Button
                variant="cta"
                type="button"
                onPress={() => setView(CREATE_ACCOUNT)}
                isDisabled={isLoading}
                UNSAFE_className={styles.createAccountButton}
              >
                CREATE AN ACCOUNT
              </Button>
            </div>
          )}
          {view !== LOGIN && (
            <div>
              <Button
                variant="cta"
                type="button"
                onPress={submitHandler}
                isDisabled={isLoading}
                UNSAFE_className={styles.createAccountButton}
              >
                {view === CREATE_ACCOUNT ? "CREATE AN ACCOUNT" : "SUBMIT"}
              </Button>

              <Button
                variant="secondary"
                type="button"
                onPress={() => setView(LOGIN)}
                isDisabled={isLoading}
                UNSAFE_className={styles.cancelButton}
              >
                CANCEL
              </Button>
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
