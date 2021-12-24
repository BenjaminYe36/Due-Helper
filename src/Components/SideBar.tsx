import React, {ReactNode} from 'react';
import {Button, Layout, Menu, Popconfirm} from 'antd';
import ModelAPI from "../ModelAPI";
import {DeleteOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";


interface SiderProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    onNewCat(): void; // callback called when a new category needs to be added
    onReorderCat(): void; // callback called when reordering of category names is needed
}

interface SiderState {

}

const {Sider} = Layout;

/**
 * Side bar of the main app, consists of all tasks, Time filtered views, and user created categories
 */
class SideBar extends React.Component<SiderProps, SiderState> {

    constructor(props: any) {
        super(props);
    }

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
                <div>
                    <Popconfirm title="Are you sure?"
                                icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                                onConfirm={() => this.handleConfirm(name)}
                    >
                        <Button icon={<DeleteOutlined/>}
                                shape="circle"
                                ghost={true}
                                size="small"/>
                    </Popconfirm>
                    <EditableTextCat
                        value={name}
                        model={this.props.model}
                        refreshModel={this.props.refreshModel}
                    />
                </div>
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
                    <Button type="primary" size="small" onClick={this.openNewCat}>New Categories</Button>
                    <Button size="small" style={{marginLeft: "10px"}} onClick={this.openReorderCat}>Reorder</Button>
                </div>
                <Menu theme="dark" mode="inline">
                    {/*First part: All Tasks View*/}
                    <Menu.Item key="1">All Tasks</Menu.Item>
                    {/*Second part: Time Filtered Views*/}
                    <Menu.ItemGroup key="g1" title="[Tasks by Time]">
                        <Menu.Item key="2">Urgent Tasks</Menu.Item>
                        <Menu.Item key="3">Current (Includes Urgent) Tasks</Menu.Item>
                        <Menu.Item key="4">Future</Menu.Item>
                    </Menu.ItemGroup>
                    {/*Third part: user added Categories*/}
                    <Menu.ItemGroup key="g2" title="[Categories]">
                        {
                            this.props.category.length > 0 ?
                                this.getMenuItems() :
                                <Menu.Item style={{fontStyle: "italic"}} disabled={true}>Nothing Yet</Menu.Item>
                        }
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
        );
    }
}

export default SideBar;