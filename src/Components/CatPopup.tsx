import React, {useEffect, useRef, useState} from "react";
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


/**
 * A Popup with an input box and color picker to enable users to add new categories or edit existing categories
 */
const CatPopup: React.FC<CatPopupProps> = (props) => {
    // Ref of input to enable autofocus when popup is opened
    const catInputRef = useRef<InputRef>(null);
    // string representing the input of category name from user
    const [catValue, setCatValue] = useState("");
    // default color for color picker (hex)
    const [color, setColor] = useState('#85a5ff');

    useEffect(() => {
        if (props.catModalVisible) {
            // set autofocus when popup is displayed
            setTimeout(() => {
                catInputRef.current!.focus({
                    cursor: 'end',
                });
            }, 200);
        }
    }, [props.catModalVisible]);

    useEffect(() => {
        if (!props.createNew && props.prefillCat !== null) {
            setCatValue(props.prefillCat.catName)
            setColor(props.prefillCat.color);
            console.log('set prefilled state');
        }
    }, [props.prefillCat]);

    const handleCatModalOk = () => {
        // Validations first
        if (catValue.trim() === "") {
            message.warning(props.t('warn.no-empty-cat'));
            return;
        }
        if (props.createNew) { // New cat popup
            props.model.addCat(catValue, color);
            props.refreshModel();
            reset();
            props.handleCatModalOk();
        } else { // Edit cat popup
            props.model.replaceCat(props.prefillCat!.catName, catValue, color);
            if (catValue !== props.prefillCat?.catName) {
                props.updateSelection('Cat-' + catValue);
            }
            props.refreshModel();
            reset();
            props.handleCatModalOk();
        }
    };

    const handleCatModalCancel = () => {
        reset();
        props.handleCatModalCancel();
    };

    const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCatValue(event.target.value);
    };

    const updateColor = (color: any) => {
        setColor(color.hex);
    };

    const reset = () => {
        setCatValue("");
        setColor('#85a5ff');
    };

    const {t} = props;

    return (
        <Modal
            title={props.createNew ? t('cat-popup.add-cat') : t('cat-popup.edit-cat')}
            centered
            open={props.catModalVisible}
            onOk={handleCatModalOk}
            onCancel={handleCatModalCancel}
            okText={t('ok')}
            cancelText={t('cancel')}
        >
            <span>{t('cat-popup.cat-name')}:</span>

            <Row gutter={16}>
                <Col className="gutter-row" span={18}>
                    <Input value={catValue}
                           onChange={updateInput}
                           autoFocus
                           ref={catInputRef}
                           onKeyDown={(event) => {
                               if (event.key === 'Enter') {
                                   handleCatModalOk();
                               }
                           }}
                    />
                </Col>

                <Col>
                    <ColorPicker color={color}
                                 onChangeColor={updateColor}/>
                </Col>
            </Row>

        </Modal>
    );
};

export default withTranslation()(CatPopup);