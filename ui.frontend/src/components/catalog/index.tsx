import React from "react";
import { useAuthContext } from "../../externalLib";

const Catalog = () => {
  const { accessToken, updateAccessToken } = useAuthContext();
  const authenticateUser = () => {
    updateAccessToken("abcd");
  };
  return (
    <>
      <div>Hi from Catalog component</div>
      <button onClick={authenticateUser}>Hi From Test, {accessToken}</button>
    </>
  );
};
export default Catalog;
