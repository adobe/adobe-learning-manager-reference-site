import React, { useRef } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useFocusRing } from "@react-aria/focus";
import styles from "./PrimeCheckBox.module.scss";

const PrimeCheckbox: React.FC<{
  label: string;
  filterType: string;
  checked: boolean;
  changeHandler: Function;
}> = (props) => {
  let ref = useRef<HTMLInputElement>(null);
  let { isFocusVisible, focusProps } = useFocusRing();
  const { checked, filterType, label, changeHandler } = props;
  const onChangeHandler = (event: any) => {
    const { checked } = ref.current!;
    changeHandler({
      filterType,
      checked,
      label,
    });
  };

  return (
    <label className={styles.primeCheckBoxLabel}>
      <VisuallyHidden>
        <input
          type="checkbox"
          onChange={onChangeHandler}
          checked={checked}
          {...focusProps}
          ref={ref}
        />
      </VisuallyHidden>
      <svg
        width="24"
        height="24"
        aria-hidden="true"
        className={styles.primeCheckBoxSVG}
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          fill={checked ? "#FFFFFF" : "none"}
          stroke="#C3C3C3"
          strokeWidth="2"
        />
        {checked && (
          <path
            transform="translate(7 7)"
            fill="#306EB5"
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
          1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
          6A.999.999 0 0 1 3.788 9z`}
          />
        )}
        {isFocusVisible && (
          <rect
            x="1"
            y="1"
            width="22"
            height="22"
            fill="none"
            stroke="#306EB5"
            strokeWidth="2"
          />
        )}
      </svg>
      {props.label}
    </label>
  );
};

export default PrimeCheckbox;
