import React, {ReactNode} from 'react';
import {Button, Dropdown, Layout, Menu, Popconfirm} from 'antd';
import ModelAPI, {categoryWithColor} from "../Model & Util/ModelAPI";
import {
    CarryOutTwoTone,
    ClockCircleTwoTone, DeleteOutlined, EditTwoTone,
    ExclamationCircleTwoTone,
    FileSearchOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";
import CatPopup from "./CatPopup";
import ReorderPopup from "./ReorderPopup";
import {MenuInfo} from "rc-menu/lib/interface";


interface SideBarProps {
    category: categoryWithColor[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    selectionKey: string; // Selected key in the sidebar menu
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}

interface SideBarState {
    newCatModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    editCatModalVisible: boolean; // boolean representing the visibility of the modal for editing Categories
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
    prefillCat: categoryWithColor | null; // prefilled data for edit category popup
}

const {Sider} = Layout;

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

    showEditPopup = (cat: categoryWithColor) => {
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
        this.props.updateSelection("All Tasks");
        this.props.refreshModel();
    }

    // Context Menu handle function

    handleContextMenu = (menuInfo: MenuInfo, cat: categoryWithColor) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            this.showEditPopup(cat);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should do nothing and wait for Popconfirm to delete');
        }
        console.log(cat);
    }

    getMenuItems(): ReactNode {
        return this.props.category.map((cat) =>
            <Menu.Item key={"Cat-" + cat.catName}>
                <Dropdown overlay={
                    <Menu onClick={(item) => this.handleContextMenu(item, cat)}>
                        <Menu.Item key="Context-Edit"
                                   icon={<EditTwoTone twoToneColor='#8c8c8c'/>}>
                            Edit
                        </Menu.Item>
                        <Popconfirm
                            title={<span>Irrecoverable action. <br/>
                                    ALL TASKS IN THIS CATEGORY WILL ALSO BE DELETED! <br/>
                                    Are you sure to delete category: {`[ ${cat.catName} ]?`}</span>}
                            icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                            okText='Delete'
                            okType='danger'
                            onConfirm={() => this.handleConfirm(cat.catName)}
                        >
                            <Menu.Item key={'Context-Del'}
                                       icon={<DeleteOutlined/>}
                                       danger>
                                Delete
                            </Menu.Item>
                        </Popconfirm>
                    </Menu>
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
                </Dropdown>
            </Menu.Item>
        );
    }

    render() {
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
                            onClick={this.showNewCatModal}>New Category</Button>
                    <Button style={{marginLeft: "10px"}} shape="round"
                            onClick={this.showReorderModal}>Reorder</Button>
                </div>
                <Menu theme="dark" mode="inline"
                      selectedKeys={[this.props.selectionKey]}
                      onClick={(item) => this.props.updateSelection(item.key)}>
                    {/*First part: All Tasks View*/}
                    <Menu.Item key="All Tasks"
                               icon={<FileSearchOutlined style={{color: '#d9d9d9'}}/>}>
                        All Tasks</Menu.Item>
                    {/*Second part: Time Filtered Views*/}
                    <Menu.ItemGroup key="byTime" title="[Tasks by Time]">
                        <Menu.Item key="Urgent Tasks"
                                   icon={<ExclamationCircleTwoTone twoToneColor='#cf1322'/>}>
                            Urgent Tasks
                        </Menu.Item>
                        <Menu.Item key="Current Tasks"
                                   icon={<CarryOutTwoTone twoToneColor='#faad14'/>}>
                            Current Tasks
                        </Menu.Item>
                        <Menu.Item key="Future Tasks"
                                   icon={<ClockCircleTwoTone twoToneColor='#a0d911'/>}>
                            Future Tasks
                        </Menu.Item>
                    </Menu.ItemGroup>
                    {/*Third part: user added Categories*/}
                    <Menu.ItemGroup key="byUserCat" title="[Categories]">
                        {
                            this.props.category.length > 0 ?
                                this.getMenuItems() :
                                <Menu.Item
                                    key="nothingYet"
                                    style={{fontStyle: "italic"}}
                                    disabled={true}>
                                    Nothing Yet
                                </Menu.Item>
                        }
                    </Menu.ItemGroup>
                </Menu>
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

export default SideBar;