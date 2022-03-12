import styles from "./PrimeCheckBox.module.css";
import { Checkbox } from "@adobe/react-spectrum";

const PrimeCheckbox: React.FC<{
  label: string;
  filterType: string;
  checked: boolean;
  changeHandler: Function;
}> = (props) => {
  const { checked, filterType, label, changeHandler } = props;
  const onChangeHandler = (checked: boolean) => {
    changeHandler({
      filterType,
      checked,
      label,
    });
  };

  return (
    <Checkbox
      onChange={onChangeHandler}
      isSelected={checked}
      UNSAFE_className={styles.primeChechbox}
    >
      {label}
    </Checkbox>
  );
};

export default PrimeCheckbox;
