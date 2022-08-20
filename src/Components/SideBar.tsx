import React from 'react';
import {Button, Dropdown, Layout, Menu, Modal} from 'antd';
import type {MenuProps} from 'antd';
import ModelAPI, {CategoryWithColor} from "../Model & Util/ModelAPI";
import {
    CarryOutTwoTone,
    ClockCircleTwoTone, DeleteOutlined, EditTwoTone, ExclamationCircleOutlined,
    ExclamationCircleTwoTone,
    FileSearchOutlined, InfoCircleTwoTone,
    PlusOutlined
} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";
import CatPopup from "./CatPopup";
import ReorderPopup from "./ReorderPopup";
import {MenuInfo} from "rc-menu/lib/interface";
import {withTranslation, WithTranslation} from 'react-i18next';


interface SideBarProps extends WithTranslation {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    selectionKey: string; // Selected key in the sidebar menu
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}

interface SideBarState {
    newCatModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    editCatModalVisible: boolean; // boolean representing the visibility of the modal for editing Categories
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
    prefillCat: CategoryWithColor | null; // prefilled data for edit category popup
}

const {Sider} = Layout;
const {confirm} = Modal;

/**
 * Sidebar of the main app, consists of all tasks, Time filtered views, and user created categories
 */
class SideBar extends React.Component<SideBarProps, SideBarState> {

    constructor(props: SideBarProps) {
        super(props);
        this.state = {
            newCatModalVisible: false,
            editCatModalVisible: false,
            reorderModalVisible: false,
            prefillCat: null,
        };
    }

    // NewCatModal callback related functions

    showNewCatModal = () => {
        this.setNewCatModalVisible(true);
    }

    setNewCatModalVisible = (visible: boolean) => {
        this.setState({
            newCatModalVisible: visible,
        });
    }

    // EditCatModal callback related functions

    showEditPopup = (cat: CategoryWithColor) => {
        this.setState({
            prefillCat: cat,
        });
        this.setEditCatModalVisible(true);
    }

    setEditCatModalVisible = (visible: boolean) => {
        this.setState({
            editCatModalVisible: visible,
        });
    }

    // Delete popup confirm

    showDeleteConfirm = (cat: CategoryWithColor) => {
        let handleConfirm = this.handleConfirm;
        confirm({
            title: <span>{this.props.t('irr-warning')}<br/>
                {this.props.t('delete-cat-confirm')}: {`[ ${cat.catName} ]?`}
                   </span>,
            icon: <ExclamationCircleOutlined style={{color: "red"}}/>,
            content: this.props.t('delete-cat-warning'),
            okText: this.props.t('yes'),
            okType: 'danger',
            cancelText: this.props.t('no'),
            width: 800,

            onOk() {
                console.log(`Delete ${cat.catName}`);
                handleConfirm(cat.catName);
            },

            onCancel() {
                console.log('Delete Cancelled');
            },
        });
    };

    // ReorderModal callback related functions

    showReorderModal = () => {
        this.setReorderModalVisible(true);
    }

    setReorderModalVisible = (visible: boolean) => {
        this.setState({
            reorderModalVisible: visible,
        });
    }

    // Method that deals with delete confirm

    handleConfirm = (name: string) => {
        this.props.model.deleteCat(name);
        this.props.updateSelection("all-tasks");
        this.props.refreshModel();
    }

    // Context Menu handle function

    handleContextMenu = (menuInfo: MenuInfo, cat: CategoryWithColor) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            this.showEditPopup(cat);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should pop up delete confirm');
            this.showDeleteConfirm(cat);
        }
        console.log(cat);
    }

    getMenuItems(): MenuProps["items"] {
        return this.props.category.map((cat) => {
                const contextMenuItems: MenuProps['items'] = [
                    {
                        label: this.props.t('edit'),
                        key: "Context-Edit",
                        icon: <EditTwoTone twoToneColor='#8c8c8c'/>
                    },
                    {
                        label: this.props.t('delete'),
                        key: "Context-Del",
                        icon: <DeleteOutlined/>,
                        danger: true
                    }
                ];
                const innerNode =
                    (<Dropdown overlay={
                        <Menu onClick={(item) => this.handleContextMenu(item, cat)}
                              items={contextMenuItems}/>
                    } trigger={['contextMenu']}>
                        <div>
                            <div style={{
                                padding: '2px',
                                background: '#fff',
                                borderRadius: '2px',
                                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                display: 'inline-flex',
                                cursor: 'pointer',
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    background: cat.color,
                                }}/>
                            </div>
                            <EditableTextCat
                                value={cat.catName}
                                model={this.props.model}
                                refreshModel={this.props.refreshModel}
                                updateSelection={this.props.updateSelection}
                            />
                        </div>
                    </Dropdown>);
                return ({label: innerNode, key: `Cat-${cat.catName}`});
            }
        );
    }

    render() {
        const {t} = this.props;
        const items: MenuProps['items'] = [
            // First part: All Tasks View
            {
                label: t('side-bar.all-tasks'),
                key: "all-tasks",
                icon: <FileSearchOutlined style={{color: '#d9d9d9'}}/>
            },
            // Second part: Time Filtered Views
            {
                label: `[${t('side-bar.tasks-by-time')}]`,
                key: "byTime",
                type: "group",
                children: [
                    {
                        label: t('side-bar.urgent'),
                        key: "urgent",
                        icon: <ExclamationCircleTwoTone twoToneColor='#cf1322'/>
                    },
                    {
                        label: t('side-bar.current'),
                        key: "current",
                        icon: <CarryOutTwoTone twoToneColor='#faad14'/>
                    },
                    {
                        label: t('side-bar.future'),
                        key: "future",
                        icon: <ClockCircleTwoTone twoToneColor='#a0d911'/>
                    }
                ]
            },
            // Third Part: User added categories
            {
                label: `[${t('side-bar.cat')}]`,
                key: "byUserCat",
                type: "group",
                children: this.props.category.length > 0 ?
                    this.getMenuItems() :
                    [{
                        label: <span style={{fontStyle: "italic"}}>{t('nothing')}</span>,
                        key: "nothingYet",
                        disabled: true
                    }]
            },
            // Forth Part: Settings & Help
            {
                label: `[${t('side-bar.settings-and-help')}]`,
                key: "settingsGroup",
                type: "group",
                children: [
                    {
                        label: t('side-bar.settings-and-help'),
                        key: "helpAndInfo",
                        icon: <InfoCircleTwoTone/>
                    }
                ]
            }
        ];

        return (
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                width="250px"
                onBreakpoint={broken => {
                    console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                }}
            >
                <div className="logo"/>
                <div className="modifyCatButtons" style={{textAlign: 'center'}}>
                    <Button type="primary" shape="round"
                            icon={<PlusOutlined/>}
                            onClick={this.showNewCatModal}>{t('side-bar.new-cat')}</Button>
                    <br/>
                    <Button style={{marginTop: "10px"}} shape="round"
                            onClick={this.showReorderModal}>{t('side-bar.reorder')}</Button>
                </div>
                <Menu theme="dark" mode="inline"
                      selectedKeys={[this.props.selectionKey]}
                      onClick={(item) => this.props.updateSelection(item.key)}
                      items={items}/>
                {/*New Cat Popup*/}
                <CatPopup catModalVisible={this.state.newCatModalVisible}
                          model={this.props.model}
                          createNew={true}
                          prefillCat={null}
                          refreshModel={this.props.refreshModel}
                          handleCatModalOk={() => this.setNewCatModalVisible(false)}
                          handleCatModalCancel={() => this.setNewCatModalVisible(false)}
                          updateSelection={this.props.updateSelection}/>
                {/*Edit Cat Popup*/}
                <CatPopup catModalVisible={this.state.editCatModalVisible}
                          model={this.props.model}
                          createNew={false}
                          prefillCat={this.state.prefillCat}
                          refreshModel={this.props.refreshModel}
                          handleCatModalOk={() => this.setEditCatModalVisible(false)}
                          handleCatModalCancel={() => {
                              this.setEditCatModalVisible(false);
                              this.setState({
                                  prefillCat: null,
                              });
                          }}
                          updateSelection={this.props.updateSelection}/>
                <ReorderPopup reorderModalVisible={this.state.reorderModalVisible}
                              category={this.props.category}
                              model={this.props.model}
                              refreshModel={this.props.refreshModel}
                              handleReorderModalOk={() => this.setReorderModalVisible(false)}
                              handleReorderModalCancel={() => this.setReorderModalVisible(false)}/>
            </Sider>
        );
    }
}

export default withTranslation()(SideBar);