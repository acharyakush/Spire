import { TextInput } from "@mantine/core";

export default function MyTextBox({ className, description, error, isDisabled, isReadOnly, label, leftIcon, value, onChange, placeholder, rightIcon }) {
	return <TextInput className={className} description={description} disabled={isDisabled} error={error} label={label} leftSectionPointerEvents="none" leftSection={leftIcon} onChange={onChange} placeholder={placeholder} readOnly={isReadOnly} rightSectionPointerEvents="none" rightSection={rightIcon} variant="filled" value={value} />;
}
