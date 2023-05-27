import React, {Component} from 'react';
import {Layout, ConfigProvider} from 'antd';
import './App.css';
import 'antd/dist/reset.css';
import SideBar from "./Components/SideBar";
import ModelAPI, {CategoryWithColor, TaskInfo} from "./Model & Util/ModelAPI";
import MainContent from "./Components/MainContent";
import {Scrollbars} from 'react-custom-scrollbars-2';
import Util from "./Model & Util/Util";
import {BaseDirectory, readTextFile} from "@tauri-apps/api/fs";
import HelpPage from "./Components/HelpPage";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from "./i18n/config";
import zhCN from "antd/es/locale/zh_CN";
import enUS from "antd/es/locale/en_US";
import Settings from "./Model & Util/Settings";


interface TaskData {
    category: CategoryWithColor[];
    taskList: TaskInfo[];
}

interface AppProps extends WithTranslation {
}

interface AppStates {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    taskList: TaskInfo[]; // array of TaskInfo that represents a list of tasks user added under existing categories
    filteredList: TaskInfo[]; // filtered and ordered list that correspond to the selection on sidebar menu
    selectionKey: string; // string representing the key of selected item in the sidebar menu
    language: string; // current language locale that should be used
}

const defaultTaskData = '{"category":[],"taskList":[]}';

/**
 * The main application class of this task management software
 */
class App extends Component<AppProps, AppStates> {
    private model: ModelAPI;

    constructor(props: any) {
        super(props);
        this.state = {
            category: [],
            taskList: [],
            filteredList: [],
            selectionKey: 'all-tasks',
            language: i18n.language,
        };
        this.model = new ModelAPI([], []);
    }

    async componentDidMount() {
        readTextFile('Database/taskData.json', {dir: BaseDirectory.App})
            .then((contents) => {
                console.log('found existing file');
                let obj = JSON.parse(contents);
                this.initializeModel(obj);
            })
            .catch((e) => {
                // most likely file doesn't exist
                console.log('no existing file found');
                let obj = JSON.parse(defaultTaskData);
                this.initializeModel(obj);
            });
        i18n.on('languageChanged', (lng) => {
            console.log(`language changed to ${lng}`);
            this.setState({
                language: lng
            } as AppStates);
        });
        let language = await Settings.getLanguage();
        i18n.changeLanguage(language);
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<AppStates>, snapshot?: any) {
        if (prevState.taskList !== this.state.taskList || prevState.selectionKey !== this.state.selectionKey) {
            this.refreshModel();
        }
    }

    initializeModel = (obj: TaskData) => {
        this.model = new ModelAPI(obj.category, obj.taskList);
        this.model.writeToJson();
        this.refreshModel();
        // Set time out to refresh next update time (not available -> available, not urgent -> urgent)
        let offset = Util.getTimeToNextUpdate(this.model.getTaskList());
        console.log(offset);
        setTimeout(() => {
            console.log('timeout callback called');
            // @ts-ignore
            window.location.reload(false);
        }, offset);
        console.log('set timeout complete');
    };

    // methods relating to the sidebar menu states

    updateSelectionKey = (key: string) => {
        console.log(`update select key called with ${key}`);
        if (!key.startsWith('Cat') || (key.startsWith('Cat-') && this.model.hasCat(key.substring(4)))) {
            this.setState({
                selectionKey: key,
            } as AppStates);
        }
    }

    // methods of calling the model to update view in this App

    refreshModel = () => {
        let tmpList: TaskInfo[] = [];
        switch (this.state.selectionKey) {
            case 'all-tasks':
                tmpList = this.model.getTaskList();
                break;
            case 'urgent':
                tmpList = this.model.getTaskList().filter((task) => Util.isUrgent(task) && !task.completed);
                break;
            case 'current':
                tmpList = this.model.getTaskList().filter((task) => Util.isAvailable(task));
                break;
            case 'future':
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
        } as AppStates);
    }

    render() {
        const {t} = this.props;
        return (
            <ConfigProvider locale={this.state.language.startsWith('zh') ? zhCN : enUS}>
                <Layout style={{minHeight: "100vh", overflow: "auto"}}>

                    <SideBar category={this.state.category}
                             model={this.model}
                             selectionKey={this.state.selectionKey}
                             refreshModel={this.refreshModel}
                             updateSelection={this.updateSelectionKey}
                    />

                    <Layout>

                        <Scrollbars>
                            {
                                this.state.selectionKey === "helpAndInfo" ?
                                    <HelpPage title={t('help-page.title')}/> :
                                    <MainContent category={this.state.category} taskList={this.state.filteredList}
                                                 model={this.model} refreshModel={this.refreshModel}
                                                 selection={this.state.selectionKey}/>
                            }
                        </Scrollbars>

                    </Layout>


                </Layout>
            </ConfigProvider>
        );
    }


}


export default withTranslation()(App);
