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
import Cancel from "@spectrum-icons/workflow/Cancel";
import Send from "@spectrum-icons/workflow/Send";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
} from "react";
import { useIntl } from "react-intl";
import Quill from "quill";
import { PrimeCommunityLinkPreview } from "../PrimeCommunityLinkPreview";
import styles from "./PrimeCommunityObjectInput.module.css";
import "quill/dist/quill.snow.css";
import "quill-mention/dist/quill.mention.css";
import { getRootParentId, loadMentionedUsers } from "../../../utils/mentionUtils";

import { Mention } from "quill-mention";
Quill.register("modules/mention", Mention);

const Embed = Quill.import("blots/embed") as any;

class ALMMentionBlot extends Embed {
  static blotName = "mention";
  static tagName = "A";
  static className = "ql-mention";

  static create(data: any) {
    const node = super.create();

    node.setAttribute("href", `#/userProfile/${data.id}`);
    node.setAttribute("target", "_self");
    node.setAttribute("data-id", data.id);
    node.setAttribute("data-value", data.value);
    node.setAttribute("data-type", data.type);
    node.setAttribute("contenteditable", "false");

    let label = data.value;
    if (label.startsWith("@")) {
      label = label.slice(1);
    }
    node.innerText = label;
    node.classList.add("mention");
    node.style.color = data.color || "#007bff";
    node.style.textDecoration = "none";

    return node;
  }

  static value(domNode: HTMLElement) {
    return {
      id: domNode.getAttribute("data-id"),
      value: domNode.getAttribute("data-value"),
      type: domNode.getAttribute("data-type"),
      href: domNode.getAttribute("href"),
    };
  }
}

Quill.register(ALMMentionBlot);

// TypeScript interfaces for the QuillEditor props
interface QuillEditorProps {
  readOnly?: boolean;
  defaultValue?: string;
  placeholder?: string;
  onTextChange?: (delta: any, oldDelta: any, source: any) => void;
  onSelectionChange?: (range: any, oldRange: any, source: any) => void;
  toolbarOptions?: any[];
  mentionModule?: any;
}

// Interface for the exposed ref methods
interface QuillEditorRef {
  getText: () => string;
  root?: HTMLDivElement;
  getContents: () => any;
  getHTML: () => string;
  setContents: (delta: any) => void;
  setHTML: (html: string) => void;
  enable: (enabled: boolean) => void;
  disable: () => void;
  focus: () => void;
  blur: () => void;
}

// Editor component using vanilla Quill - following the reference pattern
const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  (
    {
      readOnly = false,
      defaultValue = "",
      placeholder = "",
      onTextChange,
      onSelectionChange,
      toolbarOptions = [],
      mentionModule = {},
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && typeof ref === "object" && "current" in ref) {
        (ref as MutableRefObject<Quill | null>).current?.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
          mention: mentionModule,
        },
        placeholder: placeholder,
        formats: [
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "indent",
          "link",
          "image",
          "color",
          "background",
          "align",
          "mention",
        ],
      });

      if (ref && typeof ref === "object" && "current" in ref) {
        (ref as MutableRefObject<Quill | null>).current = quill;
      }

      if (defaultValueRef.current) {
        quill.root.innerHTML = defaultValueRef.current;
      }

      quill.on("text-change", (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on("selection-change", (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      // Handle mention clicks
      quill.root.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains("ql-mention")) {
          e.preventDefault();
          const userId = target.getAttribute("data-id");
          const userName = target.getAttribute("data-value");
          console.log("Mention clicked:", { userId, userName });
          // Add your navigation logic here
        }
      });

      return () => {
        if (ref && typeof ref === "object" && "current" in ref) {
          (ref as MutableRefObject<Quill | null>).current = null;
        }
        if (container) {
          container.innerHTML = "";
        }
      };
    }, [ref]); // Only depend on ref, not other props to prevent recreation

    return (
      <div ref={containerRef} className={styles.primePostObjectInput}></div>
    );
  },
);

QuillEditor.displayName = "QuillEditor";

const PrimeCommunityObjectInput = React.forwardRef<Quill, any>((props, ref) => {
  const { formatMessage } = useIntl();
  const objectTextLimit = props.characterLimit ? props.characterLimit : 1000;
  const emptyString = "";
  const [charactersRemaining, setCharactersRemaining] =
    useState(objectTextLimit);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const firstRun = useRef(true);
  const [userInputText, setUserInputText] = useState(
    props.defaultValue ? props.defaultValue : "",
  );
  const [characterCount, setCharacterCount] = useState(0);

  const boardId = getRootParentId(props?.object) || props.boardId;

  // Ref for the Quill editor
  const quillRef = useRef<Quill | null>(null);

  // Forward the Quill editor reference directly
  useImperativeHandle(ref, () => quillRef.current as Quill, [quillRef.current]);

  const exitActions = () => {
    setUserInputText(emptyString);
    setCharactersRemaining(objectTextLimit);
    setShowLinkPreview(false);
  };

  const primaryActionHandler = () => {
    if (characterCount <= 0) {
      return;
    }
    if (typeof props.primaryActionHandler === "function") {
      props.primaryActionHandler(userInputText);
      exitActions();
    }
  };

  const secondaryActionHandler = () => {
    if (typeof props.secondaryActionHandler === "function") {
      props.secondaryActionHandler(userInputText);
      exitActions();
    }
  };

  const stripHtmlTags = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const checkTextCount = () => {
    if (quillRef.current) {
      const currentInputLength = stripHtmlTags(
        quillRef.current.root.innerHTML,
      ).length;
      if (currentInputLength > 0) {
        if (typeof props.enablePrimaryAction === "function") {
          quillRef.current.getText().trim() !== ""
            ? props.enablePrimaryAction()
            : props.disablePrimaryAction();
        }
      } else {
        if (typeof props.disablePrimaryAction === "function") {
          props.disablePrimaryAction();
        }
      }
    }
  };

  const processInput = async () => {
    checkTextCount();
    if (!showLinkPreview) {
      setShowLinkPreview(true);
    } else if (userInputText === emptyString) {
      setShowLinkPreview(false);
    }
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (props.defaultValue !== "") {
        processInput();
      }
    }
  }, [props.defaultValue]);

  const tooltipPlaceholder = "Please enter a link";
  useEffect(() => {
    const handleTooltipClick = function () {
      const tooltipInputElement = document.querySelector(
        '.ql-tooltip input[placeholder="https://quilljs.com"]',
      );
      if (tooltipInputElement) {
        tooltipInputElement.setAttribute("placeholder", tooltipPlaceholder);
      }
    };

    document.addEventListener("click", handleTooltipClick);
    return () => {
      document.removeEventListener("click", handleTooltipClick);
    };
  }, []);

  const handleEditorTextChange = (delta: any, oldDelta: any, source: any) => {
    if (quillRef.current) {
      const html = quillRef.current.root.innerHTML;
      const charCount = stripHtmlTags(html).length;

      if (charCount <= objectTextLimit) {
        setUserInputText(html);
        setCharacterCount(charCount);
        const charRemainingCount =
          objectTextLimit < charCount ? 0 : objectTextLimit - charCount;
        setCharactersRemaining(charRemainingCount);
      }
      processInput();
    }
  };

  const toolbarOptions = props.concisedToolbarOptions
    ? [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ color: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ]
    : [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ];

  // Mention module configuration with custom renderItem following reference pattern
  const mentionModule = {
    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    mentionDenotationChars: ["@"],
    dataAttributes: ["id", "value", "type"],
    source: async (
      searchTerm: string,
      renderList: (
        items: Array<{
          id: number | string;
          value: string;
          type: string;
          avatar?: string;
        }>,
        searchTerm: string,
      ) => void,
      mentionChar: string,
    ) => {
      if (!boardId) {
        const selectBoardMessage = {
          id: "select-board",
          value: "Please select a board first",
          type: "message",
        };
        renderList([selectBoardMessage], searchTerm);
        return;
      }

      if (searchTerm.length > 2) {
        try {
          const users = await loadMentionedUsers(boardId, searchTerm);
          const matches = users.map((user) => ({
            id: user.id,
            value: user.name,
            type: user.type,
            avatar: user.avatarUrl,
            email: user.email,
          }));
          renderList(matches, searchTerm);
        } catch (error) {
          console.error("Error loading mentioned users:", error);
          renderList([], searchTerm);
        }
      }
    },
    renderItem: function (item: {
      id: number | string;
      value: string;
      type: string;
      avatar?: string;
      color?: string;
      email?: string;
    }) {
      const div = document.createElement("div");
      if (item.type === "message" && item.id === "select-board") {
        div.className = "ql-mention-list-item-container-message";
        div.innerHTML = `
          <div class="ql-mention-item">
            <span class="name">${item.value}</span>
          </div>
        `;
      } else if (item.avatar) {
        div.className = "ql-mention-list-item-container";
        div.innerHTML = `
          <img src="${item.avatar}" alt="${item.value}" height="32" width="32" />
          <div class="ql-mention-item">
            <span class="name">${item.value}</span>
            ${item.email ? `<span class="email">${item.email}</span>` : ""}
          </div>`;
      } else {
        div.innerHTML = `
          <div class="ql-mention-item">
            <span class="name">${item.value}</span>
            ${item.email ? `<span class="email">${item.email}</span>` : ""}
          </div>
        `;
      }
      return div;
    },
    onSelect: function (item: any, insertItem: any) {
      // Customize the mention insertion to add href and styling
      const mentionData = {
        ...item,
        href: `#/userProfile/${item.id}`,
        target: "_self",
      };
      console.log("mentionData", mentionData);
      insertItem(mentionData);
    },
  };

  return (
    <>
      <div className={styles.primePostObjectWrapper}>
        <QuillEditor
          ref={quillRef}
          readOnly={false}
          defaultValue={userInputText}
          placeholder={props.inputPlaceholder}
          onTextChange={handleEditorTextChange}
          onSelectionChange={() => {}}
          toolbarOptions={toolbarOptions}
          mentionModule={mentionModule}
        />
        <style>{`
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 10px;
        }
       
        .ql-editor a {
          text-decoration: none !important;
          cursor: pointer;
          width: fit-content;
          display: inline-block;
          padding: 0;
        }
        
        .ql-tooltip {
          display:flex;
          z-index:2000;
          position:${props.concisedToolbarOptions ? "absolute" : "fixed"} !important;
        }
        
        .ql-container.ql-snow {
          max-height: fit-content !important;
        }
        
        /* Mention styles for latest quill-mention */
        .ql-mention-list-container {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          max-height: 200px;
          overflow-y: auto;
          z-index: 2001;
        }
        
        .ql-mention-list-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .ql-mention-list-item:hover {
          background-color: #f5f5f5;
        }
        
        .ql-mention-list-item-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ql-mention-list-item-container img {
          border-radius: 50%;
          object-fit: cover;
        }
        
        .ql-mention-item {
          display: flex;
          flex-direction: column;
        }
        
        .ql-mention-item .name {
          font-weight: 500;
          color: #333;
        }
        
        .ql-mention-item .email {
          font-size: 12px;
          color: #666;
        }
        
        .ql-mention-list-item-container-message {
          color: #666;
          font-style: italic;
        }
        
        .ql-mention {
          background-color: #e3f2fd;
          border-radius: 3px;
          padding: 2px 4px;
          color: #1976d2;
          text-decoration: none;
          cursor: pointer;
        }
        
        .ql-mention:hover {
          background-color: #bbdefb;
        }
        
        .ql-mention-list-container {
          max-width: 320px;
          border-radius: 12px;
        }

        .ql-mention-list-item {
          line-height: normal;
          padding: 10px;
          height: 52px;
          display: flex;
          align-items: center;
          cursor: pointer;
          &.selected {
            background-color: #f8f8f8;
          }
        }
        
        .ql-mention-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          .name {
          font-size: 14px;
          }
          .email {
            font-size: 12px;
            color: #666;
          }
        }

        .ql-mention.mention {
          background-color: unset !important;
        }
      `}</style>
        <div className={styles.primeTextAreaCountRemaining}>
          {charactersRemaining}{" "}
          {formatMessage({
            id: "alm.community.post.charactersLeft",
            defaultMessage: "characters left",
          })}
        </div>
        {props.primaryActionHandler && (
          <button
            className={styles.primeSaveObjectButton}
            onClick={primaryActionHandler}
          >
            <Send UNSAFE_className={styles.postActionSvg} />
          </button>
        )}
        {props.secondaryActionHandler && (
          <button
            className={styles.primeSaveObjectButton}
            onClick={secondaryActionHandler}
          >
            <Cancel UNSAFE_className={styles.postActionSvg} />
          </button>
        )}
      </div>
      <div className={styles.primePreviewImage}>
        <PrimeCommunityLinkPreview
          currentInput={userInputText}
          showLinkPreview={showLinkPreview}
        ></PrimeCommunityLinkPreview>
      </div>
    </>
  );
});

export default PrimeCommunityObjectInput;
