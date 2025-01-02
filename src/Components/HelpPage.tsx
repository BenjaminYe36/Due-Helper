import React, {useEffect, useState} from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Input, message, Select, Tooltip, Space, Typography} from "antd";
import {CopyOutlined, FolderOpenOutlined, SaveOutlined} from "@ant-design/icons";
import {appDataDir} from "@tauri-apps/api/path";
import {writeText} from "@tauri-apps/api/clipboard";
import {shell} from "@tauri-apps/api";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import Settings, {defaultPostponeTImeStr} from "../Model & Util/Settings";

interface HelpPageProps extends WithTranslation {
    title: string; // title of the Help page to display
    settings: Settings;
}

const {Option} = Select;
const {Title} = Typography;

const HelpPage: React.FC<HelpPageProps> = ({t, title, settings}) => {
    // data path that stores taskData and other data (if added in future updates)
    const [dataPath, setDataPath] = useState('');
    // Variable that tracks the input of customizable postpone time string
    // in the format of "[number] [time unit],..."
    const [postponeTimeStr, setPostponeTimeStr] = useState(defaultPostponeTImeStr);

    useEffect(() => {
        appDataDir()
            .then((dir) => {
                setDataPath(dir + "Database");
            })
            .catch((e) => {
                console.log(e);
            });
        setPostponeTimeStr(settings.getPostponeTimeStr());
    }, []);

    // Handles language change
    const handleLanguageChange = async (val: string) => {
        await settings.changeLanguage(val);
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

    const handlePostponeStrSave = () => {
        try {
            settings.changePostponeStr(postponeTimeStr);
            // valid input
            message.success(t('help-page.save-success'));
        }
        catch (e) {
            // invalid input
            message.error(t('help-page.wrong-format'));
        }
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
                    <Title level={5}>{t('help-page.select-language')}</Title>
                    <Select value={i18n.language.substring(0, 2) as any}
                            popupMatchSelectWidth={false}
                            onSelect={handleLanguageChange}>
                        <Option value="en">English</Option>
                        <Option value="zh">简体中文</Option>
                    </Select>
                    <Divider/>
                    <Title level={5}>{t('help-page.data-store-location')}</Title>
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
                    <Title level={5}>{t('help-page.postpone-dates')}</Title>
                    <Space.Compact block>
                        <Input value={postponeTimeStr} style={{width: `${postponeTimeStr.length + 5}ch`}}
                               onChange={(e) => setPostponeTimeStr(e.target.value)}/>
                        <Tooltip title={t('help-page.save-edit')}>
                            <Button icon={<SaveOutlined/>} onClick={handlePostponeStrSave}/>
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