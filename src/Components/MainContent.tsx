import React, {useEffect, useState} from "react";
import Todo from "./Todo";
import type {CollapseProps} from 'antd';
import {Button, Collapse, Empty, Layout, Switch, Tooltip} from "antd";
import ModelAPI, {CategoryWithColor, TaskInfo} from "../Model & Util/ModelAPI";
import {PlusOutlined} from "@ant-design/icons";
import TaskPopup from "./TaskPopup";
import {withTranslation, WithTranslation} from 'react-i18next';
import Util from "../Model & Util/Util";

interface MainContentProps extends WithTranslation {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    taskList: TaskInfo[]; // array of TaskInfo of all tasks in the database
    model: ModelAPI; // Reference to the fake backend Api
    selection: string; // Selection on the sidebar menu
    refreshModel(): void; // callback to refresh from backend after modifying
}


const {Content} = Layout;

/**
 * Main content component on the right mainly to show a list of task items
 */
const MainContent: React.FC<MainContentProps> = (props) => {
    // visibility of the popup to add a new task
    const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
    // visibility of the popup to edit an existing task
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    // prefilled task info for the task requested to be edited
    const [prefillTaskInfo, setPrefillTaskInfo] = useState<TaskInfo | null>(null);
    // If a category is selected in the left sidebar, add task should prefill category
    const [prefillCat, setPrefillCat] = useState<string | null>(null);
    // whether the tasks are grouped by categories
    const [isGroupedByCat, setIsGroupedByCat] = useState(false);

    useEffect(() => {
        let tmpCat: string | null = null;
        if (props.selection.startsWith('Cat-')) {
            tmpCat = props.selection.substring(4);
        }
        setPrefillCat(tmpCat);
    }, [props.selection]);

    const showNewTaskModal = () => {
        setNewTaskModalVisible(true);
    };

    const handleNewTaskOk = () => {
        setNewTaskModalVisible(false);
    };

    const handleNewTaskCancel = () => {
        setNewTaskModalVisible(false);
    };

    const showEditPopup = (task: TaskInfo) => {
        setPrefillTaskInfo(task);
        setEditTaskModalVisible(true);
    };

    const handleEditTaskOk = () => {
        setEditTaskModalVisible(false);
    };

    const handleEditTaskCancel = () => {
        setEditTaskModalVisible(false);
        setPrefillTaskInfo(null);
    };

    const {t} = props;

    // Populate filtered task list based on category selection
    let filteredList: TaskInfo[] = [];
    switch (props.selection) {
        case 'all-tasks':
            filteredList = props.taskList;
            break;
        case 'urgent':
            filteredList = props.taskList.filter((task) => Util.isUrgent(task) && !task.completed);
            break;
        case 'current':
            filteredList = props.taskList.filter((task) => Util.isAvailable(task));
            break;
        case 'future':
            filteredList = props.taskList.filter((task) => !Util.isAvailable(task));
            break;
        default:
            if (props.selection.startsWith('Cat-')) {
                let filterName = props.selection.substring(4);
                filteredList = props.taskList.filter((task) => task.category.catName === filterName);
            }
    }
    // Sorting of filteredList by increasing DueDate
    // First by due Date
    filteredList.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    // Then by availability, not available yet tasks will to the last of the list
    filteredList.sort((a, b) => {
        let availA = Util.isAvailable(a);
        let availB = Util.isAvailable(b);
        if (availA === availB) {
            return 0;
        } else if (availA) {
            return -1;
        } else {
            return 1;
        }
    });
    // Last by completeness (completed tasks will be at the last of the list)
    filteredList.sort((a, b) => {
        if (a.completed === b.completed) {
            return 0;
        } else if (a.completed) {
            return 1;
        } else {
            return -1;
        }
    });

    const taskListForEachCat: Map<String, TaskInfo[]> = new Map();
    if (!props.selection.startsWith('Cat-') && isGroupedByCat) {
        for (let i = 0; i < props.category.length; i++) {
            const oneCatTaskList = props.taskList.filter((task) =>
                task.category.catName === props.category[i].catName);
            // only set map value when a category has tasks under it
            if (oneCatTaskList.length > 0) {
                taskListForEachCat.set(oneCatTaskList[0].category.catName, oneCatTaskList);
            }
        }
        console.log(taskListForEachCat);
    }

    // generate the collapse items
    //@ts-ignore
    const collapseItems: CollapseProps['items'] = Array.from(taskListForEachCat.keys())
        .map((catName) => {
            return {
                key: catName,
                label: catName,
                children:
                    <ul style={{listStyleType: 'none'}}>
                        {taskListForEachCat.get(catName)?.map((task: TaskInfo) =>
                            <Todo key={task.id} task={task}
                                  model={props.model}
                                  refreshModel={props.refreshModel}
                                  onEdit={showEditPopup}/>
                        )}
                    </ul>,
            }
        });

    return (
        <Content className="main-content">
            <div className="site-layout-background">
                {/*Header with selection marked*/}
                <h1 className="main-title">
                    {/*Big title*/}
                    {props.selection.startsWith('Cat-') ?
                        props.selection.substring(4) : t('side-bar.' + props.selection)}
                    {/*Button with tooltip*/}
                    <Tooltip title={t('main.new-task')}>
                        <Button icon={<PlusOutlined/>}
                                shape='circle'
                                type='dashed'
                                style={{float: 'right'}}
                                onClick={showNewTaskModal}/>
                    </Tooltip>
                    {!props.selection.startsWith('Cat-') ?
                        <Switch style={{float: 'right', marginTop: '5px', marginRight: '5px'}}
                                checkedChildren={t('main.group')}
                                unCheckedChildren={t('main.not-group')}
                                checked={isGroupedByCat}
                                onClick={(checked) => setIsGroupedByCat(checked)}
                        /> : null}

                </h1>

                <div className="main-task-list-container">
                    {/*List of Todos*/}
                    {filteredList.length > 0 ?
                        (isGroupedByCat && !props.selection.startsWith('Cat-') ?
                            <Collapse bordered={false}
                                      items={collapseItems}
                                      defaultActiveKey={props.category
                                          .map(cat => cat.catName)}/>
                            :
                            <ul style={{listStyleType: 'none'}}>
                                {filteredList.map((task) =>
                                    <Todo key={task.id} task={task}
                                          model={props.model}
                                          refreshModel={props.refreshModel}
                                          onEdit={showEditPopup}/>
                                )}
                            </ul>)
                        : <Empty description={<span>{t('no-task')}</span>}/>
                    }
                </div>

            </div>
            {/*New Task Popup*/}
            <TaskPopup taskModalVisible={newTaskModalVisible}
                       createNew={true}
                       category={props.category}
                       model={props.model}
                       refreshModel={props.refreshModel}
                       handleOk={handleNewTaskOk}
                       handleCancel={handleNewTaskCancel}
                       prefillTaskInfo={null}
                       prefillCat={prefillCat}
            />
            {/*Edit Task Popup*/}
            <TaskPopup category={props.category}
                       taskModalVisible={editTaskModalVisible}
                       createNew={false}
                       model={props.model}
                       refreshModel={props.refreshModel}
                       handleOk={handleEditTaskOk}
                       handleCancel={handleEditTaskCancel}
                       prefillTaskInfo={prefillTaskInfo}
                       prefillCat={null}
            />
        </Content>
    );
};

export default withTranslation()(MainContent);