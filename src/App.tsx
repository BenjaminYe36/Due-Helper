import React, {Component} from 'react';
import {Button, Input, Layout, message} from 'antd';
import './App.css';
import 'antd/dist/antd.css';
import SideBar from "./Components/SideBar";
import NewCatPopup from "./Components/NewCatPopup";
import EditableTextCat from "./Components/EditableTextCat";
import ModelAPI from "./ModelAPI";
import Drag from "./Drag";


interface AppStates {
    category: string[]; // array of strings that represents the user added categories for the tasks
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    catValue: string; // string representing the input of category name from user
}

const {Header, Content, Footer} = Layout;

class App extends Component<{}, AppStates> {
    private readonly catInput: React.RefObject<Input>;
    private readonly model: ModelAPI;

    constructor(props: any) {
        super(props);
        this.state = {
            category: [],
            catModalVisible: false,
            catValue: "",
        };
        this.catInput = React.createRef();
        this.model = new ModelAPI(["1", "2", "3"]);
    }

    componentDidMount() {
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
                         refreshModel={this.refreshModel}
                />
                <Layout>
                    <Header className="site-layout-sub-header-background" style={{padding: 0}}/>
                    <Content style={{margin: '24px 16px 0'}}>
                        <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                            <EditableTextCat value="abc" model={this.model} refreshModel={this.refreshModel}/>
                            <Button onClick={this.testModel}>Test</Button>
                            <div>
                                <Drag/>
                            </div>
                        </div>
                    </Content>
                    {/*<Footer style={{textAlign: 'center'}}>Due Helper Dev Build</Footer>*/}
                </Layout>
                <NewCatPopup catModalVisible={this.state.catModalVisible}
                             catValue={this.state.catValue}
                             catInput={this.catInput}
                             handleCatModalOk={this.handleCatModalOk}
                             handleCatModalCancel={this.handleCatModalCancel}
                             updateInput={this.updateInput}/>
            </Layout>
        );
    }


}


export default App;
