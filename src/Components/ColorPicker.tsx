import React, {useState} from 'react';
import reactCSS from 'reactcss';
import {SketchPicker} from 'react-color';
import {Tooltip} from 'antd';
import {withTranslation, WithTranslation} from 'react-i18next';

interface ColorPickerProps extends WithTranslation {
    color: string; // default color in this picker (hex)
    onChangeColor(color: any): void; // callback to change color of this color picker
}


const colorPickerStyles: any = reactCSS({
    'default': {
        swatch: {
            marginTop: '2.7px',
            padding: '5px',
            background: '#fff',
            borderRadius: '1px',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            display: 'inline-block',
            cursor: 'pointer',
        },
        popover: {
            position: 'absolute',
            zIndex: '2',
        },
        cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        },
    },
});

/**
 * A Color picker using react-color component
 */
const ColorPicker: React.FC<ColorPickerProps> = ({t, color, onChangeColor}) => {
    // the visibility of the actual color picker part
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleClick = () => {
        setShowColorPicker(!showColorPicker);
    };

    const handleClose = () => {
        setShowColorPicker(false);
    };

    const handleChange = (color: any) => {
        onChangeColor(color);
    };

    return (
        <div>
            <Tooltip title={t('cat-popup.pick-tag-color')}>
                <div style={colorPickerStyles.swatch} onClick={handleClick}>
                    <div style={{
                        width: '17px',
                        height: '17px',
                        borderRadius: '2px',
                        background: color,
                    }}/>
                </div>
            </Tooltip>

            {showColorPicker ?
                <div style={colorPickerStyles.popover}>
                    <div style={colorPickerStyles.cover} onClick={handleClose}/>
                    <SketchPicker color={color} onChange={handleChange} disableAlpha={true}/>
                </div>
                : null
            }

        </div>
    );
};

export default withTranslation()(ColorPicker);