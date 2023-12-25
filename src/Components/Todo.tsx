import React from "react";
import {Checkbox, Dropdown, Tag, Tooltip} from "antd";
import type {MenuProps} from 'antd';
import {MenuInfo} from "rc-menu/lib/interface";
import {DeleteOutlined, EditTwoTone} from "@ant-design/icons";
import ModelAPI, {SubtaskInfo, TaskInfo} from "../Model & Util/ModelAPI";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import Util from "../Model & Util/Util";
import {withTranslation, WithTranslation} from 'react-i18next';

interface TodoProps extends WithTranslation {
    task: TaskInfo; // an object contains all the information of a task (see interface for details)
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    onEdit(task: TaskInfo): void; // callback to show edit popup with prefilled task info
}

interface TodoState {
    availableTip: string; // string for tooltip for available date
    dueTip: string; // string for tooltip for due date
}

/**
 * A component that represents a single record of task
 *  - contains checkbox to mark complete or not
 *  - contains category, description, available date (if any) and due date
 *  - contains tooltip on date tags for date differences to current date
 */
class Todo extends React.Component<TodoProps, TodoState> {

    constructor(props: TodoProps) {
        super(props);
        this.state = {
            availableTip: '',
            dueTip: '',
        };
    }

    setAvailableTip = () => {
        let tmpTip: string = '';
        if (this.props.task.completed) {
            tmpTip = this.props.t('todo.already-done');
        } else if (Util.isAvailable(this.props.task)) {
            tmpTip = this.props.t('todo.available-now');
        } else if (this.props.task.availableDate !== null) {
            let diffInMinutes = Util.getDateDifferenceInMinutes(new Date().toISOString(), this.props.task.availableDate);
            tmpTip = `${this.props.t('todo.will-available-text')} ${Util.getTimeStringFromMinutes(diffInMinutes)}`;
        }
        this.setState({
            availableTip: tmpTip,
        } as TodoState);
    }

    handleAvailableDateTipVisible = (visible: boolean) => {
        if (visible) {
            this.setAvailableTip();
        }
    }

    setDueDateTip = () => {
        let tmpTip: string;
        if (this.props.task.completed) {
            tmpTip = this.props.t('todo.already-done');
        } else {
            let diffInMinutes = Util.getDateDifferenceInMinutes(new Date().toISOString(), this.props.task.dueDate);
            if (diffInMinutes >= 0) {
                tmpTip = `${this.props.t('todo.due-in')} ${Util.getTimeStringFromMinutes(diffInMinutes)}`;
            } else {
                tmpTip = `${this.props.t('todo.past-due')} ${Util.getTimeStringFromMinutes(-diffInMinutes)}`;
            }
        }
        this.setState({
            dueTip: tmpTip,
        } as TodoState);
    }

    handleDueDateTipVisible = (visible: boolean) => {
        if (visible) {
            this.setDueDateTip();
        }
    }

    handleContextMenu = (menuInfo: MenuInfo, id: string) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            this.props.onEdit(this.props.task);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should delete this task');
            this.deleteTask(id);
        }
        console.log(id);
    }

    handleCheck = (e: CheckboxChangeEvent) => {
        console.log(`handle task check called: ${e.target.checked}`);
        this.props.model.checkTask(this.props.task.id);
        this.props.refreshModel();
    }

    deleteTask = (id: string) => {
        console.log(`delete ${id} called`);
        this.props.model.deleteTask(id);
        this.props.refreshModel();
    }

    // Subtask component
    Subtask = (props: { subtask: SubtaskInfo }) => {
        const handleSubtaskCheck = (e: CheckboxChangeEvent) => {
            console.log(`handle subtask check called: ${e.target.checked}`);
            this.props.model.checkSubtask(this.props.task.id, props.subtask.id);
            this.props.refreshModel();
        }

        return (
            <div className="todo-subtask">
                <Checkbox checked={props.subtask.completed}
                          className="todo-checkbox"
                          onChange={handleSubtaskCheck}
                          disabled={!Util.isAvailable(this.props.task)}/>
                <span style={{
                    color: props.subtask.completed || !Util.isAvailable(this.props.task)
                        ? '#aaaaaa' : 'black',
                    textDecoration: props.subtask.completed ? 'line-through' : 'none',
                }}>
                    {props.subtask.description}
                </span>
            </div>
        );
    }

    render() {
        const {t} = this.props;
        const items: MenuProps["items"] = [
            {
                label: t('edit'),
                key: "Context-Edit",
                icon: <EditTwoTone twoToneColor='#8c8c8c'/>
            },
            {
                label: t('delete'),
                key: "Context-Del",
                icon: <DeleteOutlined/>,
                danger: true
            }
        ];
        const menuProps = {
            items,
            onClick: (item: MenuInfo) => this.handleContextMenu(item, this.props.task.id)
        };

        return (
            // Context menu
            <li id={this.props.task?.id}>
                <Dropdown
                    menu={menuProps}
                    trigger={['contextMenu']}
                >

                    {/*inner contents of task display*/}
                    <div className='todo-container'>
                        <div>
                            <Checkbox checked={this.props.task.completed}
                                      className="todo-checkbox"
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

                            <Tooltip title={<span>{this.state.dueTip}</span>}
                                     onOpenChange={this.handleDueDateTipVisible}>
                                <Tag
                                    color={this.props.task.completed ? 'green' :
                                        (Util.isUrgent(this.props.task) ? 'red' : 'cyan')}
                                    style={{float: 'right'}}>
                                    {t('todo.due')}: {Util.getLocalDate(this.props.task.dueDate)}
                                </Tag>
                            </Tooltip>
                            {this.props.task?.availableDate === null ?
                                null :
                                <Tooltip title={<span>{this.state.availableTip}</span>}
                                         onOpenChange={this.handleAvailableDateTipVisible}>
                                    <Tag color={this.props.task.completed ? 'default' :
                                        (Util.isAvailable(this.props.task) ? 'green' : 'orange')}
                                         style={{float: 'right'}}>
                                        {t('todo.available-text')}: {Util.getLocalDate(this.props.task.availableDate)}
                                    </Tag>
                                </Tooltip>
                            }
                        </div>
                        {
                            this.props.task.subtaskList &&
                            this.props.task.subtaskList.map((subtask: SubtaskInfo) =>
                                <this.Subtask key={subtask.id} subtask={subtask}/>
                            )
                        }
                    </div>
                </Dropdown>
            </li>
        );
    }

}

export default withTranslation()(Todo);