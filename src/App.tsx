import React, {Component, ReactNode} from 'react';
import {Layout, Menu} from 'antd';
import './App.css';
import 'antd/dist/antd.css';


interface AppStates {
    category: string[]; // array of strings that represents the names of the menu items on the left
}

const {Header, Content, Footer, Sider} = Layout;

class App extends Component<{}, AppStates> {

    constructor(props: any) {
        super(props);
        this.state = {
            category: ["CSE 331", "MUSIC 116", "测试"],
        };
    }

    render() {
        return (
            <Layout style={{height: "100vh"}}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={broken => {
                        console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        console.log(collapsed, type);
                    }}
                >
                    <div className="logo" style={{
                        height: "32px",
                        margin: "16px",
                        background: "rgba(255, 255, 255, 0.2)",
                    }}/>
                    <Menu theme="dark" mode="inline">
                        {this.getMenuItems()}
                    </Menu>
                </Sider>
                <Layout>
                    <Header className="site-layout-sub-header-background" style={{padding: 0}}/>
                    <Content style={{margin: '24px 16px 0'}}>
                        <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
                            content
                        </div>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>Due Helper Dev Build</Footer>
                </Layout>
            </Layout>

        );
    }

    getMenuItems(): ReactNode {
        return this.state.category.map((name) =>
            <Menu.Item key={name}>
                {name}
            </Menu.Item>
        );
    }
}


export default App;
