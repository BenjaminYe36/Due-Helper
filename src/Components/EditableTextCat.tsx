import React from 'react';
import {Input, message} from "antd";
import ModelAPI from "../Model & Util/ModelAPI";
import {withTranslation, WithTranslation} from 'react-i18next';

interface EditableTextCatProps extends WithTranslation {
    value: string; // initial value in this editable text element
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}

interface EditableTextCatState {
    toggle: boolean; // whether or not this component is editable or not (true means not editable)
    value: string; // current value in the input box
}

/**
 * A component with editable inner text by double clicking to toggle to edit
 */
class EditableTextCat extends React.Component<EditableTextCatProps, EditableTextCatState> {

    constructor(props: EditableTextCatProps) {
        super(props);
        this.state = {
            toggle: true,
            value: this.props.value,
        }
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            value: event.target.value,
        } as EditableTextCatState);
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.saveEdit();
        } else if (event.key === 'Escape') {
            // revert back to original text
            this.setState({
                toggle: true,
                value: this.props.value,
            });
        }
    }

    saveEdit = () => {
        let isInvalid = false;
        this.setState({
            toggle: true,
        } as EditableTextCatState);
        // doesn't allow empty or duplicated category names
        if (this.state.value.trim() === "") {
            message.warning(this.props.t('warn.no-empty-cat'));
            isInvalid = true;
        } else if (this.state.value !== this.props.value && this.props.model.hasCat(this.state.value)) {
            message.warning(this.props.t('warn.no-duplicate-cat'));
            isInvalid = true;
        } else if (this.state.value !== this.props.value) {
            this.props.model.replaceCatName(this.props.value, this.state.value);
            this.props.updateSelection('all-tasks');
            this.props.refreshModel();

        }
        if (isInvalid) {
            // revert back to original text
            this.setState({
                value: this.props.value,
            } as EditableTextCatState);
        }
    }

    render() {
        return (
            this.state.toggle ?
                (<span
                    style={{
                        paddingLeft: "10px"
                    }}
                    onDoubleClick={() => {
                        this.setState({
                            toggle: false,
                        } as EditableTextCatState);
                    }}>{this.state.value}</span>) :
                (<Input type="text"
                        value={this.state.value}
                        autoFocus
                    // Select all when focused
                        onFocus={(event) => {
                            event.target.select();
                        }}
                        onBlur={this.saveEdit}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                />)
        );
    }
}

export default withTranslation()(EditableTextCat);