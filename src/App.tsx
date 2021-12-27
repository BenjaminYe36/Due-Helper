import React, {Component} from 'react';
import {Input, Layout, message} from 'antd';
import './App.css';
import 'antd/dist/antd.css';
import SideBar from "./Components/SideBar";
import NewCatPopup from "./Components/NewCatPopup";
import ModelAPI from "./ModelAPI";
import ReorderPopup from "./Components/ReorderPopup";
import Todo from "./Components/Todo";

const {ipcRenderer} = window.require("electron");


interface AppStates {
    category: string[]; // array of strings that represents the user added categories for the tasks
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    reorderModalVisible: boolean; // boolean representing the visibility of the modal for reordering Categories
    catValue: string; // string representing the input of category name from user
}

const {Header, Content} = Layout;

class App extends Component<{}, AppStates> {
    private readonly catInput: React.RefObject<Input>;
    private model: ModelAPI;

    constructor(props: any) {
        super(props);
        this.state = {
            category: [],
            catModalVisible: false,
            reorderModalVisible: false,
            catValue: "",
        };
        this.catInput = React.createRef();
        this.model = new ModelAPI([]);
    }

    componentDidMount() {
        let tmp = ipcRenderer.sendSync('reading-json-synchronous');
        console.log(tmp);
        this.model = new ModelAPI(JSON.parse(tmp).category);
        this.refreshModel();
    }

    // NewCatModal callback related functions

    showNewCatModal = () => {
        this.setCatModalVisible(true);
        setTimeout(() => {
            this.catInput.current!.focus({
                cursor: 'end',
            });
        }, 200);
    }

    handleCatModalOk = () => {
        if (this.state.catValue.trim() !== "") {
            this.model.addCat(this.state.catValue);
            this.refreshModel();
            this.setState({
                catValue: "",
            });
            this.setCatModalVisible(false);
        } else {
            message.warning("Can't use empty category names!");
        }
    }

    handleCatModalCancel = () => {
        this.setState({
            catValue: "",
        });
        this.setCatModalVisible(false);
    }

    setCatModalVisible = (visible: boolean) => {
        this.setState({
            catModalVisible: visible,
        });
    }

    updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            catValue: event.target.value,
        });
    }

    // ReorderModal callback related functions

    showReorderModal = () => {
        this.setReorderModalVisible(true);
    }

    setReorderModalVisible = (visible: boolean) => {
        this.setState({
            reorderModalVisible: visible,
        });
    }

    // methods of calling the model to update view in this App
    testModel = () => {
        this.refreshModel();
    }

    refreshModel = () => {
        this.setState({
            category: this.model.getCat(),
        });
    }

    render() {
        return (
            <Layout style={{height: "100vh", overflow: "auto"}}>
                <SideBar category={this.state.category}
                         model={this.model}
                         onNewCat={this.showNewCatModal}
                         onReorderCat={this.showReorderModal}
                         refreshModel={this.refreshModel}
                />
                <Layout>
                    <Header className="site-layout-sub-header-background" style={{padding: 0}}/>
                    <Content style={{margin: '24px 16px 0'}}>
                        <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                            <ul style={{listStyleType:'none'}}>
                            <Todo
                                task={{
                                    id: "firstTODO",
                                    category: "testing",
                                    description: "testing task testingtesting task testing tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting tasktesting taskv",
                                    availableDate: new Date('12/25/2021'),
                                    dueDate: new Date('12/26/2021'),
                                    completed: false
                                }}/>
                                <Todo
                                    task={{
                                        id: "secondTODO",
                                        category: "Lab",
                                        description: "1. Read through instructions to run locally, add to weekly report, add to labLog (Done)",
                                        availableDate: null,
                                        dueDate: new Date('12/26/2021'),
                                        completed: true
                                    }}/>
                            </ul>
                        </div>
                    </Content>
                </Layout>
                <NewCatPopup catModalVisible={this.state.catModalVisible}
                             catValue={this.state.catValue}
                             catInput={this.catInput}
                             handleCatModalOk={this.handleCatModalOk}
                             handleCatModalCancel={this.handleCatModalCancel}
                             updateInput={this.updateInput}/>
                <ReorderPopup reorderModalVisible={this.state.reorderModalVisible}
                              category={this.state.category}
                              model={this.model}
                              refreshModel={this.refreshModel}
                              handleReorderModalOk={() => this.setReorderModalVisible(false)}
                              handleReorderModalCancel={() => this.setReorderModalVisible(false)}/>
            </Layout>
        );
    }


}


export default App;
