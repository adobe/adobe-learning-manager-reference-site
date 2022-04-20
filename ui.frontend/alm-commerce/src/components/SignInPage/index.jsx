import { useEffect, useRef } from "react";
import { useAlmSignIn } from "../../hooks/SignIn/useSignIn";

const SignIn = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const { handleSubmit, isLoggedIn, isSigningIn, error } = useAlmSignIn();

  const click = (event) => {
    handleSubmit({
      email: emailRef.current.value,
      password: passwordRef.current.value,
    });
  };

  useEffect(() => {
    // if (isLoggedIn) {
    //     alert("redirect to cart page");
    // }
  }, []);
  return (
    <div>
      <input ref={emailRef} defaultValue="pugalia@adobe.com" />

      <input ref={passwordRef} type="password" defaultValue="Learner#12" />

      <button onClick={click}>SignIN</button>

      <br />
      <br />
      <br />
      <span>is isLoggedIn :{isLoggedIn ? "Yes" : "No"}</span>
      <span>is isSigningIn :{isSigningIn ? "Yes" : "No"}</span>

      <br />
      <span>{error["signInError"]}</span>
    </div>
  );
};

export default SignIn;
