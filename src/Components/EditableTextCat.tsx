import React from 'react';
import {Input, message} from "antd";
import ModelAPI from "../ModelAPI";

interface EditableTextCatProps {
    value: string; // initial value in this editable text element
    model: ModelAPI;

    refreshModel(): void;
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
        });
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === 'Escape') {
            let isInvalid = false;
            this.setState({
                toggle: true,
            });
            // doesn't allow empty or duplicated category names
            if (this.state.value.trim() === "") {
                message.warning("Can't use empty category names!");
                isInvalid = true;

            } else if (this.props.model.hasCat(this.state.value)) {
                message.warning("No duplicated names allowed!");
                isInvalid = true;
            } else {
                this.props.model.replaceCat(this.props.value, this.state.value);
                this.props.refreshModel();
                event.preventDefault();
                event.stopPropagation();
            }
            if (isInvalid) {
                // revert back to original text
                this.setState({
                    value: this.props.value,
                })
            }
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
                        });
                    }}>{this.state.value}</span>) :
                (<Input type="text"
                        value={this.state.value}
                        autoFocus
                    // Select all when focused
                        onFocus={(event) => {
                            event.target.select();
                        }}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                />)
        );
    }
}

export default EditableTextCat;