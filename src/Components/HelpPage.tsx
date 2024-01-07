import React, {useEffect, useState} from "react";
import {Content} from "antd/es/layout/layout";
import {Button, Divider, Select, message, Popconfirm} from "antd";
import {withTranslation, WithTranslation} from 'react-i18next';
import i18n from '../i18n/config';
import Settings from "../Model & Util/Settings";
import {DeleteOutlined} from "@ant-design/icons";
import ModelAPI from "../Model & Util/ModelAPI";

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
                    <Popconfirm title={t('help-page.clear-data')} onConfirm={handleClearData}>
                        <Button danger icon={<DeleteOutlined/>}>
                            {t('help-page.clear-data')}
                        </Button>
                    </Popconfirm>
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