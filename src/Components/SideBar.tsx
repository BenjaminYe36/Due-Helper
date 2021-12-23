import React, {ReactNode} from 'react';
import {Button, Layout, Menu} from 'antd';
import ModelAPI from "../ModelAPI";
import {DeleteOutlined} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";


interface SiderProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    onNewCat(): void; // callback called when a new category needs to be added
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

    getMenuItems(): ReactNode {
        return this.props.category.map((name) =>
            <Menu.Item key={"Cat-" + name}>
                <div>
                <Button icon={<DeleteOutlined/>}
                        shape="circle"
                        ghost={true}
                        size="small"
                        onClick={() => {
                            this.props.model.deleteCat(name);
                            this.props.refreshModel();
                        }}/>

                <EditableTextCat
                    value={name}
                    model={this.props.model}
                    refreshModel={this.props.refreshModel}
                />
            </div>
            </Menu.Item>
        );
    }

    handleClick = () => {
        this.props.onNewCat();
    }

    render() {
        return (
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={broken => {
                    console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                }}
            >
                <div className="logo"/>
                <div className="addCatButton" style={{textAlign: 'center'}}>
                    <Button type="primary" onClick={this.handleClick}>New Categories</Button>
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