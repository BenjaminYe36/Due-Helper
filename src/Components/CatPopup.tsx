import React from "react";
import {Col, Input, message, Modal, Row} from "antd";
import type {InputRef} from 'antd';
import ColorPicker from "./ColorPicker";
import ModelAPI, {CategoryWithColor} from "../Model & Util/ModelAPI";
import {withTranslation, WithTranslation} from 'react-i18next';

interface CatPopupProps extends WithTranslation {
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    model: ModelAPI; // Reference to the fake backend Api
    createNew: boolean; // if true => show create new popup, if false => show edit popup
    prefillCat: CategoryWithColor | null; // prefilled data for edit category popup
    refreshModel(): void; // callback to refresh from backend after modifying
    handleCatModalOk(): void; // callback that closes this popup
    handleCatModalCancel(): void; // callback that closes this popup
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}

interface CatPopupState {
    catValue: string; // string representing the input of category name from user
    color: string; // default color for color picker (hex)
}

/**
 * A Popup with an input box and color picker to enable users to add new categories or edit existing categories
 */
class CatPopup extends React.Component<CatPopupProps, CatPopupState> {
    private readonly catInput: React.RefObject<InputRef>; // Ref of input to enable auto focus when popup is opened

    constructor(props: CatPopupProps) {
        super(props);
        this.state = {
            catValue: "",
            color: '#85a5ff',
        };
        this.catInput = React.createRef<InputRef>();
    }

    componentDidUpdate(prevProps: Readonly<CatPopupProps>, prevState: Readonly<CatPopupState>, snapshot?: any) {
        if (!prevProps.catModalVisible && this.props.catModalVisible) {
            // set autofocus when popup is displayed
            setTimeout(() => {
                this.catInput.current!.focus({
                    cursor: 'end',
                });
            }, 200);
        }
        if (prevProps.prefillCat !== this.props.prefillCat) {
            if (!this.props.createNew && this.props.prefillCat !== null) {
                this.setState({
                    catValue: this.props.prefillCat.catName,
                    color: this.props.prefillCat.color,
                });
                console.log('set prefilled state');
            }
        }
    }

    handleCatModalOk = () => {
        // Validations first
        if (this.state.catValue.trim() === "") {
            message.warning(this.props.t('warn.no-empty-cat'));
            return;
        }
        if (this.props.createNew) { // New cat popup
            this.props.model.addCat(this.state.catValue, this.state.color);
            this.props.refreshModel();
            this.reset();
            this.props.handleCatModalOk();
        } else { // Edit cat popup
            // @ts-ignore
            this.props.model.replaceCat(this.props.prefillCat?.catName,
                this.state.catValue, this.state.color);
            if (this.state.catValue !== this.props.prefillCat?.catName) {
                this.props.updateSelection('all-tasks');
            }
            this.props.refreshModel();
            this.reset();
            this.props.handleCatModalOk();
        }
    }

    handleCatModalCancel = () => {
        this.reset();
        this.props.handleCatModalCancel();
    }

    updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            catValue: event.target.value,
        } as CatPopupState);
    }

    updateColor = (color: any) => {
        this.setState({
            color: color.hex,
        } as CatPopupState);
    }

    reset = () => {
        this.setState({
            catValue: "",
            color: '#85a5ff',
        });
    }

    render() {
        const {t} = this.props;
        return (
            <Modal
                title={this.props.createNew ? t('cat-popup.add-cat') : t('cat-popup.edit-cat')}
                centered
                open={this.props.catModalVisible}
                onOk={this.handleCatModalOk}
                onCancel={this.handleCatModalCancel}
                okText={t('ok')}
                cancelText={t('cancel')}
            >
                <span>{t('cat-popup.cat-name')}:</span>

                <Row gutter={16}>
                    <Col className="gutter-row" span={18}>
                        <Input value={this.state.catValue}
                               onChange={this.updateInput}
                               autoFocus
                               ref={this.catInput}
                               onKeyDown={(event) => {
                                   if (event.key === 'Enter') {
                                       this.handleCatModalOk();
                                   }
                               }}
                        />
                    </Col>

                    <Col>
                        <ColorPicker color={this.state.color}
                                     onChangeColor={this.updateColor}/>
                    </Col>
                </Row>

            </Modal>
        );
    }
}

export default withTranslation()(CatPopup);