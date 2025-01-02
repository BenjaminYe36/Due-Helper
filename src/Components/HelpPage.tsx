import React, {useEffect, useState} from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Input, message, Select, Tooltip, Space, Typography, Popconfirm, Upload} from "antd";
import {DeleteOutlined, DownloadOutlined, UploadOutlined, SaveOutlined} from "@ant-design/icons";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import ModelAPI from "../Model & Util/ModelAPI";
import type {RcFile} from 'antd/es/upload/interface';
import Util from "../Model & Util/Util";
import Settings, {defaultPostponeTImeStr} from "../Model & Util/Settings";

interface HelpPageProps extends WithTranslation {
    title: string; // title of the Help page to display
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
    settings: Settings;
}

const {Option} = Select;
const {Title} = Typography;

const HelpPage: React.FC<HelpPageProps> = ({
                                               t, title,
                                               model, refreshModel, settings
                                           }) => {
    const [dataSize, setDataSize] = useState(0);
    // Variable that tracks the input of customizable postpone time string
    // in the format of "[number] [time unit],..."
    const [postponeTimeStr, setPostponeTimeStr] = useState(defaultPostponeTImeStr);

    useEffect(() => {
        updateStorageSize();
        setPostponeTimeStr(settings.getPostponeTimeStr());
    }, []);

    const updateStorageSize = () => {
        setDataSize(new Blob(Object.values(localStorage)).size);
    }

    // Handles language change
    const handleLanguageChange = async (val: string) => {
        await settings.changeLanguage(val);
        updateStorageSize();
    };

    const handleClearData = () => {
        localStorage.clear();
        updateStorageSize();
        model.clear();
        refreshModel();
        settings.reset();
        setPostponeTimeStr(defaultPostponeTImeStr);
        message.success(t('help-page.clear-success'));
    };

    const handleImport = async (file: RcFile) => {
        const fileText = await file.text();
        try {
            const tmpObj = JSON.parse(fileText);
            if (tmpObj.taskList === undefined || tmpObj.category === undefined) {
                throw new Error('Task data has missing properties');
            }
            model.importFromObj(tmpObj);
            model.writeToJson();
            refreshModel();
            updateStorageSize();
            message.success(t('help-page.import-success'));
        } catch (e) {
            console.log(e);
            message.error(t('help-page.invalid-json'));
        }
    };

    const handleExport = () => {
        Util.downloadFile("taskData", {category: model.getCat(), taskList: model.getTaskList()});
    };

    const handlePostponeStrSave = () => {
        try {
            settings.changePostponeStr(postponeTimeStr);
            // valid input
            message.success(t('help-page.save-success'));
            updateStorageSize();
        } catch (e) {
            // invalid input
            message.error(t('help-page.wrong-format'));
        }
    };

    const handleOpenWiki = () => {
        window.open("https://github.com/BenjaminYe36/Due-Helper/wiki", "_blank", "noreferrer");
    };

    const handleOpenIssues = () => {
        window.open("https://github.com/BenjaminYe36/Due-Helper/issues", "_blank", "noreferrer");
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
                    <Title level={5}>{t('help-page.data-store-info')}</Title>
                    <p>{`${t('help-page.data-occupied')} ${dataSize} Bytes`}</p>
                    <div className="grouped-buttons">
                        <Popconfirm title={t('help-page.clear-data')} onConfirm={handleClearData}>
                            <Button danger icon={<DeleteOutlined/>}>
                                {t('help-page.clear-data')}
                            </Button>
                        </Popconfirm>
                        <Upload showUploadList={false} accept=".json"
                                beforeUpload={(file) => {
                                    handleImport(file);
                                    return false;
                                }}>
                            <Button icon={<UploadOutlined/>}>{t('help-page.import-data')}</Button>
                        </Upload>
                        <Button type="primary" icon={<DownloadOutlined/>} onClick={handleExport}>
                            {t('help-page.export-data')}
                        </Button>
                    </div>
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