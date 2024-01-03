import React, {useEffect, useState} from "react";
import {Checkbox, Dropdown, Tag, Tooltip} from "antd";
import type {MenuProps} from 'antd';
import {MenuInfo} from "rc-menu/lib/interface";
import {DeleteOutlined, EditTwoTone} from "@ant-design/icons";
import ModelAPI, {SubtaskInfo, TaskInfo} from "../Model & Util/ModelAPI";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import Util from "../Model & Util/Util";
import RunAtDate from "../Model & Util/RunAtDate";
import {withTranslation, WithTranslation} from 'react-i18next';

interface TodoProps extends WithTranslation {
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
const Todo: React.FC<TodoProps> = ({t, task, model, refreshModel, onEdit}) => {
    // string for tooltip for available date
    const [availableTip, setAvailableTip] = useState('');
    // string for tooltip for due date
    const [dueTip, setDueTip] = useState('');
    // placeholder state to force re-render of this component only
    const [, forceRender] = useState({});

    // Force a re-render when time changes from not urgent to urgent
    useEffect(() => {
        const urgentDate = new Date(task.dueDate);
        urgentDate.setDate(urgentDate.getDate() - Util.getUrgentDay());
        const runAtDateObj = new RunAtDate(urgentDate, () => {
            console.log("due date urgent reached, force re-render");
            forceRender({});
        });

        return () => {
            console.log('dueDate timeout cleaned up');
            clearTimeout(runAtDateObj.getTimeoutID())
        };
    }, [task.dueDate]);

    // Force a rerender when time changes from not available to available
    useEffect(() => {
        if (task.availableDate !== null) {
            const availableDate = new Date(task.availableDate);
            const runAtDateObj = new RunAtDate(availableDate, () => {
                console.log("available date reached, force re-render");
                forceRender({});
            });

            return () => {
                console.log('availableDate timeout cleaned up');
                clearTimeout(runAtDateObj.getTimeoutID())
            };
        }
    }, [task.availableDate]);

    const populateAvailableTip = () => {
        let tmpTip: string = '';
        if (task.completed) {
            tmpTip = t('todo.already-done');
        } else if (Util.isAvailable(task)) {
            tmpTip = t('todo.available-now');
        } else if (task.availableDate !== null) {
            let diffInMinutes = Util.getDateDifferenceInMinutes(new Date().toISOString(), task.availableDate);
            tmpTip = `${t('todo.will-available-text')} ${Util.getTimeStringFromMinutes(diffInMinutes)}`;
        }
        setAvailableTip(tmpTip);
    };

    const populateDueDateTip = () => {
        let tmpTip: string;
        if (task.completed) {
            tmpTip = t('todo.already-done');
        } else {
            let diffInMinutes = Util.getDateDifferenceInMinutes(new Date().toISOString(), task.dueDate);
            if (diffInMinutes >= 0) {
                tmpTip = `${t('todo.due-in')} ${Util.getTimeStringFromMinutes(diffInMinutes)}`;
            } else {
                tmpTip = `${t('todo.past-due')} ${Util.getTimeStringFromMinutes(-diffInMinutes)}`;
            }
        }
        setDueTip(tmpTip);
    };

    const handleContextMenu = (menuInfo: MenuInfo, id: string) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            onEdit(task);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should delete this task');
            deleteTask(id);
        }
        console.log(id);
    };

    const handleCheck = (e: CheckboxChangeEvent) => {
        console.log(`handle task check called: ${e.target.checked}`);
        model.checkTask(task.id);
        refreshModel();
    };

    const deleteTask = (id: string) => {
        console.log(`delete ${id} called`);
        model.deleteTask(id);
        refreshModel();
    };

    // Subtask component
    const Subtask: React.FC<{ subtask: SubtaskInfo }> = ({subtask}) => {
        const handleSubtaskCheck = (e: CheckboxChangeEvent) => {
            console.log(`handle subtask check called: ${e.target.checked}`);
            model.checkSubtask(task.id, subtask.id);
            refreshModel();
        }

        return (
            <div className="todo-subtask">
                <Checkbox checked={subtask.completed}
                          className="todo-checkbox"
                          onChange={handleSubtaskCheck}
                          disabled={!Util.isAvailable(task)}/>
                <span style={{
                    color: subtask.completed || !Util.isAvailable(task)
                        ? '#aaaaaa' : 'black',
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                }}>
                    {subtask.description}
                </span>
            </div>
        );
    };

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
        onClick: (item: MenuInfo) => handleContextMenu(item, task.id)
    };

    return (
        // Context menu
        <li>
            <Dropdown
                menu={menuProps}
                trigger={['contextMenu']}
            >

                {/*inner contents of task display*/}
                <div className='todo-container'>
                    <div>
                        <Checkbox checked={task.completed}
                                  className="todo-checkbox"
                                  onChange={handleCheck}
                                  disabled={!Util.isAvailable(task)}
                        />

                        <Tag color={task.category.color}>
                            {task.category.catName}
                        </Tag>

                        <span
                            style={{
                                color: task.completed || !Util.isAvailable(task)
                                    ? '#aaaaaa' : 'black',
                                textDecoration: task.completed ? 'line-through' : 'none',
                            }}>
                            {task?.description}
                        </span>

                        <Tooltip title={<span>{dueTip}</span>}
                                 onOpenChange={(visible) => visible && populateDueDateTip()}>
                            <Tag
                                color={task.completed ? 'green' :
                                    (Util.isUrgent(task) ? 'red' : 'cyan')}
                                style={{float: 'right'}}>
                                {t('todo.due')}: {Util.getLocalDate(task.dueDate)}
                            </Tag>
                        </Tooltip>
                        {task?.availableDate === null ?
                            null :
                            <Tooltip title={<span>{availableTip}</span>}
                                     onOpenChange={(visible) => visible && populateAvailableTip()}>
                                <Tag color={task.completed ? 'default' :
                                    (Util.isAvailable(task) ? 'green' : 'orange')}
                                     style={{float: 'right'}}>
                                    {t('todo.available-text')}: {Util.getLocalDate(task.availableDate)}
                                </Tag>
                            </Tooltip>
                        }
                    </div>
                    {
                        task.subtaskList &&
                        task.subtaskList.map((subtask: SubtaskInfo) =>
                            <Subtask key={subtask.id} subtask={subtask}/>
                        )
                    }
                </div>
            </Dropdown>
        </li>
    );
};

export default withTranslation()(Todo);