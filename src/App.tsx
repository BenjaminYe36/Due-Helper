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
    selectionKey: string; // string representing the key of selected item in the sidebar menu
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
            selectionKey: 'all-tasks',
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
        });
        let language = await Settings.getLanguage();
        i18n.changeLanguage(language);
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
            // TODO Improve the logic that triggers the next update in tasks
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
        this.setState({
            category: this.model.getCat(),
            taskList: this.model.getTaskList(),
        } as AppStates);
    }

    render() {
        const {t} = this.props;
        return (
            <ConfigProvider locale={i18n.language.startsWith('zh') ? zhCN : enUS}>
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
                                    <MainContent category={this.state.category} taskList={this.state.taskList}
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
