import React, { useRef } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useFocusRing } from "@react-aria/focus";

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
    <label style={{ display: "flex", alignItems: "center" }}>
      <VisuallyHidden>
        <input
          type="checkbox"
          onChange={onChangeHandler}
          checked={checked}
          {...focusProps}
          ref={ref}
        />
      </VisuallyHidden>
      <svg width={24} height={24} aria-hidden="true" style={{ marginRight: 4 }}>
        <rect
          x={checked ? 4 : 5}
          y={checked ? 4 : 5}
          width={checked ? 16 : 14}
          height={checked ? 16 : 14}
          fill={checked ? "orange" : "none"}
          stroke={checked ? "none" : "gray"}
          strokeWidth={2}
        />
        {checked && (
          <path
            transform="translate(7 7)"
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
          1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
          6A.999.999 0 0 1 3.788 9z`}
          />
        )}
        {isFocusVisible && (
          <rect
            x={1}
            y={1}
            width={22}
            height={22}
            fill="none"
            stroke="orange"
            strokeWidth={2}
          />
        )}
      </svg>
      {props.label}
    </label>
  );
};

export default PrimeCheckbox;
