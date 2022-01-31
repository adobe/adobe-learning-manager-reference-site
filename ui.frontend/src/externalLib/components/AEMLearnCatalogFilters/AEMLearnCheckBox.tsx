import React, { useState,useEffect, useRef } from "react";
//import {useCheckbox} from '@react-aria/checkbox';
import {useToggleState} from '@react-stately/toggle';
import {VisuallyHidden} from '@react-aria/visually-hidden';
import {useFocusRing} from '@react-aria/focus';


const AEMLearnCheckbox : React.FC< {label: string, filterType: string}> = (props)  => {
  //let state = useToggleState(props);
  let ref = useRef<HTMLInputElement>(null);
  let [checked, setChecked] = useState(false); 
  //let {inputProps} = useCheckbox(props, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  const onChangeHandler = () => {
    setChecked((previousState) => !previousState); 
  }

//   useEffect( () => {
//     props.onFilterChangeHandler(props.label, checked);
//   }, [checked]);

  return (
    <label style={{display: 'flex', alignItems: 'center'}}>
      <VisuallyHidden>
        {/* <input {...inputProps} {...focusProps} ref={ref} /> */}
        <input type="checkbox" onChange={onChangeHandler} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <svg
        width={24}
        height={24}
        aria-hidden="true"
        style={{marginRight: 4}}>
        <rect
          x={checked ? 4 : 5}
          y={checked ? 4 : 5}
          width={checked ? 16 : 14}
          height={checked ? 16 : 14}
          fill={checked ? 'orange' : 'none'}
          stroke={checked ? 'none' : 'gray'}
          strokeWidth={2} />
        {checked &&
          <path
            transform="translate(7 7)"
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
            1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
            6A.999.999 0 0 1 3.788 9z`} />
        }
        {isFocusVisible &&
          <rect
            x={1}
            y={1}
            width={22}
            height={22}
            fill="none"
            stroke="orange"
            strokeWidth={2} />
        }
      </svg>
      {props.label}
    </label>
  );
}

export default AEMLearnCheckbox;



