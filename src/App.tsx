import React, {useEffect, useState} from 'react';
import {Layout, ConfigProvider} from 'antd';
import './App.css';
import 'antd/dist/reset.css';
import SideBar from "./Components/SideBar";
import ModelAPI, {CategoryWithColor, TaskInfo} from "./Model & Util/ModelAPI";
import MainContent from "./Components/MainContent";
import {Scrollbars} from 'react-custom-scrollbars-2';
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

const defaultTaskData = '{"category":[],"taskList":[]}';

let model: ModelAPI = new ModelAPI([], []);

/**
 * The main application class of this task management software
 */
const App: React.FC<AppProps> = ({t}) => {
    // array of strings that represents the user added categories for the tasks
    const [category, setCategory] = useState<CategoryWithColor[]>([]);
    // array of TaskInfo that represents a list of tasks user added under existing categories
    const [taskList, setTaskList] = useState<TaskInfo[]>([]);
    // string representing the key of selected item in the sidebar menu
    const [selectionKey, setSelectionKey] = useState('all-tasks');

    useEffect(() => {
        readTextFile('Database/taskData.json', {dir: BaseDirectory.App})
            .then((contents) => {
                console.log('found existing file');
                let obj = JSON.parse(contents);
                initializeModel(obj);
            })
            .catch((e) => {
                // most likely file doesn't exist
                console.log('no existing file found');
                let obj = JSON.parse(defaultTaskData);
                initializeModel(obj);
            });
        i18n.on('languageChanged', (lng) => {
            console.log(`language changed to ${lng}`);
        });
        Settings.getLanguage().then((language) => {
            i18n.changeLanguage(language);
        });
    }, []);

    const initializeModel = (obj: TaskData) => {
        model = new ModelAPI(obj.category, obj.taskList);
        model.writeToJson();
        refreshModel();
    };

    // methods relating to the sidebar menu states

    const updateSelectionKey = (key: string) => {
        console.log(`update select key called with ${key}`);
        if (!key.startsWith('Cat') || (key.startsWith('Cat-') && model.hasCat(key.substring(4)))) {
            setSelectionKey(key);
        }
    };

    // methods of calling the model to update view in this App

    const refreshModel = () => {
        setCategory([...model.getCat()]);
        setTaskList([...model.getTaskList()]);
    };

    return (
        <ConfigProvider locale={i18n.language.startsWith('zh') ? zhCN : enUS}>
            <Layout style={{minHeight: "100vh", overflow: "auto"}}>

                <SideBar category={category}
                         model={model}
                         selectionKey={selectionKey}
                         refreshModel={refreshModel}
                         updateSelection={updateSelectionKey}
                />

                <Layout>

                    <Scrollbars>
                        {
                            selectionKey === "helpAndInfo" ?
                                <HelpPage title={t('help-page.title')}/> :
                                <MainContent category={category} taskList={taskList}
                                             model={model} refreshModel={refreshModel}
                                             selection={selectionKey}/>
                        }
                    </Scrollbars>

                </Layout>


            </Layout>
        </ConfigProvider>
    );
};


export default withTranslation()(App);
