import React, {useEffect, useState} from "react";
import {Modal, Input, Select, Switch, DatePicker, Button, Checkbox, message} from "antd";
import Util from "../Model & Util/Util";
import ModelAPI, {CategoryWithColor, SubtaskInfo, TaskInfo} from "../Model & Util/ModelAPI";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {nanoid} from "nanoid";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from "i18next";

interface TaskPopupProps extends WithTranslation {
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

interface SubtaskProps {
    subtask: SubtaskInfo;
    subtaskList: SubtaskInfo[];
    setSubtaskList: React.Dispatch<React.SetStateAction<SubtaskInfo[]>>;
}

const {Option} = Select;
const {TextArea} = Input;

/**
 * A Popup to create new or edit existing tasks
 */
const TaskPopup: React.FC<TaskPopupProps> = (props) => {
    // the completion state of this current task
    const [completed, setCompleted] = useState(false);
    // the category name of this current task
    const [categoryName, setCategoryName] = useState<string | null>(null);
    // description of this current task
    const [description, setDescription] = useState('');
    // string in ISO date string
    const [availableDate, setAvailableDate] = useState<string | null>(null);
    // string in ISO date string
    const [dueDate, setDueDate] = useState<string | null>(null);
    // boolean that represents show the add task input or add task button
    const [showAddTaskInput, setShowAddTaskInput] = useState(false);
    // the description of the subtask in the add subtask input
    const [subtaskInputVal, setSubtaskInputVal] = useState('');
    // subtaskList that is under this task, can be edited in this popup
    const [subtaskList, setSubtaskList] = useState<SubtaskInfo[]>([]);

    useEffect(() => {
        if (!props.createNew && props.prefillTaskInfo !== null) {
            setCompleted(props.prefillTaskInfo.completed);
            setCategoryName('Cat-' + props.prefillTaskInfo.category.catName);
            setDescription(props.prefillTaskInfo.description);
            setAvailableDate(props.prefillTaskInfo.availableDate);
            setDueDate(props.prefillTaskInfo.dueDate);
            setSubtaskList(props.prefillTaskInfo.subtaskList ? props.prefillTaskInfo.subtaskList : []);
            console.log('set prefilled state');
        }
    }, [props.prefillTaskInfo]);

    useEffect(() => {
        if (props.createNew) {
            setCategoryName(props.prefillCat === null ? null : "Cat-" + props.prefillCat);
        }
    }, [props.prefillCat]);

    const updateCompleted = (checked: boolean) => {
        setCompleted(checked);
    };

    const updateCategoryName = (value: any) => {
        setCategoryName(value);
    };

    const clearCategoryName = () => {
        setCategoryName(null);
    };

    const updateDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const updateAvailableDate = (date: any, dateString: string) => {
        if (date !== null) {
            setAvailableDate(date.toISOString());
        } else {
            setAvailableDate(null);
        }
    };

    const updateDueDate = (date: any, dateString: string) => {
        if (date !== null) {
            setDueDate(date.toISOString());
        } else {
            setDueDate(null);
        }
    };

    const updateSubtaskInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSubtaskInputVal(e.target.value);
    };

    const toggleShowAddTaskInput = () => {
        setShowAddTaskInput(!showAddTaskInput);
        setSubtaskInputVal('');
    };

    const handleAddSubtask = () => {
        if (subtaskInputVal.trim() === "") {
            message.warning(props.t('warn.no-empty-desc'));
            return;
        }
        let newSubtask: SubtaskInfo = {
            id: nanoid(),
            description: subtaskInputVal,
            completed: false
        };
        setSubtaskList([...subtaskList, newSubtask]);
        setSubtaskInputVal('');
        setShowAddTaskInput(false);
    };

    const handleSubmit = () => {
        // Shared validations
        if (!Util.validateTaskInfo(categoryName, description,
            availableDate, dueDate, completed, subtaskList)) {
            // not valid should stop here
            return;
        }
        const catWithColor: CategoryWithColor | undefined = props.category.find((cat =>
            cat.catName === categoryName?.substring(4)));
        if (props.createNew) { // New task popup
            // @ts-ignore
            props.model.addTask(catWithColor, description, availableDate,
                dueDate, completed, subtaskList);
            props.refreshModel();
            reset();
            props.handleOk();
        } else { // Edit popup
            // @ts-ignore
            props.model.replaceTask(props.prefillTaskInfo.id,
                // @ts-ignore
                catWithColor, description,
                availableDate, dueDate, completed, subtaskList);
            props.refreshModel();
            reset();
            props.handleOk();
        }
    };

    const reset = () => {
        setCompleted(false);
        setCategoryName(props.prefillCat === null ? null : "Cat-" + props.prefillCat);
        setDescription('');
        setAvailableDate(null);
        setDueDate(null);
        setShowAddTaskInput(false);
        setSubtaskInputVal('');
        setSubtaskList([]);
    };

    const {t} = props;
    // For DatePicker localization
    if (i18n.language.startsWith('en')) {
        dayjs.locale('en');
    } else if (i18n.language.startsWith('zh')) {
        dayjs.locale('zh-cn');
    }

    return (
        <Modal
            title={props.createNew ? t('task-popup.add-task') : t('task-popup.edit-task')}
            centered
            open={props.taskModalVisible}
            width="1000px"
            onOk={handleSubmit}
            onCancel={props.handleCancel}
            okText={t('ok')}
            cancelText={t('cancel')}
        >
            <Button icon={<ReloadOutlined/>} shape='round' onClick={reset} danger>
                {t('task-popup.reset-all')}
            </Button>

            <br/>
            <br/>

            <span>{t('task-popup.complete-label')}</span>
            <Switch checked={completed}
                    checkedChildren={t('task-popup.completed')}
                    unCheckedChildren={t('task-popup.incomplete')}
                    onClick={updateCompleted}/>

            <br/>
            <br/>

            <span>{t('task-popup.cat-label')}</span>
            <Select placeholder={t('task-popup.cat-placeholder')}
                    value={categoryName as any}
                    popupMatchSelectWidth={false}
                    showSearch
                    allowClear
                    onClear={clearCategoryName}
                    onSelect={updateCategoryName}
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }>
                {props.category.map((cat) =>
                    <Option key={'Cat-' + cat.catName} value={'Cat-' + cat.catName}>{cat.catName}</Option>
                )}
            </Select>

            <br/>
            <br/>

            <span>{t('task-popup.description')}</span>
            <TextArea value={description} onChange={updateDescription} rows={3}/>

            <br/>
            <br/>

            <span>{t('task-popup.subtask-label')}</span>
            <div>
                {
                    subtaskList.map((subtask) =>
                        <Subtask key={subtask.id} subtask={subtask} subtaskList={subtaskList}
                                 setSubtaskList={setSubtaskList}/>)
                }
                {
                    showAddTaskInput ?
                        <div>
                            <TextArea style={{marginBottom: "10px"}}
                                      value={subtaskInputVal}
                                      onChange={updateSubtaskInput}/>
                            <br/>
                            <Button className="button-right" type="primary" onClick={handleAddSubtask}>
                                {t('task-popup.subtask-ok')}
                            </Button>
                            <Button className="button-right" onClick={toggleShowAddTaskInput}>
                                {t('task-popup.subtask-cancel')}
                            </Button>
                        </div>
                        :
                        <Button icon={<PlusOutlined/>} onClick={toggleShowAddTaskInput}>
                            {t('task-popup.add-subtask')}
                        </Button>
                }
            </div>

            <br/>

            <span>{t('task-popup.available-label')}</span>
            <DatePicker
                onChange={updateAvailableDate}
                value={availableDate === null ? null : dayjs(availableDate)}
                showTime={{
                    defaultValue: dayjs("00:00:00", "HH:mm:ss"),
                    format: "HH:mm"
                }}
                format={Util.getDateFormatString(navigator.language)}/>
            <br/>
            <br/>

            <span>{t('task-popup.due-label')}</span>
            <DatePicker
                onChange={updateDueDate}
                value={dueDate === null ? null : dayjs(dueDate)}
                showTime={{
                    defaultValue: dayjs("23:59:59", "HH:mm:ss"),
                    format: "HH:mm"
                }}
                format={Util.getDateFormatString(navigator.language)}/>
        </Modal>
    );
};

// Subtask component (Special for TaskPopup only)
const Subtask: React.FC<SubtaskProps> = (props) => {
    const updateSubtaskChecked = (id: string, checked: boolean) => {
        const newSubtaskList = props.subtaskList.map((subtask) => {
            if (subtask.id === id) {
                return {...subtask, completed: checked};
            } else {
                return subtask;
            }
        });
        props.setSubtaskList(newSubtaskList);
    };

    const updateSubtaskDescription = (id: string, description: string) => {
        const newSubtaskList = props.subtaskList.map((subtask) => {
            if (subtask.id === id) {
                return {...subtask, description: description};
            } else {
                return subtask;
            }
        });
        props.setSubtaskList(newSubtaskList);
    };

    const deleteSubtask = (id: string) => {
        props.setSubtaskList(props.subtaskList.filter((subtask) => subtask.id !== id));
    };

    return (
        <div className="center-subtask">
            <Checkbox className="todo-checkbox" checked={props.subtask.completed}
                      onChange={(e) => {
                          updateSubtaskChecked(props.subtask.id, e.target.checked);
                      }}/>
            <TextArea style={{width: '50%', marginRight: '10px'}} size="small" value={props.subtask.description}
                      onChange={(e) => {
                          updateSubtaskDescription(props.subtask.id, e.target.value);
                      }}/>
            <Button shape="circle" icon={<DeleteOutlined/>} danger
                    onClick={() => {
                        deleteSubtask(props.subtask.id);
                    }}/>
        </div>
    );
};

export default withTranslation()(TaskPopup);