import React, {Component} from 'react';
import {Input, Layout, message} from 'antd';
import './App.css';
import 'antd/dist/antd.css';
import SideBar from "./Components/SideBar";
import NewCatPopup from "./Components/NewCatPopup";


interface AppStates {
    category: string[]; // array of strings that represents the user added categories for the tasks
    catModalVisible: boolean; // boolean representing the visibility of the modal for adding new Categories
    catValue: string; // string representing the input of category name from user
}

const {Header, Content, Footer} = Layout;

class App extends Component<{}, AppStates> {
    private readonly catInput: React.RefObject<Input>;

    constructor(props: any) {
        super(props);
        this.state = {
            category: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            catModalVisible: false,
            catValue: "",
        };
        this.catInput = React.createRef();
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
            this.setState({
                category: this.state.category.concat(this.state.catValue),
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

    //

    render() {
        return (
            <Layout style={{height: "100vh", overflow: "auto"}}>
                <SideBar category={this.state.category} onNewCat={this.showNewCatModal}/>
                <Layout>
                    <Header className="site-layout-sub-header-background" style={{padding: 0}}/>
                    <Content style={{margin: '24px 16px 0'}}>
                        <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                            content
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
