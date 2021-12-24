import React, {Component} from "react";
// @ts-ignore
import {Draggable} from "react-drag-reorder";
import EditableTextCat from "./Components/EditableTextCat";

class Drag extends React.Component<any, any> {
    state = {
        words: ["Hello", "Hi", "How are you", "Cool"],
    };

    getChangedPos = (currentPos: number, newPos: number) => {
        console.log(currentPos, newPos);
        if (currentPos < newPos) {
            let wordsCopy = this.state.words.concat();
            let tmp = this.state.words[currentPos];
            for (let i = currentPos; i < newPos; i++) {
                wordsCopy[i] = wordsCopy[i + 1];
            }
            wordsCopy[newPos] = tmp;
            this.setState({
                words: wordsCopy,
            });
        } else if (currentPos > newPos) {
            let wordsCopy = this.state.words.concat();
            let tmp = this.state.words[currentPos];
            for (let i = currentPos; i > newPos; i--) {
                wordsCopy[i] = wordsCopy[i - 1];
            }
            wordsCopy[newPos] = tmp;
            this.setState({
                words: wordsCopy,
            });
        }
    };

    render() {
        return (
            <div className="flex-container">
                <div className="row">
                    <Draggable onPosChange={this.getChangedPos}>
                        {this.state.words.map((word, idx) => {
                            return (
                                <div key={idx} className="flex-item">
                                    {word}
                                </div>
                            );
                        })}
                    </Draggable>
                </div>
            </div>
        );
    }
}

export default Drag;