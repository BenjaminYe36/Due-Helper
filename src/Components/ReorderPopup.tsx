import React from "react";
import {Empty, Modal} from "antd";
import ModelAPI, {CategoryWithColor} from "../Model & Util/ModelAPI";
import {List} from "react-movable";
import {withTranslation, WithTranslation} from 'react-i18next';

interface ReorderPopupProps extends WithTranslation {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    handleReorderModalOk(): void; // callback that closes this popup
    handleReorderModalCancel(): void; // callback that closes this popup
}


/**
 * A Popup with a list to reorder existing category names
 */
const ReorderPopup: React.FC<ReorderPopupProps> = (props) => {
    const {t} = props;

    return (
        <Modal
            title={t('reorder-popup.title')}
            centered
            open={props.reorderModalVisible}
            zIndex={0}
            onOk={props.handleReorderModalOk}
            onCancel={props.handleReorderModalCancel}
            okText={t('ok')}
            cancelText={t('cancel')}>
            {props.category.length > 0 ?
                <List
                    values={props.category.map(cat => cat.catName)}
                    onChange={({oldIndex, newIndex}) => {
                        console.log(oldIndex, newIndex);
                        props.model.moveCat(oldIndex, newIndex);
                        props.refreshModel();
                    }}
                    renderList={({children, props}) => <ul {...props}>{children}</ul>}
                    renderItem={({value, props}) => <li {...props}>{value}</li>}
                />
                :
                <Empty description={<span>{t('no-cat')}</span>}/>
            }
        </Modal>
    );
};

export default withTranslation()(ReorderPopup);