import React from "react";
import Todo, {TaskInfo} from "./Todo";
import {Button, Layout, Tooltip} from "antd";
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
    newTaskModalVisible: boolean;
    editTaskModalVisible: boolean;
    prefillTaskInfo: TaskInfo | null;
}

const {Content} = Layout;

class MainContent extends React.Component<MainContentProps, MainContentState> {

    constructor(props: MainContentProps) {
        super(props);
        this.state = {
            newTaskModalVisible: false,
            editTaskModalVisible: false,
            prefillTaskInfo: null,
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

    render() {
        return (
            <Content style={{margin: '24px 16px 0'}}>
                <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                    {/*Header with selection marked*/}
                    <h1 style={{fontSize: '20px', marginLeft: '42px'}}>
                        {/*Big title*/}
                        {this.props.selection}
                        {/*Button with tooltip*/}
                        <Tooltip title='New Task'>
                            <Button icon={<PlusOutlined/>}
                                    shape='circle'
                                    type='dashed'
                                    style={{float: 'right'}}
                                    onClick={this.showNewTaskModal}/>
                        </Tooltip>
                    </h1>

                    {/*List of Todos*/}
                    <ul style={{listStyleType: 'none'}}>
                        {this.props.taskList.map((task) =>
                            <Todo key={task.id} task={task}
                                  model={this.props.model}
                                  refreshModel={this.props.refreshModel}
                                  onEdit={this.showEditPopup}/>
                        )}
                    </ul>
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
                />
            </Content>
        );
    }
}

export default MainContent;