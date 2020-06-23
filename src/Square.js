import React, { Component } from 'react';
import './Square.css';
import ReactDOM from 'react-dom';

class Square extends Component {
    componentDidMount() {
        this.props.reportPosition(ReactDOM.findDOMNode(this).getBoundingClientRect());
    }
    render() {
        let row = this.props.row;
        let col = this.props.col;
        let colorClass = (row + col) % 2 === 0 ? 'square-white' : 'square-black'; 
        return (
            <div className={'square ' + colorClass}>
                {this.props.children}
            </div>
        );
    }
}

export default Square;