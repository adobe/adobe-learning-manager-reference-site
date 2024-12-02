import { Item, Picker } from "@adobe/react-spectrum";
import React, { useEffect, useState } from "react";
import { GetTranslationsReplaced } from "../../../utils/translationService";

interface Option {
  id: string;
  name: string;
}

const ALMCustomPicker: React.FC<{
  options: Option[];
  onOptionSelected: (selectedOption: string) => void;
  defaultSelectedOptionId: string;
}> = props => {
  const { options, onOptionSelected, defaultSelectedOptionId } = props;
  const defaultSelectedKey = defaultSelectedOptionId;
  const defaulSelectedOption = options.find(option => option.id === defaultSelectedOptionId);
  const defaultSelectedOptionName = defaulSelectedOption?.name!;
  let selectedItemText = GetTranslationsReplaced(
    "alm.sort.selectedOption",
    {
      selectedOption: defaultSelectedOptionName,
    },
    true
  );
  const [selectedItemAriaLabel, setSelectedItemAriaLabel] = useState<string>(selectedItemText);
  useEffect(() => {
    selectedItemText = GetTranslationsReplaced(
      "alm.sort.selectedOption",
      {
        selectedOption: defaultSelectedOptionName,
      },
      true
    );
    setSelectedItemAriaLabel(selectedItemText);
  }, [defaultSelectedOptionName]);
  const handleOptionSelected = (key: React.Key) => {
    const selectedOption = options.find(option => option.id === key);
    const selectedItemText = GetTranslationsReplaced(
      "alm.sort.selectedOption",
      {
        selectedOption: selectedOption?.name!,
      },
      true
    );
    setSelectedItemAriaLabel(selectedItemText);
    selectedOption && onOptionSelected(selectedOption.id);
  };
  return (
    <Picker
      items={options}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={key => handleOptionSelected(key)}
      aria-label={selectedItemAriaLabel}
    >
      {options.map(option => (
        <Item key={option.id} data-automationid={option.name}>
          {option.name}
        </Item>
      ))}
    </Picker>
  );
};

export default ALMCustomPicker;
