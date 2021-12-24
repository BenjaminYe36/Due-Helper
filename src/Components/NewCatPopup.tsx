import React from "react";
import {Input, Modal} from "antd";

interface NewCatPopupProps {
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    catValue: string; // string representing the input of category name from user
    catInput: React.RefObject<Input>; // Ref of input to enable auto focus when popup is opened
    handleCatModalOk(): void; // callback that validates input and add to categories in sidebar if valid
    handleCatModalCancel(): void; // callback that empties the input and closes this popup
    updateInput(event: React.ChangeEvent<HTMLInputElement>): void; // callback to update the value in the input text box
}

interface NewCatPopupState {

}

/**
 * A Popup with an input box to enable users to add new categories for the tasks
 */
class NewCatPopup extends React.Component<NewCatPopupProps, NewCatPopupState> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <Modal
                title="Add a new Category"
                centered
                visible={this.props.catModalVisible}
                onOk={this.props.handleCatModalOk}
                onCancel={this.props.handleCatModalCancel}
            >
                <span>Category Name:</span>
                <Input value={this.props.catValue}
                       onChange={this.props.updateInput}
                       autoFocus
                       ref={this.props.catInput}
                       onKeyDown={(event) => {
                           if (event.key === 'Enter') {
                               this.props.handleCatModalOk();
                           }
                       }}
                />
            </Modal>
        );
    }
}

export default NewCatPopup;