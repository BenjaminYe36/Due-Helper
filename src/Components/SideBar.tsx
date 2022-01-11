import React, {ReactNode} from 'react';
import {Button, Dropdown, Layout, Menu, Popconfirm} from 'antd';
import ModelAPI from "../Model & Util/ModelAPI";
import {
    CarryOutTwoTone,
    ClockCircleTwoTone, DeleteOutlined,
    ExclamationCircleTwoTone,
    FileSearchOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";
import NewCatPopup from "./NewCatPopup";
import ReorderPopup from "./ReorderPopup";


interface SideBarProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    selectionKey: string; // Selected key in the sidebar menu
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}

interface SideBarState {
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
}

const {Sider} = Layout;

/**
 * Sidebar of the main app, consists of all tasks, Time filtered views, and user created categories
 */
class SideBar extends React.Component<SideBarProps, SideBarState> {

    constructor(props: SideBarProps) {
        super(props);
        this.state = {
            catModalVisible: false,
            reorderModalVisible: false,
        };
    }

    // NewCatModal callback related functions

    showNewCatModal = () => {
        this.setCatModalVisible(true);
    }

    setCatModalVisible = (visible: boolean) => {
        this.setState({
            catModalVisible: visible,
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

    getMenuItems(): ReactNode {
        return this.props.category.map((name) =>
            <Menu.Item key={"Cat-" + name}>
                <Dropdown overlay={
                    <Menu>
                        <Popconfirm
                            title={<span>Irrecoverable action. <br/>
                                    ALL TASKS IN THIS CATEGORY WILL ALSO BE DELETED! <br/>
                                    Are you sure to delete category: {`[ ${name} ]?`}</span>}
                            icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                            okText='Delete'
                            okType='danger'
                            onConfirm={() => this.handleConfirm(name)}
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
                        <EditableTextCat
                            value={name}
                            model={this.props.model}
                            refreshModel={this.props.refreshModel}
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

                <NewCatPopup catModalVisible={this.state.catModalVisible}
                             model={this.props.model}
                             refreshModel={this.props.refreshModel}
                             handleCatModalOk={() => this.setCatModalVisible(false)}
                             handleCatModalCancel={() => this.setCatModalVisible(false)}/>
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