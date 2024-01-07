import React, {useEffect, useState} from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Select, message, Popconfirm, Upload} from "antd";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import Settings from "../Model & Util/Settings";
import {DeleteOutlined, DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import ModelAPI from "../Model & Util/ModelAPI";
import type {RcFile} from 'antd/es/upload/interface';
import Util from "../Model & Util/Util";

interface HelpPageProps extends WithTranslation {
    title: string; // title of the Help page to display
    model: ModelAPI; // Reference to the fake backend Api
    refreshModel(): void; // callback to refresh from backend after modifying
}

const {Option} = Select;

const HelpPage: React.FC<HelpPageProps> = ({t, title, model, refreshModel}) => {
    const [dataSize, setDataSize] = useState(0);

    useEffect(() => {
        setDataSize(new Blob(Object.values(localStorage)).size);
    }, []);

    // Handles language change
    const handleLanguageChange = async (val: string) => {
        await Settings.changeLanguage(val);
        setDataSize(new Blob(Object.values(localStorage)).size);
    };

    const handleClearData = () => {
        localStorage.clear();
        setDataSize(new Blob(Object.values(localStorage)).size);
        model.clear();
        refreshModel();
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
            refreshModel();
            message.success(t('help-page.import-success'));
        } catch (e) {
            console.log(e);
            message.error(t('help-page.invalid-json'));
        }
    };

    const handleExport = () => {
        Util.downloadFile("taskData", {category: model.getCat(), taskList: model.getTaskList()});
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
                    <span>{t('help-page.select-language')}</span>
                    <Select value={i18n.language.substring(0, 2) as any}
                            popupMatchSelectWidth={false}
                            onSelect={handleLanguageChange}>
                        <Option value="en">English</Option>
                        <Option value="zh">简体中文</Option>
                    </Select>
                    <Divider/>
                    <h3>{t('help-page.data-store-info')}</h3>
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