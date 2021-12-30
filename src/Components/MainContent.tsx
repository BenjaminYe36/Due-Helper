import React from "react";
import Todo, {TaskInfo} from "./Todo";
import {Button, Collapse, Empty, Layout, Switch, Tooltip} from "antd";
import ModelAPI from "../Model & Util/ModelAPI";
import {PlusOutlined} from "@ant-design/icons";
import TaskPopup from "./TaskPopup";

interface MainContentProps {
    category: string[]; // array of strings that represents the user added categories for the tasks
    taskList: TaskInfo[]; // array of TaskInfo that represents a list of tasks user added under existing categories
    model: ModelAPI; // Reference to the fake backend Api
    selection: string; // Selection on the side bar menu
    refreshModel(): void; // callback to refresh from backend after modifying
}

interface MainContentState {
    newTaskModalVisible: boolean; // visibility of the popup to add a new task
    editTaskModalVisible: boolean; // visibility of the popup to edit an existing task
    prefillTaskInfo: TaskInfo | null; // prefilled task info for the task requested to be edited
    prefillCat: string | null; // If a category is selected in the left side bar, add task should prefill category
    groupedByCat: boolean; // whether the tasks are grouped by categories
}

const {Content} = Layout;
const {Panel} = Collapse;

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
            });
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
        });
    }

    showEditPopup = (task: TaskInfo) => {
        this.setState({
            prefillTaskInfo: task,
        });
        this.setEditTaskModalVisible(true);
    }

    handleEditTaskOk = () => {
        this.setEditTaskModalVisible(false);
    }

    handleEditTaskCancel = () => {
        this.setEditTaskModalVisible(false);
        this.setState({
            prefillTaskInfo: null,
        });
    }

    setEditTaskModalVisible = (visible: boolean) => {
        this.setState({
            editTaskModalVisible: visible,
        });
    }

    updateGroupedByCat = (checked: boolean) => {
        this.setState({
            groupedByCat: checked,
        });
    }

    render() {
        let taskListForEachCat: any[] = [];
        if (!this.props.selection.startsWith('Cat-') && this.state.groupedByCat) {
            for (let i = 0; i < this.props.category.length; i++) {
                taskListForEachCat.push(this.props.taskList.filter((task) =>
                    task.category === this.props.category[i]));
            }
            console.log(taskListForEachCat);
        }

        return (
            <Content style={{margin: '24px 16px 0'}}>
                <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                    {/*Header with selection marked*/}
                    <h1 style={{fontSize: '20px', marginLeft: '42px'}}>
                        {/*Big title*/}
                        {this.props.selection.startsWith('Cat-') ?
                            this.props.selection.substring(4) : this.props.selection}
                        {/*Button with tooltip*/}
                        <Tooltip title='New Task'>
                            <Button icon={<PlusOutlined/>}
                                    shape='circle'
                                    type='dashed'
                                    style={{float: 'right'}}
                                    onClick={this.showNewTaskModal}/>
                        </Tooltip>
                        {!this.props.selection.startsWith('Cat-') ?
                            <Switch style={{float: 'right', marginTop: '5px', marginRight: '5px'}}
                                    checkedChildren="Grouped by category"
                                    unCheckedChildren="Not Grouped by category"
                                    checked={this.state.groupedByCat}
                                    onClick={this.updateGroupedByCat}
                            /> : null}

                    </h1>

                    <div>
                        {/*List of Todos*/}
                        {this.props.taskList.length > 0 ?
                            (this.state.groupedByCat && !this.props.selection.startsWith('Cat-') ?
                                <Collapse bordered={false} defaultActiveKey={this.props.category}>
                                    {this.props.category.map((cat, i) =>
                                        taskListForEachCat[i].length > 0 ?
                                            <Panel key={cat} header={cat}>
                                                <ul style={{listStyleType: 'none'}}>
                                                    {taskListForEachCat[i].map((task: TaskInfo) =>
                                                        <Todo key={task.id} task={task}
                                                              model={this.props.model}
                                                              refreshModel={this.props.refreshModel}
                                                              onEdit={this.showEditPopup}/>
                                                    )}
                                                </ul>
                                            </Panel> : null
                                    )}
                                </Collapse>
                                :
                                <ul style={{listStyleType: 'none'}}>
                                    {this.props.taskList.map((task) =>
                                        <Todo key={task.id} task={task}
                                              model={this.props.model}
                                              refreshModel={this.props.refreshModel}
                                              onEdit={this.showEditPopup}/>
                                    )}
                                </ul>)
                            : <Empty description={<span>No Task Yet</span>}/>
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

export default MainContent;