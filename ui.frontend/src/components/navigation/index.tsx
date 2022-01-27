import React from "react";
import config from "../../config/config";
import { useAuthContext, useUser } from "../../externalLib";

const { parentContainers } = config;

const dataFromAEM = (
  document.querySelector(parentContainers.navParent) as HTMLElement
)?.dataset;

const Navigation = () => {
  const { accessToken, updateAccessToken } = useAuthContext();

  const { user, loadTheUsers } = useUser();
  const authenticateUser = () => {
    updateAccessToken("abcd");
    loadTheUsers();
  };
  return (
    <>
      <div>Hi from Navigation component {user.name}</div>
      <div>
        <a
          target="_blank"
          rel="noreferrer"
          style={{ margin: "10px", padding: "10px" }}
          href={dataFromAEM?.learningPageUrl}
        >
          Learning
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          style={{ margin: "10px", padding: "10px" }}
          href={dataFromAEM?.communityPageUrl}
        >
          Community
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          style={{ margin: "10px", padding: "10px" }}
          href={dataFromAEM?.supportPageUrl}
        >
          Support
        </a>
      </div>
      <button onClick={authenticateUser}>Hi From Test, {accessToken}</button>
    </>
  );
};
export default Navigation;
