import React, {ReactNode} from 'react';
import {Button, Dropdown, Layout, Menu, Popconfirm} from 'antd';
import ModelAPI from "../ModelAPI";
import {
    CarryOutTwoTone,
    ClockCircleTwoTone, DeleteOutlined,
    ExclamationCircleTwoTone,
    FileSearchOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";


interface SiderProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    onNewCat(): void; // callback called when a new category needs to be added
    onReorderCat(): void; // callback called when reordering of category names is needed
}

const {Sider} = Layout;

/**
 * Side bar of the main app, consists of all tasks, Time filtered views, and user created categories
 */
class SideBar extends React.Component<SiderProps, {}> {

    openNewCat = () => {
        this.props.onNewCat();
    }

    openReorderCat = () => {
        this.props.onReorderCat();
    }

    handleConfirm = (name: string) => {
        this.props.model.deleteCat(name);
        this.props.refreshModel();
    }

    getMenuItems(): ReactNode {
        return this.props.category.map((name) =>
            <Menu.Item key={"Cat-" + name}>
                <Dropdown overlay={
                    <Menu>
                        <Popconfirm
                            title={`Irrecoverable action. Are you sure to delete category: [ ${name} ]?`}
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
                            onClick={this.openNewCat}>New Category</Button>
                    <Button style={{marginLeft: "10px"}} shape="round"
                            onClick={this.openReorderCat}>Reorder</Button>
                </div>
                <Menu theme="dark" mode="inline">
                    {/*First part: All Tasks View*/}
                    <Menu.Item key="all"
                               icon={<FileSearchOutlined style={{color: '#d9d9d9'}}/>}>
                        All Tasks</Menu.Item>
                    {/*Second part: Time Filtered Views*/}
                    <Menu.ItemGroup key="byTime" title="[Tasks by Time]">
                        <Menu.Item key="urgent"
                                   icon={<ExclamationCircleTwoTone twoToneColor='#cf1322'/>}>
                            Urgent Tasks
                        </Menu.Item>
                        <Menu.Item key="current"
                                   icon={<CarryOutTwoTone twoToneColor='#faad14'/>}>
                            Current Tasks
                        </Menu.Item>
                        <Menu.Item key="future"
                                   icon={<ClockCircleTwoTone twoToneColor='#a0d911'/>}>
                            Future
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
            </Sider>
        );
    }
}

export default SideBar;