import { useState } from "react";
import { useAlmSignIn } from "../../hooks/SignIn/useSignIn";
import styles from "./signIn.module.css";
import { Button, Form, TextField } from '@adobe/react-spectrum';
import CommerceLoader from "../Common/Loader"

const SignIn = () => {
  const { handleSubmit, isSigningIn, error } = useAlmSignIn();
  const [state, setState] = useState({ email: "", password: "" })
  const { email, password } = state;
  const submitHandler = (event) => {
    handleSubmit({
      email,
      password
    });
  };
  const setValue = (key, value) => {
    setState((prevState) => {
      return { ...prevState, [key]: value }
    })
  }


  return (
    <div className={styles.signInContainer}>

      <Form maxWidth="size-3600" aria-labelledby="label-3" UNSAFE_className={styles.form}>
        <span className={styles.error}>{error["signInError"]}</span>

        <TextField label="Email" name="email" value={email}
          onChange={(value) => setValue("email", value)} />
        <TextField label="Password" value={password} type="password" onChange={(value) => setValue("password", value)} />
        <br />
        <Button variant="cta" type="button" onPress={submitHandler} isDisabled={isSigningIn}>
          {
            isSigningIn ? <CommerceLoader size="S" /> : "Login"
          }
        </Button>
      </Form>
    </div>
  );
};

export default SignIn;
