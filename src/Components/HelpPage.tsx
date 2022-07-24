import React from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Input, message, Tooltip} from "antd";
import {CopyOutlined, FolderOpenOutlined} from "@ant-design/icons";
import {appDir} from "@tauri-apps/api/path";
import {writeText} from "@tauri-apps/api/clipboard";
import {shell} from "@tauri-apps/api";

interface HelpPageProps {
    title: string; // title of the Help page to display
}

interface HelpPageState {
    dataPath: string; // data path that stores taskData and other data (if added in future updates)
}

class HelpPage extends React.Component<HelpPageProps, HelpPageState> {

    constructor(props: HelpPageProps) {
        super(props);
        this.state = {
            dataPath: ""
        };
    }

    async componentDidMount() {
        appDir()
            .then((dir) => {
                this.setState({
                    dataPath: dir + "Database"
                });
            })
            .catch((e) => {
                console.log(e);
            });
    }

    // Handles copy folder location
    handleCopy = async () => {
        writeText(this.state.dataPath)
            .then(() => {
                message.success("Copied to clipboard successfully");
            })
            .catch((e) => {
                message.error("Copy to clipboard failed");
                console.log(e);
            });
    }

    // Handles open folder in default explorer app
    handleOpenFolder = async () => {
        shell.open(this.state.dataPath)
            .catch((e) => {
                message.error("Open folder failed");
                console.log(e);
            });
    }

    handleOpenWiki = async () => {
        await shell.open("https://github.com/BenjaminYe36/Due-Helper/wiki");
    }

    handleOpenIssues = async () => {
        await shell.open("https://github.com/BenjaminYe36/Due-Helper/issues");
    }

    render() {
        return (
            <Content className="main-content">
                <div className="site-layout-background">
                    <h1 className="main-title">{this.props.title}</h1>
                    <div className="help-page-inner">
                        <Divider/>
                        <span>Data Stored location:</span>
                        <Input.Group compact>
                            <Input value={this.state.dataPath} style={{
                                width: `${this.state.dataPath.length}ch`,
                                maxWidth: '400px'
                            }}/>
                            <Tooltip title="Copy Path">
                                <Button icon={<CopyOutlined/>} onClick={this.handleCopy}/>
                            </Tooltip>
                            <Tooltip title="Open Folder">
                                <Button icon={<FolderOpenOutlined/>} onClick={this.handleOpenFolder}/>
                            </Tooltip>
                        </Input.Group>
                        <Divider/>
                        <div className="grouped-buttons">
                            <Button type="primary" onClick={this.handleOpenWiki}>Usage Help</Button>
                            <Button onClick={this.handleOpenIssues}>Submit Issues Or Suggestions</Button>
                        </div>
                    </div>
                </div>
            </Content>
        );
    }
}

export default HelpPage;