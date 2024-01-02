import React, {useState} from 'react';
import {Button, Dropdown, Layout, Menu, Modal} from 'antd';
import type {MenuProps} from 'antd';
import ModelAPI, {CategoryWithColor} from "../Model & Util/ModelAPI";
import {
    CarryOutTwoTone,
    ClockCircleTwoTone, DeleteOutlined, EditTwoTone, ExclamationCircleOutlined,
    ExclamationCircleTwoTone,
    FileSearchOutlined, InfoCircleTwoTone,
    PlusOutlined
} from "@ant-design/icons";
import EditableTextCat from "./EditableTextCat";
import CatPopup from "./CatPopup";
import ReorderPopup from "./ReorderPopup";
import {MenuInfo} from "rc-menu/lib/interface";
import {withTranslation, WithTranslation} from 'react-i18next';


interface SideBarProps extends WithTranslation {
    category: CategoryWithColor[]; // array of strings that represents the user added categories for the tasks
    model: ModelAPI; // Reference to the fake backend Api
    selectionKey: string; // Selected key in the sidebar menu
    refreshModel(): void; // callback to refresh from backend after modifying
    updateSelection(key: string): void; // callback for updating selected key value in the side menu
}


const {Sider} = Layout;
const {confirm} = Modal;

/**
 * Sidebar of the main app, consists of all tasks, Time filtered views, and user created categories
 */
const SideBar: React.FC<SideBarProps> = (props) => {
    // boolean representing the visibility of the modal for adding new Categories
    const [newCatModalVisible, setNewCatModalVisible] = useState(false);
    // boolean representing the visibility of the modal for editing Categories
    const [editCatModalVisible, setEditCatModalVisible] = useState(false);
    // boolean representing the visibility of the modal for reordering Categories
    const [reorderCatModalVisible, setReorderCatModalVisible] = useState(false);
    // prefilled data for edit category popup
    const [prefillCat, setPrefillCat] = useState<CategoryWithColor | null>(null);

    // NewCatModal callback related functions
    const showNewCatModal = () => {
        setNewCatModalVisible(true);
    };

    // EditCatModal callback related functions
    const showEditCatModal = (cat: CategoryWithColor) => {
        setPrefillCat(cat);
        setEditCatModalVisible(true);
    };

    // Delete popup confirm

    const showDeleteConfirm = (cat: CategoryWithColor) => {
        confirm({
            title: <span>{props.t('irr-warning')}<br/>
                {props.t('delete-cat-confirm')}: {`[ ${cat.catName} ]?`}
                   </span>,
            icon: <ExclamationCircleOutlined style={{color: "red"}}/>,
            content: props.t('delete-cat-warning'),
            okText: props.t('yes'),
            okType: 'danger',
            cancelText: props.t('no'),
            width: 800,

            onOk() {
                console.log(`Delete ${cat.catName}`);
                handleConfirm(cat.catName);
            },

            onCancel() {
                console.log('Delete Cancelled');
            },
        });
    };

    // ReorderModal callback related functions

    const showReorderCatModal = () => {
        setReorderCatModalVisible(true);
    };

    // Method that deals with delete confirm

    const handleConfirm = (name: string) => {
        props.model.deleteCat(name);
        props.updateSelection("all-tasks");
        props.refreshModel();
    };

    // Context Menu handle function

    const handleContextMenu = (menuInfo: MenuInfo, cat: CategoryWithColor) => {
        console.log(menuInfo);
        if (menuInfo.key === "Context-Edit") {
            console.log('should pop up edit');
            showEditCatModal(cat);
        } else if (menuInfo.key === "Context-Del") {
            console.log('should pop up delete confirm');
            showDeleteConfirm(cat);
        }
        console.log(cat);
    };

    const getMenuItems = (): MenuProps["items"] => {
        const contextMenuItems: MenuProps['items'] = [
            {
                label: props.t('edit'),
                key: "Context-Edit",
                icon: <EditTwoTone twoToneColor='#8c8c8c'/>
            },
            {
                label: props.t('delete'),
                key: "Context-Del",
                icon: <DeleteOutlined/>,
                danger: true
            }
        ];

        return props.category.map((cat) => {
                const menuProps = {
                    items: contextMenuItems,
                    onClick: (item: MenuInfo) => handleContextMenu(item, cat)
                };
                const innerNode =
                    (<Dropdown menu={menuProps} trigger={['contextMenu']}>
                        <div>
                            <div style={{
                                padding: '2px',
                                background: '#fff',
                                borderRadius: '2px',
                                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                display: 'inline-flex',
                                cursor: 'pointer',
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    background: cat.color,
                                }}/>
                            </div>
                            <EditableTextCat
                                value={cat.catName}
                                model={props.model}
                                refreshModel={props.refreshModel}
                                updateSelection={props.updateSelection}
                            />
                        </div>
                    </Dropdown>);
                return ({label: innerNode, key: `Cat-${cat.catName}`});
            }
        );
    };

    const {t} = props;
    const items: MenuProps['items'] = [
        // First part: All Tasks View
        {
            label: t('side-bar.all-tasks'),
            key: "all-tasks",
            icon: <FileSearchOutlined style={{color: '#d9d9d9'}}/>
        },
        // Second part: Time Filtered Views
        {
            label: `[${t('side-bar.tasks-by-time')}]`,
            key: "byTime",
            type: "group",
            children: [
                {
                    label: t('side-bar.urgent'),
                    key: "urgent",
                    icon: <ExclamationCircleTwoTone twoToneColor='#cf1322'/>
                },
                {
                    label: t('side-bar.current'),
                    key: "current",
                    icon: <CarryOutTwoTone twoToneColor='#faad14'/>
                },
                {
                    label: t('side-bar.future'),
                    key: "future",
                    icon: <ClockCircleTwoTone twoToneColor='#a0d911'/>
                }
            ]
        },
        // Third Part: User added categories
        {
            label: `[${t('side-bar.cat')}]`,
            key: "byUserCat",
            type: "group",
            children: props.category.length > 0 ?
                getMenuItems() :
                [{
                    label: <span style={{fontStyle: "italic"}}>{t('nothing')}</span>,
                    key: "nothingYet",
                    disabled: true
                }]
        },
        // Forth Part: Settings & Help
        {
            label: `[${t('side-bar.settings-and-help')}]`,
            key: "settingsGroup",
            type: "group",
            children: [
                {
                    label: t('side-bar.settings-and-help'),
                    key: "helpAndInfo",
                    icon: <InfoCircleTwoTone/>
                }
            ]
        }
    ];

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            width="250px"
            onBreakpoint={broken => {
                console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
                console.log(collapsed, type);
            }}
        >
            <div className="logo"/>
            <div className="modifyCatButtons" style={{textAlign: 'center'}}>
                <Button type="primary" shape="round"
                        icon={<PlusOutlined/>}
                        onClick={showNewCatModal}>{t('side-bar.new-cat')}</Button>
                <br/>
                <Button style={{marginTop: "10px"}} shape="round"
                        onClick={showReorderCatModal}>{t('side-bar.reorder')}</Button>
            </div>
            <Menu theme="dark" mode="inline"
                  selectedKeys={[props.selectionKey]}
                  onClick={(item) => props.updateSelection(item.key)}
                  items={items}/>
            {/*New Cat Popup*/}
            <CatPopup catModalVisible={newCatModalVisible}
                      model={props.model}
                      createNew={true}
                      prefillCat={null}
                      refreshModel={props.refreshModel}
                      handleCatModalOk={() => setNewCatModalVisible(false)}
                      handleCatModalCancel={() => setNewCatModalVisible(false)}
                      updateSelection={props.updateSelection}/>
            {/*Edit Cat Popup*/}
            <CatPopup catModalVisible={editCatModalVisible}
                      model={props.model}
                      createNew={false}
                      prefillCat={prefillCat}
                      refreshModel={props.refreshModel}
                      handleCatModalOk={() => setEditCatModalVisible(false)}
                      handleCatModalCancel={() => {
                          setEditCatModalVisible(false);
                          setPrefillCat(null);
                      }}
                      updateSelection={props.updateSelection}/>
            <ReorderPopup reorderModalVisible={reorderCatModalVisible}
                          category={props.category}
                          model={props.model}
                          refreshModel={props.refreshModel}
                          handleReorderModalOk={() => setReorderCatModalVisible(false)}
                          handleReorderModalCancel={() => setReorderCatModalVisible(false)}/>
        </Sider>
    );
};

export default withTranslation()(SideBar);