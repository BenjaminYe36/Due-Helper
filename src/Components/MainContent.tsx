import React from "react";
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

interface MainContentState {
    newTaskModalVisible: boolean; // visibility of the popup to add a new task
    editTaskModalVisible: boolean; // visibility of the popup to edit an existing task
    prefillTaskInfo: TaskInfo | null; // prefilled task info for the task requested to be edited
    prefillCat: string | null; // If a category is selected in the left sidebar, add task should prefill category
    groupedByCat: boolean; // whether the tasks are grouped by categories
}

const {Content} = Layout;

/**
 * Main content component on the right mainly to show a list of task items
 */
class MainContent extends React.Component<MainContentProps, MainContentState> {

    constructor(props: MainContentProps) {
        super(props);
        this.state = {
            newTaskModalVisible: false,
            editTaskModalVisible: false,
            prefillTaskInfo: null,
            prefillCat: null,
            groupedByCat: false,
        }
    }

    componentDidUpdate(prevProps: Readonly<MainContentProps>, prevState: Readonly<MainContentState>, snapshot?: any) {
        if (prevProps.selection !== this.props.selection || prevProps.taskList.length !== this.props.taskList.length) {
            let tmpCat: string | null = null;
            if (this.props.selection.startsWith('Cat-')) {
                tmpCat = this.props.selection.substring(4);
            }
            this.setState({
                prefillCat: tmpCat,
            } as MainContentState);
        }
    }

    showNewTaskModal = () => {
        this.setNewTaskModalVisible(true);
    }

    handleNewTaskOk = () => {
        this.setNewTaskModalVisible(false);
    }

    handleNewTaskCancel = () => {
        this.setNewTaskModalVisible(false);
    }

    setNewTaskModalVisible = (visible: boolean) => {
        this.setState({
            newTaskModalVisible: visible,
        } as MainContentState);
    }

    showEditPopup = (task: TaskInfo) => {
        this.setState({
            prefillTaskInfo: task,
        } as MainContentState);
        this.setEditTaskModalVisible(true);
    }

    handleEditTaskOk = () => {
        this.setEditTaskModalVisible(false);
    }

    handleEditTaskCancel = () => {
        this.setEditTaskModalVisible(false);
        this.setState({
            prefillTaskInfo: null,
        } as MainContentState);
    }

    setEditTaskModalVisible = (visible: boolean) => {
        this.setState({
            editTaskModalVisible: visible,
        } as MainContentState);
    }

    updateGroupedByCat = (checked: boolean) => {
        this.setState({
            groupedByCat: checked,
        } as MainContentState);
    }

    render() {
        const {t} = this.props;

        // Populate filtered task list based on category selection
        let filteredList: TaskInfo[] = [];
        switch (this.props.selection) {
            case 'all-tasks':
                filteredList = this.props.taskList;
                break;
            case 'urgent':
                filteredList = this.props.taskList.filter((task) => Util.isUrgent(task) && !task.completed);
                break;
            case 'current':
                filteredList = this.props.taskList.filter((task) => Util.isAvailable(task));
                break;
            case 'future':
                filteredList = this.props.taskList.filter((task) => !Util.isAvailable(task));
                break;
            default:
                if (this.props.selection.startsWith('Cat-')) {
                    let filterName = this.props.selection.substring(4);
                    filteredList = this.props.taskList.filter((task) => task.category.catName === filterName);
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

        let taskListForEachCat: Map<String, TaskInfo[]> = new Map();
        if (!this.props.selection.startsWith('Cat-') && this.state.groupedByCat) {
            for (let i = 0; i < this.props.category.length; i++) {
                const oneCatTaskList = this.props.taskList.filter((task) =>
                    task.category.catName === this.props.category[i].catName);
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
                                      model={this.props.model}
                                      refreshModel={this.props.refreshModel}
                                      onEdit={this.showEditPopup}/>
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
                        {this.props.selection.startsWith('Cat-') ?
                            this.props.selection.substring(4) : t('side-bar.' + this.props.selection)}
                        {/*Button with tooltip*/}
                        <Tooltip title={t('main.new-task')}>
                            <Button icon={<PlusOutlined/>}
                                    shape='circle'
                                    type='dashed'
                                    style={{float: 'right'}}
                                    onClick={this.showNewTaskModal}/>
                        </Tooltip>
                        {!this.props.selection.startsWith('Cat-') ?
                            <Switch style={{float: 'right', marginTop: '5px', marginRight: '5px'}}
                                    checkedChildren={t('main.group')}
                                    unCheckedChildren={t('main.not-group')}
                                    checked={this.state.groupedByCat}
                                    onClick={this.updateGroupedByCat}
                            /> : null}

                    </h1>

                    <div className="main-task-list-container">
                        {/*List of Todos*/}
                        {filteredList.length > 0 ?
                            (this.state.groupedByCat && !this.props.selection.startsWith('Cat-') ?
                                <Collapse bordered={false}
                                          items={collapseItems}
                                          defaultActiveKey={this.props.category
                                              .map(cat => cat.catName)}/>
                                :
                                <ul style={{listStyleType: 'none'}}>
                                    {filteredList.map((task) =>
                                        <Todo key={task.id} task={task}
                                              model={this.props.model}
                                              refreshModel={this.props.refreshModel}
                                              onEdit={this.showEditPopup}/>
                                    )}
                                </ul>)
                            : <Empty description={<span>{t('no-task')}</span>}/>
                        }
                    </div>

                </div>
                {/*New Task Popup*/}
                <TaskPopup taskModalVisible={this.state.newTaskModalVisible}
                           createNew={true}
                           category={this.props.category}
                           model={this.props.model}
                           refreshModel={this.props.refreshModel}
                           handleOk={this.handleNewTaskOk}
                           handleCancel={this.handleNewTaskCancel}
                           prefillTaskInfo={null}
                           prefillCat={this.state.prefillCat}
                />
                {/*Edit Task Popup*/}
                <TaskPopup category={this.props.category}
                           taskModalVisible={this.state.editTaskModalVisible}
                           createNew={false}
                           model={this.props.model}
                           refreshModel={this.props.refreshModel}
                           handleOk={this.handleEditTaskOk}
                           handleCancel={this.handleEditTaskCancel}
                           prefillTaskInfo={this.state.prefillTaskInfo}
                           prefillCat={this.state.prefillCat}
                />
            </Content>
        );
    }
}

export default withTranslation()(MainContent);