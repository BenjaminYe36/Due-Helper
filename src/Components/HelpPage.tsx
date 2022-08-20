import React from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Input, message, Select, Tooltip} from "antd";
import {CopyOutlined, FolderOpenOutlined} from "@ant-design/icons";
import {appDir} from "@tauri-apps/api/path";
import {writeText} from "@tauri-apps/api/clipboard";
import {shell} from "@tauri-apps/api";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import Settings from "../Model & Util/Settings";

interface HelpPageProps extends WithTranslation {
    title: string; // title of the Help page to display
}

interface HelpPageState {
    dataPath: string; // data path that stores taskData and other data (if added in future updates)
}

const {Option} = Select;

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

    // Handles language change
    handleLanguageChange = async (val: string) => {
        await Settings.changeLanguage(val);
    };

    // Handles copy folder location
    handleCopy = async () => {
        writeText(this.state.dataPath)
            .then(() => {
                message.success(this.props.t('help-page.clip-success'));
            })
            .catch((e) => {
                message.error(this.props.t('help-page.clip-fail'));
                console.log(e);
            });
    }

    // Handles open folder in default explorer app
    handleOpenFolder = async () => {
        shell.open(this.state.dataPath)
            .catch((e) => {
                message.error(this.props.t('help-page.open-folder-fail'));
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
        const {t} = this.props;
        return (
            <Content className="main-content">
                <div className="site-layout-background">
                    <h1 className="main-title">{this.props.title}</h1>
                    <div className="help-page-inner">
                        <Divider/>
                        <span>{t('help-page.select-language')}</span>
                        <Select value={i18n.language.substring(0, 2)} onSelect={this.handleLanguageChange}>
                            <Option value="en">English</Option>
                            <Option value="zh">简体中文</Option>
                        </Select>
                        <Divider/>
                        <span>{t('help-page.data-store-location')}</span>
                        <Input.Group compact>
                            <Input value={this.state.dataPath} style={{
                                width: `${this.state.dataPath.length}ch`,
                                maxWidth: '400px'
                            }}/>
                            <Tooltip title={t('help-page.copy-path')}>
                                <Button icon={<CopyOutlined/>} onClick={this.handleCopy}/>
                            </Tooltip>
                            <Tooltip title={t('help-page.open-folder')}>
                                <Button icon={<FolderOpenOutlined/>} onClick={this.handleOpenFolder}/>
                            </Tooltip>
                        </Input.Group>
                        <Divider/>
                        <div className="grouped-buttons">
                            <Button type="primary" onClick={this.handleOpenWiki}>{t('help-page.usage-help')}</Button>
                            <Button onClick={this.handleOpenIssues}>{t('help-page.issue-and-suggestion')}</Button>
                        </div>
                    </div>
                </div>
            </Content>
        );
    }
}

export default withTranslation()(HelpPage);