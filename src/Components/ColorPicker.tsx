import React from 'react';
import reactCSS from 'reactcss';
import {SketchPicker} from 'react-color';
import {Tooltip} from 'antd';
import {withTranslation, WithTranslation} from 'react-i18next';

interface ColorPickerProps extends WithTranslation {
    color: string; // default color in this picker (hex)
    onChangeColor(color: any): void; // callback to change color of this color picker
}

interface ColorPickerState {
    displayColorPicker: boolean; // the visibility of the actual color picker part
}

/**
 * A Color picker using react-color component
 */
class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
    private styles: any;

    constructor(props: ColorPickerProps) {
        super(props);
        this.state = {
            displayColorPicker: false,
        };
        this.styles = reactCSS({
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
    }

    handleClick = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker});
    };

    handleClose = () => {
        this.setState({displayColorPicker: false});
    };

    handleChange = (color: any) => {
        this.props.onChangeColor(color);
    };

    render() {
        const {t} = this.props;

        return (
            <div>
                <Tooltip title={t('cat-popup.pick-tag-color')}>
                    <div style={this.styles.swatch} onClick={this.handleClick}>
                        <div style={{
                            width: '17px',
                            height: '17px',
                            borderRadius: '2px',
                            background: this.props.color,
                        }}/>
                    </div>
                </Tooltip>

                {this.state.displayColorPicker ? <div style={this.styles.popover}>
                    <div style={this.styles.cover} onClick={this.handleClose}/>
                    <SketchPicker color={this.props.color} onChange={this.handleChange} disableAlpha={true}/>
                </div> : null}

            </div>
        );
    }
}

export default withTranslation()(ColorPicker);