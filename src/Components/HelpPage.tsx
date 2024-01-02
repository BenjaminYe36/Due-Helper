import React, {useEffect, useState} from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Input, message, Select, Tooltip, Space} from "antd";
import {CopyOutlined, FolderOpenOutlined} from "@ant-design/icons";
import {appDataDir} from "@tauri-apps/api/path";
import {writeText} from "@tauri-apps/api/clipboard";
import {shell} from "@tauri-apps/api";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import Settings from "../Model & Util/Settings";

interface HelpPageProps extends WithTranslation {
    title: string; // title of the Help page to display
}

const {Option} = Select;

const HelpPage: React.FC<HelpPageProps> = ({t, title}) => {
    // data path that stores taskData and other data (if added in future updates)
    const [dataPath, setDataPath] = useState('');

    useEffect(() => {
        appDataDir()
            .then((dir) => {
                setDataPath(dir + "Database");
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    // Handles language change
    const handleLanguageChange = async (val: string) => {
        await Settings.changeLanguage(val);
    };

    // Handles copy folder location
    const handleCopy = async () => {
        writeText(dataPath)
            .then(() => {
                message.success(t('help-page.clip-success'));
            })
            .catch((e) => {
                message.error(t('help-page.clip-fail'));
                console.log(e);
            });
    };

    // Handles open folder in default explorer app
    const handleOpenFolder = async () => {
        shell.open(dataPath)
            .catch((e) => {
                message.error(t('help-page.open-folder-fail'));
                console.log(e);
            });
    };

    const handleOpenWiki = async () => {
        await shell.open("https://github.com/BenjaminYe36/Due-Helper/wiki");
    };

    const handleOpenIssues = async () => {
        await shell.open("https://github.com/BenjaminYe36/Due-Helper/issues");
    };

    return (
        <Content className="main-content">
            <div className="site-layout-background">
                <h1 className="main-title">{title}</h1>
                <div className="help-page-inner">
                    <Divider/>
                    <span>{t('help-page.select-language')}</span>
                    <Select value={i18n.language.substring(0, 2) as any}
                            popupMatchSelectWidth={false}
                            onSelect={handleLanguageChange}>
                        <Option value="en">English</Option>
                        <Option value="zh">简体中文</Option>
                    </Select>
                    <Divider/>
                    <span>{t('help-page.data-store-location')}</span>
                    <Space.Compact block>
                        <Input value={dataPath} style={{
                            width: `${dataPath.length}ch`,
                            maxWidth: '400px'
                        }}/>
                        <Tooltip title={t('help-page.copy-path')}>
                            <Button icon={<CopyOutlined/>} onClick={handleCopy}/>
                        </Tooltip>
                        <Tooltip title={t('help-page.open-folder')}>
                            <Button icon={<FolderOpenOutlined/>} onClick={handleOpenFolder}/>
                        </Tooltip>
                    </Space.Compact>
                    <Divider/>
                    <div className="grouped-buttons">
                        <Button type="primary" onClick={handleOpenWiki}>{t('help-page.usage-help')}</Button>
                        <Button onClick={handleOpenIssues}>{t('help-page.issue-and-suggestion')}</Button>
                    </div>
                </div>
            </div>
        </Content>
    );
};

export default withTranslation()(HelpPage);