import { useDisclosure } from "@mantine/hooks";
import { Box, PasswordInput, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMultiply } from "@fortawesome/free-solid-svg-icons";

export default function MyPasswordBox({ className, description, error, isDisabled = false, isReadOnly = false, label, leftIcon, onChange, placeholder, rightIcon, value, variant = "filled" }) {
	const [visible, { toggle }] = useDisclosure(false);

	function PasswordRequirement({ meets, label }) {
		return (
			<Text c={meets ? "teal" : "red"} style={{ display: "flex", alignItems: "center" }} mt={7} size="sm">
				{meets ? <FontAwesomeIcon icon={faCheck} size="1x" /> : <FontAwesomeIcon icon={faMultiply} size="1x" />}
				<Box ml={10}>{label}</Box>
			</Text>
		);
	}

	function VisibilityToggleIcon({ reveal }) {
		if (reveal) return eyeOffIcon;
		return eyeOnIcon;
	}

	return <PasswordInput className={className} description={description} disabled={isDisabled} error={error} label={label} leftSectionPointerEvents="none" leftSection={leftIcon} onChange={onChange} onVisibilityChange={toggle} placeholder={placeholder} readOnly={isReadOnly} rightSectionPointerEvents="none" rightSection={rightIcon} value={value} variant={variant} visibilityToggleIcon={VisibilityToggleIcon} visible={visible} />;
}
