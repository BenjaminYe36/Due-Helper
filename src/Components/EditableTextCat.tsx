import React, {useState} from 'react';
import {Input, message} from "antd";
import ModelAPI from "../Model & Util/ModelAPI";
import {withTranslation, WithTranslation} from 'react-i18next';

interface EditableTextCatProps extends WithTranslation {
    value: string; // initial value in this editable text element
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}


/**
 * A component with editable inner text by double-clicking to toggle to edit
 */
const EditableTextCat: React.FC<EditableTextCatProps> = (props) => {
    // whether this component is editable or not
    const [isEditable, setIsEditable] = useState(false);
    // current value in the input box
    const [value, setValue] = useState(props.value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            saveEdit();
        } else if (event.key === 'Escape') {
            // revert back to original text
            setIsEditable(false);
            setValue(props.value);
        }
    };

    const saveEdit = () => {
        let isInvalid = false;
        setIsEditable(false);
        // doesn't allow empty or duplicated category names
        if (value.trim() === "") {
            message.warning(props.t('warn.no-empty-cat'));
            isInvalid = true;
        } else if (value !== props.value && props.model.hasCat(value)) {
            message.warning(props.t('warn.no-duplicate-cat'));
            isInvalid = true;
        } else if (value !== props.value) {
            props.model.replaceCatName(props.value, value);
            props.updateSelection('Cat-' + value);
            props.refreshModel();
        }
        if (isInvalid) {
            // revert back to original text
            setValue(props.value);
        }
    };

    return (
        !isEditable ?
            (<span
                style={{
                    paddingLeft: "10px"
                }}
                onDoubleClick={() => setIsEditable(true)}>
                {value}
            </span>) :
            (<Input type="text"
                    value={value}
                    autoFocus
                // Select all when focused
                    onFocus={(event) => {
                        event.target.select();
                    }}
                    onBlur={saveEdit}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
            />)
    );
};

export default withTranslation()(EditableTextCat);