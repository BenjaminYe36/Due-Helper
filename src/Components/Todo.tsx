import React from "react";
import {Checkbox, Dropdown, Menu, Tag} from "antd";
import {MenuInfo} from "rc-menu/lib/interface";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

interface TodoProps {
    task: TaskInfo; // an object contains all the information of a task (see interface for details)
}

export interface TaskInfo {
    id: string;
    category: string;
    description: string;
    availableDate: Date | null;
    dueDate: Date;
    completed: boolean;
}

class Todo extends React.Component<TodoProps, {}> {

    handleContextMenu = (menuInfo: MenuInfo, id: string) => {
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
        } else if (menuInfo.key === "Context-Del") {
            console.log('should delete');
        }
        console.log(id);
    }

    render() {
        return (
            // Context menu

            <Dropdown
                overlay={
                    <Menu onClick={(item) => this.handleContextMenu(item, this.props.task.id)}>
                        <Menu.Item key="Context-Edit" icon={<EditOutlined/>}>Edit</Menu.Item>
                        <Menu.Item key="Context-Del" icon={<DeleteOutlined/>}>Delete</Menu.Item>
                    </Menu>
                }
                trigger={['contextMenu']}
            >

                {/*inner contents of task display*/}

                <li id={this.props.task?.id}>
                    <p className='todo-p'>
                        <Checkbox checked={this.props.task?.completed} style={{paddingRight: '5px'}}/>
                        <Tag color='#85a5ff'>{this.props.task?.category}</Tag>
                        {this.props.task?.description}
                        <Tag color='green'
                             style={{float: 'right'}}>
                            Due: {this.props.task?.dueDate.toLocaleDateString()}
                        </Tag>
                        {this.props.task?.availableDate === null ?
                            null :
                            <Tag color='orange' style={{float: 'right'}}>
                                Not available until: {this.props.task?.availableDate.toLocaleDateString()}
                            </Tag>
                        }
                    </p>
                </li>

            </Dropdown>
        );
    }

}

export default Todo;