import React from "react";
import {Modal, Input, Select, Switch, DatePicker, Button} from "antd";
import Util from "../Model & Util/Util";
import ModelAPI, {CategoryWithColor, TaskInfo} from "../Model & Util/ModelAPI";
import moment from "moment";
import {ReloadOutlined} from "@ant-design/icons";

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

    handleSubmit = () => {
        // Shared validations
        if (!Util.validateTaskInfo(this.state.categoryName, this.state.description,
            this.state.availableDate, this.state.dueDate, this.state.completed)) {
            // not valid should stop here
            return;
        }

        let catWithColor: CategoryWithColor | undefined = this.props.category.find((cat =>
            cat.catName === this.state.categoryName?.substring(4)));
        if (this.props.createNew) { // New task popup
            // @ts-ignore
            this.props.model.addTask(catWithColor, this.state.description, this.state.availableDate,
                this.state.dueDate, this.state.completed);
            this.props.refreshModel();
            this.reset();
            this.props.handleOk();
        } else { // Edit popup
            // @ts-ignore
            this.props.model.replaceTask(this.props.prefillTaskInfo.id,
                // @ts-ignore
                catWithColor, this.state.description,
                // @ts-ignore
                this.state.availableDate, this.state.dueDate, this.state.completed);
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