import React from "react";
import {Checkbox, DatePicker, Tag} from "antd";

interface TodoProps {
    task: TaskInfo | null; // an object contains all the information of a task (see interface for details)
}

export interface TaskInfo {
    id: string;
    description: string;
    availableDate: Date | null;
    dueDate: Date;
    completed: boolean;
}

class Todo extends React.Component<TodoProps, {}> {

    constructor(props: TodoProps) {
        super(props);
    }

    render() {
        return (
            <li id={this.props.task?.id}>
                <p style={{
                    border: "2px solid grey",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: '15px',
                    overflow: 'hidden'
                }}>
                    <Checkbox checked={this.props.task?.completed} style={{paddingRight: '5px'}}/>
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
            </li>
        );
    }

}

export default Todo;