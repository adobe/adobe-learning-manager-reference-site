import styles from "./PrimeCheckBox.module.css";
import { Checkbox } from "@adobe/react-spectrum";
import { GetTranslation } from "../../../utils/translationService";

const PrimeCheckbox: React.FC<{
  label: string;
  filterType: string;
  checked: boolean;
  changeHandler: Function;
  isListDynamic?: boolean;
}> = (props) => {
  const {
    checked,
    filterType,
    label,
    changeHandler,
    isListDynamic = false,
  } = props;
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
      {isListDynamic ? label : GetTranslation(label, true)}
    </Checkbox>
  );
};

export default PrimeCheckbox;
