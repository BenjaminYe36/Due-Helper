import React from "react";
import {Checkbox, Dropdown, Menu, Popconfirm, Tag, Tooltip} from "antd";
import {MenuInfo} from "rc-menu/lib/interface";
import {DeleteOutlined, EditTwoTone, QuestionCircleOutlined} from "@ant-design/icons";
import ModelAPI, {TaskInfo} from "../Model & Util/ModelAPI";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import Util from "../Model & Util/Util";

interface TodoProps {
    task: TaskInfo; // an object contains all the information of a task (see interface for details)
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    onEdit(task: TaskInfo): void; // callback to show edit popup with prefilled task info
}

/**
 * A component that represents a single record of task
 *  - contains checkbox to mark complete or not
 *  - contains category, description, available date (if any) and due date
 *  - contains tooltip on date tags for date differences to current date
 */
class Todo extends React.Component<TodoProps, {}> {

    handleContextMenu = (menuInfo: MenuInfo, id: string) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            this.props.onEdit(this.props.task);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should do nothing and wait for Popconfirm to delete');
        }
        console.log(id);
    }

    handleCheck = (e: CheckboxChangeEvent) => {
        console.log(`handle check called: ${e.target.checked}`);
        this.props.model.replaceTask(this.props.task.id, this.props.task.category,
            this.props.task.description, this.props.task.availableDate,
            this.props.task.dueDate, e.target.checked);
        this.props.refreshModel();
    }

    deleteTask = (id: string) => {
        console.log(`delete ${id} called`);
        this.props.model.deleteTask(id);
        this.props.refreshModel();
    }

    render() {
        let dueDateDiffInDays = Util.getDateDifferenceInDays(new Date().toISOString(), this.props.task.dueDate);
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
                            {/*Popconfirm for delete*/}
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
                        <Checkbox checked={this.props.task?.completed}
                                  style={{paddingRight: '5px'}}
                                  onChange={this.handleCheck}
                                  disabled={!Util.isAvailable(this.props.task)}
                        />

                        <Tag color={this.props.task.category.color}>{
                            this.props.task.category.catName}</Tag>

                        <span
                            style={{
                                color: this.props.task.completed || !Util.isAvailable(this.props.task)
                                    ? '#aaaaaa' : 'black',
                                textDecoration: this.props.task.completed ? 'line-through' : 'none',
                            }}>
                            {this.props.task?.description}
                        </span>

                        <Tooltip title={this.props.task.completed ? 'Already Done' :
                            (dueDateDiffInDays >= 0) ? `Due in ${dueDateDiffInDays} day(s)` :
                                `Past due ${-dueDateDiffInDays} day(s)`}>
                            <Tag
                                color={this.props.task.completed ? 'green' :
                                    (Util.isUrgent(this.props.task) ? 'red' : 'cyan')}
                                style={{float: 'right'}}>
                                Due: {new Date(this.props.task?.dueDate).toLocaleDateString()}
                            </Tag>
                        </Tooltip>
                        {this.props.task?.availableDate === null ?
                            null :
                            <Tooltip
                                title={this.props.task.completed ?
                                    'Already Done' :
                                    (Util.isAvailable(this.props.task) ?
                                        ('Available Now') :
                                        (`Will be available in 
                                    ${Util.getDateDifferenceInDays(new Date().toISOString(),
                                            this.props.task.availableDate)} day(s)`))
                                }>
                                <Tag color={this.props.task.completed ? 'default' :
                                    (Util.isAvailable(this.props.task) ? 'green' : 'orange')}
                                     style={{float: 'right'}}>
                                    Not available until: {new Date(this.props.task?.availableDate).toLocaleDateString()}
                                </Tag>
                            </Tooltip>
                        }
                    </p>

                </Dropdown>
            </li>
        );
    }

}

export default Todo;