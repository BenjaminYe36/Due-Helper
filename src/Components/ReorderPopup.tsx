import React from "react";
import {Empty, Modal} from "antd";
import ModelAPI from "../Model & Util/ModelAPI";
import {List} from "react-movable";

interface ReorderPopupProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    handleReorderModalOk(): void; // callback that closes this popup
    handleReorderModalCancel(): void; // callback that closes this popup
}


/**
 * A Popup with a list to reorder existing category names
 */
class ReorderPopup extends React.Component<ReorderPopupProps, {}> {

    render() {
        return (
            <Modal
                title="Reorder the category names by dragging the list items"
                centered
                visible={this.props.reorderModalVisible}
                zIndex={0}
                onOk={this.props.handleReorderModalOk}
                onCancel={this.props.handleReorderModalCancel}>
                {this.props.category.length > 0 ?
                    <List
                        values={this.props.category}
                        onChange={({oldIndex, newIndex}) => {
                            console.log(oldIndex, newIndex);
                            this.props.model.moveCat(oldIndex, newIndex);
                            this.props.refreshModel();
                        }}
                        renderList={({children, props}) => <ul {...props}>{children}</ul>}
                        renderItem={({value, props}) => <li {...props}>{value}</li>}
                    />
                    :
                    <Empty description={<span>No Category Yet</span>}/>
                }
            </Modal>
        );
    }
}

export default ReorderPopup;