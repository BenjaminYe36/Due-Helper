import React from "react";
import {Col, Input, message, Modal, Row} from "antd";
import ColorPicker from "./ColorPicker.jsx";
import ModelAPI from "../Model & Util/ModelAPI";

interface NewCatPopupProps {
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    handleCatModalOk(): void; // callback that closes this popup
    handleCatModalCancel(): void; // callback that closes this popup
}

interface NewCatPopupState {
    catValue: string; // string representing the input of category name from user
}

/**
 * A Popup with an input box to enable users to add new categories for the tasks
 */
class NewCatPopup extends React.Component<NewCatPopupProps, NewCatPopupState> {
    private readonly catInput: React.RefObject<Input>; // Ref of input to enable auto focus when popup is opened

    constructor(props: NewCatPopupProps) {
        super(props);
        this.state = {
            catValue: "",
        };
        this.catInput = React.createRef();
    }

    componentDidUpdate(prevProps: Readonly<NewCatPopupProps>, prevState: Readonly<NewCatPopupState>, snapshot?: any) {
        if (!prevProps.catModalVisible && this.props.catModalVisible) {
            // set auto focus when popup is displayed
            setTimeout(() => {
                this.catInput.current!.focus({
                    cursor: 'end',
                });
            }, 200);
        }
    }

    handleCatModalOk = () => {
        if (this.state.catValue.trim() !== "") {
            this.props.model.addCat(this.state.catValue);
            this.props.refreshModel();
            this.setState({
                catValue: "",
            });
            this.props.handleCatModalOk();
        } else {
            message.warning("Can't use empty category names!");
        }
    }

    handleCatModalCancel = () => {
        this.setState({
            catValue: "",
        });
        this.props.handleCatModalCancel();
    }

    updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            catValue: event.target.value,
        });
    }

    render() {
        return (
            <Modal
                title="Add a new Category"
                centered
                visible={this.props.catModalVisible}
                onOk={this.handleCatModalOk}
                onCancel={this.handleCatModalCancel}
            >
                <span>Category Name:</span>

                <Row gutter={16}>
                    <Col className="gutter-row" span={18}>
                        <Input value={this.state.catValue}
                               onChange={this.updateInput}
                               autoFocus
                               ref={this.catInput}
                               onKeyDown={(event) => {
                                   if (event.key === 'Enter') {
                                       this.props.handleCatModalOk();
                                   }
                               }}
                        />
                    </Col>

                    <Col>
                        <ColorPicker/>
                    </Col>
                </Row>

            </Modal>
        );
    }
}

export default NewCatPopup;