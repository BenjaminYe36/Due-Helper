import React, {Component} from 'react';
import {Layout} from 'antd';
import './App.css';
import 'antd/dist/antd.css';
import SideBar from "./Components/SideBar";
import ModelAPI, {categoryWithColor, TaskInfo} from "./Model & Util/ModelAPI";
import MainContent from "./Components/MainContent";
// @ts-ignore
import {Scrollbars} from 'react-custom-scrollbars';
import Util from "./Model & Util/Util";

const {ipcRenderer} = window.require("electron");


interface AppStates {
    category: categoryWithColor[]; // array of strings that represents the user added categories for the tasks
    taskList: TaskInfo[]; // array of TaskInfo that represents a list of tasks user added under existing categories
    filteredList: TaskInfo[]; // filtered and ordered list that correspond to the selection on sidebar menu
    selectionKey: string; // string representing the key of selected item in the sidebar menu
}

/**
 * The main application class of this task management software
 */
class App extends Component<{}, AppStates> {
    private model: ModelAPI;

    constructor(props: any) {
        super(props);
        this.state = {
            category: [],
            taskList: [],
            filteredList: [],
            selectionKey: 'All Tasks',
        };
        this.model = new ModelAPI([], []);
    }

    componentDidMount() {
        let tmp = ipcRenderer.sendSync('reading-json-synchronous');
        console.log(tmp);
        this.model = new ModelAPI(JSON.parse(tmp).category, JSON.parse(tmp).taskList);
        this.refreshModel();
        // Set time out to refresh next update time (not available -> available, not urgent -> urgent)
        let offset = Util.getTimeToNextUpdate(this.model.getTaskList());
        console.log(offset);
        setTimeout(() => {
            console.log('timeout callback called');
            // @ts-ignore
            window.location.reload(false);
        }, offset + 1000);
        console.log('set timeout complete');
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<AppStates>, snapshot?: any) {
        if (prevState.taskList !== this.state.taskList || prevState.selectionKey !== this.state.selectionKey) {
            this.refreshModel();
        }
    }


    // methods relating to the sidebar menu states

    updateSelectionKey = (key: string) => {
        console.log(`update select key called with ${key}`);
        if (!key.startsWith('Cat') || (key.startsWith('Cat-') && this.model.hasCat(key.substring(4)))) {
            this.setState({
                selectionKey: key,
            });
        }
    }

    // methods of calling the model to update view in this App

    refreshModel = () => {
        let tmpList: TaskInfo[] = [];
        switch (this.state.selectionKey) {
            case 'All Tasks':
                tmpList = this.model.getTaskList();
                break;
            case 'Urgent Tasks':
                tmpList = this.model.getTaskList().filter((task) => Util.isUrgent(task) && !task.completed);
                break;
            case 'Current Tasks':
                tmpList = this.model.getTaskList().filter((task) => Util.isAvailable(task));
                break;
            case 'Future Tasks':
                tmpList = this.model.getTaskList().filter((task) => !Util.isAvailable(task));
                break;
            default:
                if (this.state.selectionKey.startsWith('Cat-')) {
                    let filterName = this.state.selectionKey.substring(4);
                    tmpList = this.model.getTaskList().filter((task) => task.category.catName === filterName);
                }
        }
        // Sorting of filteredList by increasing DueDate
        // First by due Date
        tmpList.sort((a, b) => {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        // Then by availability, not available yet tasks will to the last of the list
        tmpList.sort((a, b) => {
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
        tmpList.sort((a, b) => {
            if (a.completed === b.completed) {
                return 0;
            } else if (a.completed) {
                return 1;
            } else {
                return -1;
            }
        });
        this.setState({
            category: this.model.getCat(),
            taskList: this.model.getTaskList(),
            filteredList: tmpList,
        });
    }

    render() {
        return (
            <Layout style={{minHeight: "100vh", overflow: "auto"}}>

                <SideBar category={this.state.category}
                         model={this.model}
                         selectionKey={this.state.selectionKey}
                         refreshModel={this.refreshModel}
                         updateSelection={this.updateSelectionKey}
                />

                <Layout>

                    <Scrollbars>
                        <MainContent category={this.state.category} taskList={this.state.filteredList}
                                     model={this.model} refreshModel={this.refreshModel}
                                     selection={this.state.selectionKey}/>
                    </Scrollbars>

                </Layout>


            </Layout>
        );
    }


}


export default App;
