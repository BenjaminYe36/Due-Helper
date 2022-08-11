import React from "react";
import {Modal, Input, Select, Switch, DatePicker, Button, Checkbox, message} from "antd";
import Util from "../Model & Util/Util";
import ModelAPI, {CategoryWithColor, SubtaskInfo, TaskInfo} from "../Model & Util/ModelAPI";
import moment from "moment";
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {nanoid} from "nanoid";

interface TaskPopupProps {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    taskModalVisible: boolean; // boolean representing the visibility of the modal for adding or editing task
    createNew: boolean; // if true => show create new popup, if false => show edit popup
    model: ModelAPI; // Reference to the fake backend Api
    prefillTaskInfo: TaskInfo | null; // prefilled information if not null (for edit popup only)
    prefillCat: string | null; // prefilled category name if not null (for new task popup under category only)
    refreshModel(): void; // callback to refresh from backend after modifying
    handleOk(): void; // callback for clicking ok
    handleCancel(): void; // callback for clicking cancel
}

interface TaskPopupState {
    completed: boolean; // the completion state of this current task
    categoryName: string | null; // the category name of this current task
    description: string; // description of this current task
    availableDate: string | null; // string in ISO date string
    dueDate: string | null; // string in ISO date string
    showAddTaskInput: boolean; // boolean that represents show the add task input or add task button
    subtaskInputVal: string; // the description of the subtask in the add subtask input
    subtaskList: SubtaskInfo[]; // subtaskList that is under this task, can be edited in this popup
}

const {Option} = Select;
const {TextArea} = Input;

/**
 * A Popup to create new or edit existing tasks
 */
class TaskPopup extends React.Component<TaskPopupProps, TaskPopupState> {

    constructor(props: TaskPopupProps) {
        super(props);
        this.state = {
            completed: false,
            categoryName: null,
            description: '',
            availableDate: null,
            dueDate: null,
            showAddTaskInput: false,
            subtaskInputVal: '',
            subtaskList: []
        }
    }

    componentDidUpdate(prevProps: any) {
        if (prevProps.prefillTaskInfo !== this.props.prefillTaskInfo) {
            if (!this.props.createNew && this.props.prefillTaskInfo !== null) {
                this.setState({
                    completed: this.props.prefillTaskInfo.completed,
                    categoryName: 'Cat-' + this.props.prefillTaskInfo.category.catName,
                    description: this.props.prefillTaskInfo.description,
                    availableDate: this.props.prefillTaskInfo.availableDate,
                    dueDate: this.props.prefillTaskInfo.dueDate,
                    subtaskList: this.props.prefillTaskInfo.subtaskList ? this.props.prefillTaskInfo.subtaskList : [],
                });
                console.log('set prefilled state');
            }
        }
        if (prevProps.prefillCat !== this.props.prefillCat) {
            if (this.props.createNew) {
                this.setState({
                    categoryName: (this.props.prefillCat === null ? null : "Cat-" + this.props.prefillCat),
                });
            }
        }
    }

    updateCompleted = (checked: boolean) => {
        this.setState({
            completed: checked,
        });
    }

    updateCategoryName = (value: any) => {
        this.setState({
            categoryName: value,
        });
    }

    clearCategoryName = () => {
        this.setState({
            categoryName: null,
        });
    }

    updateDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            description: e.target.value,
        });
    }

    updateAvailableDate = (date: any, dateString: string) => {
        if (date !== null) {
            this.setState({
                availableDate: date.toISOString(),
            });
        } else {
            this.setState({
                availableDate: null,
            });
        }
    }

    updateDueDate = (date: any, dateString: string) => {
        if (date !== null) {
            this.setState({
                dueDate: date.toISOString(),
            });
        } else {
            this.setState({
                dueDate: null,
            });
        }
    }

    updateSubtaskInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            subtaskInputVal: e.target.value
        });
    }

    toggleShowAddTaskInput = () => {
        this.setState({
            showAddTaskInput: !this.state.showAddTaskInput,
            subtaskInputVal: ''
        });
    }

    handleAddSubtask = () => {
        if (this.state.subtaskInputVal.trim() === "") {
            message.warning("can't use empty description");
            return;
        }
        let newSubtask: SubtaskInfo = {
            id: nanoid(),
            description: this.state.subtaskInputVal,
            completed: false
        };
        this.setState({
            subtaskList: [...this.state.subtaskList, newSubtask],
            subtaskInputVal: '',
            showAddTaskInput: false
        });
    }

    deleteSubtask = (id: string) => {
        this.setState({
            subtaskList: this.state.subtaskList.filter((subtask) => subtask.id !== id)
        });
    }

    updateSubtaskChecked = (id: string, checked: boolean) => {
        let newSubtaskList = this.state.subtaskList.map((subtask) => {
            if (subtask.id === id) {
                return {...subtask, completed: checked};
            } else {
                return subtask;
            }
        });
        this.setState({
            subtaskList: newSubtaskList
        });
    }

    updateSubtaskDescription = (id: string, description: string) => {
        let newSubtaskList = this.state.subtaskList.map((subtask) => {
            if (subtask.id === id) {
                return {...subtask, description: description};
            } else {
                return subtask;
            }
        });
        this.setState({
            subtaskList: newSubtaskList
        });
    }

    // Subtask component
    Subtask = (props: { subtask: SubtaskInfo }) => {
        return (
            <div className="center-subtask">
                <Checkbox className="todo-checkbox" checked={props.subtask.completed}
                          onChange={(e) => {
                              this.updateSubtaskChecked(props.subtask.id, e.target.checked);
                          }}/>
                <TextArea style={{width: '50%', marginRight: '10px'}} size="small" value={props.subtask.description}
                          onChange={(e) => {
                              this.updateSubtaskDescription(props.subtask.id, e.target.value);
                          }}/>
                <Button shape="circle" icon={<DeleteOutlined/>} danger
                        onClick={() => {
                            this.deleteSubtask(props.subtask.id);
                        }}/>
            </div>
        );
    }

    handleSubmit = () => {
        // Shared validations
        if (!Util.validateTaskInfo(this.state.categoryName, this.state.description,
            this.state.availableDate, this.state.dueDate, this.state.completed)) {
            // not valid should stop here
            return;
        }

        let catWithColor: CategoryWithColor | undefined = this.props.category.find((cat =>
            cat.catName === this.state.categoryName?.substring(4)));
        let completed = this.state.completed;
        // handle subtask logic with main task completion
        if (this.state.subtaskList.length > 0) {
            // if all subtask complete -> main task complete, else main task not complete
            completed = this.state.subtaskList.filter((subtask) => !subtask.completed).length === 0;
        }
        if (this.props.createNew) { // New task popup
            // @ts-ignore
            this.props.model.addTask(catWithColor, this.state.description, this.state.availableDate,
                this.state.dueDate, completed, this.state.subtaskList);
            this.props.refreshModel();
            this.reset();
            this.props.handleOk();
        } else { // Edit popup
            // @ts-ignore
            this.props.model.replaceTask(this.props.prefillTaskInfo.id,
                // @ts-ignore
                catWithColor, this.state.description,
                // @ts-ignore
                this.state.availableDate, this.state.dueDate, completed, this.state.subtaskList);
            this.props.refreshModel();
            this.reset();
            this.props.handleOk();
        }
    }

    reset = () => {
        this.setState({
            completed: false,
            categoryName: (this.props.prefillCat === null ? null : "Cat-" + this.props.prefillCat),
            description: '',
            availableDate: null,
            dueDate: null,
            showAddTaskInput: false,
            subtaskInputVal: '',
            subtaskList: []
        });
    }

    render() {
        return (
            <Modal
                title={this.props.createNew ? "Add a new Task" : "Edit this Task"}
                centered
                visible={this.props.taskModalVisible}
                width="1000px"
                onOk={this.handleSubmit}
                onCancel={this.props.handleCancel}
            >
                <Button icon={<ReloadOutlined/>} shape='round' onClick={this.reset} danger>Reset All</Button>

                <br/>
                <br/>

                <span>Is the task completed: </span>
                <Switch checked={this.state.completed}
                        checkedChildren="Completed"
                        unCheckedChildren="Incomplete"
                        onClick={this.updateCompleted}/>

                <br/>
                <br/>

                <span>Category: </span>
                <Select placeholder="select a category"
                        value={this.state.categoryName}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        allowClear
                        onClear={this.clearCategoryName}
                        onSelect={this.updateCategoryName}
                        filterOption={(input, option) =>
                            (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        }>
                    {this.props.category.map((cat) =>
                        <Option key={'Cat-' + cat.catName} value={'Cat-' + cat.catName}>{cat.catName}</Option>
                    )}
                </Select>

                <br/>
                <br/>

                <span>Description: </span>
                <TextArea value={this.state.description} onChange={this.updateDescription} rows={3}/>

                <br/>
                <br/>

                <span>Sub-tasks:</span>
                <div>
                    {
                        this.state.subtaskList.map((subtask) =>
                            <this.Subtask key={subtask.id} subtask={subtask}/>)
                    }
                    {
                        this.state.showAddTaskInput ?
                            <div>
                                <TextArea style={{marginBottom: "10px"}}
                                          value={this.state.subtaskInputVal}
                                          onChange={this.updateSubtaskInput}/>
                                <br/>
                                <Button className="button-right" type="primary" onClick={this.handleAddSubtask}>
                                    Add task
                                </Button>
                                <Button className="button-right" onClick={this.toggleShowAddTaskInput}>
                                    Cancel
                                </Button>
                            </div>
                            :
                            <Button icon={<PlusOutlined/>} onClick={this.toggleShowAddTaskInput}>
                                Add sub-task
                            </Button>
                    }
                </div>

                <br/>

                <span>Available Date (optional): </span>
                <DatePicker
                    onChange={this.updateAvailableDate}
                    value={this.state.availableDate === null ? null : moment(this.state.availableDate)}
                    showTime={{
                        defaultValue: moment("00:00:00", "HH:mm:ss"),
                        format: "HH:mm"
                    }}
                    format={Util.getDateFormatString(navigator.language)}/>
                <br/>
                <br/>

                <span>Due Date: </span>
                <DatePicker onChange={this.updateDueDate}
                            value={this.state.dueDate === null ? null : moment(this.state.dueDate)}
                            showTime={{
                                defaultValue: moment("23:59:59", "HH:mm:ss"),
                                format: "HH:mm"
                            }}
                            format={Util.getDateFormatString(navigator.language)}/>
            </Modal>
        );
    }
}

export default TaskPopup;