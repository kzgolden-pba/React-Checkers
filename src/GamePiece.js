import React, { Component } from 'react';
import './GamePiece.css';
import Draggable from 'react-draggable';

class GamePiece extends Component {
    constructor(props) {
        super(props);
        this.state = {
            draggableKey: 0,
            dragClass: ''
        };
    }
    dragDidStop(e) {
        this.props.didMove(e);
    }
    dragDidStart() {
        this.setState({
            dragClass: 'GamePiece-dragged' 
        });
    }
    render() {
        let draggableKey = this.state.draggableKey;
        return (
            <Draggable key={draggableKey} 
                onStop={(e) => this.dragDidStop(e)} 
                onStart={() => this.dragDidStart()}
            >
                <div className={'GamePiece GamePiece-' + this.props.color + ' ' + this.state.dragClass}>{this.props.isKing ? 'K' : ''}
                </div>
            </Draggable>
        );
    }
}

export default GamePiece;