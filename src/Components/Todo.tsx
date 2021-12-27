import React from "react";
import {Checkbox, Dropdown, Menu, Popconfirm, Tag} from "antd";
import {MenuInfo} from "rc-menu/lib/interface";
import {DeleteOutlined, EditTwoTone, QuestionCircleOutlined} from "@ant-design/icons";

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
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
        } else if (menuInfo.key === "Context-Del") {
            console.log('should do nothing and wait for Popconfirm to delete');
        }
        console.log(id);
    }

    deleteTask = (id: string) => {
        console.log(`delete ${id} called`);
    }

    render() {
        return (
            // Context menu
            <li id={this.props.task?.id}>
                <Dropdown
                    overlay={
                        <Menu onClick={(item) => this.handleContextMenu(item, this.props.task.id)}>
                            <Menu.Item key="Context-Edit"
                                       icon={<EditTwoTone twoToneColor='#8c8c8c'/>}>
                                Edit
                            </Menu.Item>
                            <Popconfirm title='Are you sure?'
                                        icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                                        okText='Delete'
                                        okType='danger'
                                        onConfirm={() => this.deleteTask(this.props.task.id)}
                            >
                                <Menu.Item key="Context-Del"
                                           icon={<DeleteOutlined/>}
                                           danger>
                                    Delete</Menu.Item>
                            </Popconfirm>
                        </Menu>
                    }
                    trigger={['contextMenu']}
                >

                    {/*inner contents of task display*/}

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

                </Dropdown>
            </li>
        );
    }

}

export default Todo;