import React from "react";
import config from "../../config/config";

const { parentContainers } = config;

const dataFromAEM = (
  document.querySelector(parentContainers.navParent) as HTMLElement
)?.dataset;

const Navigation = () => {
  return (
    <>
      <div>Hi from Navigation component</div>
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
    </>
  );
};
export default Navigation;
