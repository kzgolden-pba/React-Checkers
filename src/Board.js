import React, { Component } from 'react';
import Square from './Square';
import GamePiece from './GamePiece';

function lookupColByPosition(squares, xpos) {
    let leftStartPosition = squares[0][1].rect.left;
    let rightStartPosition = squares[0][1].rect.right;
    let offset = rightStartPosition - leftStartPosition;
    let colIndex = Math.floor((xpos - leftStartPosition) / offset) + 1;
    if(colIndex < 8 && colIndex >= 0) {
        return colIndex;
    } else {
        return -1;
    }
}

function lookupRowByPosition(squares, ypos) {
    let topStartPosition = squares[0][1].rect.top;
    let bottomStartPosition = squares[0][1].rect.bottom;
    let offset = bottomStartPosition - topStartPosition;
    let rowIndex = Math.floor((ypos - topStartPosition) / offset);
    if(rowIndex < 8 && rowIndex >= 0) {
        return rowIndex;
    } else {
        return -1;
    }
}

function getMoveInfo(squares, newRow, newCol, oldRow, oldCol, color, isKing) {
    let isBackward = !isKing && (color === 'red' && newRow < oldRow || color === 'white' && newRow > oldRow);
    let newSpaceIsOccupied = squares[newRow][newCol].color != '';
    let isDoubleDiagMove = !newSpaceIsOccupied && !isBackward && Math.abs(newRow - oldRow) === 2 && Math.abs(newCol - oldCol) === 2;
    let isValidSingleDiagMove = !newSpaceIsOccupied && !isBackward && Math.abs(newRow - oldRow) === 1;
    let middleRow = isDoubleDiagMove && (newRow > oldRow && newRow || oldRow) - 1;
    let middleCol = isDoubleDiagMove && (newCol > oldCol && newCol || oldCol) - 1;
    let pieceJumpedOver = middleRow && middleCol &&{
        color: squares[middleRow][middleCol].color,
        x: middleCol,
        y: middleRow
    };
    let isKill = pieceJumpedOver && pieceJumpedOver.color != color && pieceJumpedOver.color != '';
    return {
        isValid: isKill || isValidSingleDiagMove,
        isKill: isKill,
        killedPiece: isKill && pieceJumpedOver
    }
}   

function canCapture(squares, row, col, color, isKing) {
    let forwardDir = color === 'red' ? 1 : -1;
    let oppositeColor = color === 'red' ? 'white' : 'red';
    let leftCol = col - 1;
    let rightCol = col + 1;
    let forwardRow = (row + forwardDir) > 0 && (row + forwardDir) < 7 && row + forwardDir;
    let backwardRow = isKing && (row - forwardDir) >= 0 && (row - forwardDir) < 7 && row - forwardDir;
    if(forwardRow) {
        if(leftCol > 0 && squares[forwardRow][leftCol].color === oppositeColor && squares[forwardRow + forwardDir][leftCol - 1].color === '') {
            return true;
        }
        if(rightCol < 7 && squares[forwardRow][rightCol].color === oppositeColor && squares[forwardRow + forwardDir][rightCol + 1].color === '') {
            return true;
        }
    }
    if(backwardRow) {
        if(leftCol > 0 && squares[backwardRow][leftCol].color === oppositeColor && squares[backwardRow - forwardDir][leftCol - 1].color === '') {
            return true;
        }
        if(rightCol < 7 && squares[backwardRow][rightCol].color === oppositeColor && squares[backwardRow - forwardDir][rightCol + 1].color === '') {
            return true;
        }
    }
    return false;

}

class Board extends Component {
    constructor(props) {
        super(props);
        let squares = Array(8).fill([]).map((el) => {
            return Array(8).fill(null).map((el1) => {
                return {
                    color: ''
                };
            });
        });
        this.state = {
            squares: squares,
            turn: 'red',
            score: {
                red: 12,
                white: 12
            },
            canCaptureAgain: false
        }
    }
    componentDidMount() {
        this.startGame();
    }
    startGame() {
        let squares = this.state.squares.slice();
        for (let i = 0; i<3; i++) {
            for(let j = 0; j<8; j++) {
                squares[i][j].color = (j+i) % 2 === 0 ? '' : 'red';
                squares[i][j].isKing = false;
            }
        }
        for (let i = 3; i<5; i++) {
            for(let j = 0; j<8; j++) {
                squares[i][j].color = '';
                squares[i][j].isKing = false;
            }
        }
        for (let i = 5; i<8; i++) {
            for(let j = 0; j<8; j++) {
                squares[i][j].color = (j+i) % 2 === 0 ? '' : 'white';
                squares[i][j].isKing = false;
            }
        }
        this.setState({
            squares: squares,
            turn: 'red',
            score: {
                red: 12,
                white: 12
            }
        });
    }
    pieceMoved(row, col, e) {
        //find rectangle moved to
        let squares = this.state.squares.slice();
        let newRow = lookupRowByPosition(squares, e.y);
        let newCol = lookupColByPosition(squares, e.x);
        let color = squares[row][col].color;
        let turn = this.state.turn;
        let isKing = squares[row][col].isKing;
        let score = this.state.score;
        squares[row][col].color = '';
        squares[row][col].isKing = false;
        let canCaptureAgain = false;
        this.setState({
            squares: squares
        });
        let moveInfo = getMoveInfo(squares, newRow, newCol, row, col, color, isKing);
        if(moveInfo.isValid && turn === color) {
            squares[newRow][newCol].color = color;
            squares[newRow][newCol].isKing = isKing;
            turn = turn === 'red' ? 'white' : 'red';
            if(moveInfo.isKill) {
                squares[moveInfo.killedPiece.y][moveInfo.killedPiece.x].color = '';
                score[moveInfo.killedPiece.color]--;
                if(canCapture(squares, newRow, newCol, color, isKing)) {
                    turn = turn === 'red' ? 'white' : 'red';
                    canCaptureAgain = true;
                }
            }
            if(newRow === 0 && color === 'white') {
                squares[newRow][newCol].isKing = true;
            } else if (newRow === 7 && color === 'red') {
                squares[newRow][newCol].isKing = true;
            }
        } else {
            squares[row][col].color = color;
            squares[row][col].isKing = isKing;
        }
        this.setState({
            squares: squares,
            turn: turn,
            score: score,
            canCaptureAgain: canCaptureAgain
        });
    }
    renderPiece (rowNum, colNum) {
        let pieceColor = this.state.squares[rowNum][colNum].color;
        let isKing = this.state.squares[rowNum][colNum].isKing;
        if(pieceColor != '') {
            return <GamePiece isKing={isKing} color={pieceColor} didMove={(e) => this.pieceMoved(rowNum, colNum, e)}></GamePiece>;
        } else {
            return;
        }
    }
    recordSquarePosition (row, col, rect) {
        let squares = this.state.squares.slice();
        squares[row][col].rect = rect;
        this.setState({
            squares: squares
        });
    }
    render() {
        let squares = this.state.squares;
        let whiteScore = this.state.score.white;
        let redScore = this.state.score.red;
        return (
            <div>
                { squares.map((row, rowNum) => {
                    return (
                    <div key={rowNum}>
                        { row.map((cell, colNum) => {
                            return (<Square key={colNum + ' ' + rowNum} row={rowNum} col={colNum} reportPosition={(clientRect) => this.recordSquarePosition(rowNum, colNum, clientRect)}>
                                        {this.renderPiece(rowNum, colNum)}
                                    </Square>);
                        }) }
                    </div>
                    );
                }) }
                <p>Turn: {this.state.turn} {this.state.canCaptureAgain ? '(Can jump more pieces)' : ''}</p>
                <p>Red Score: {redScore}</p>
                <p>White Score: {whiteScore}</p>
                {whiteScore === 0 ? 'Red Wins!' : ''}
                {redScore === 0 ? 'White Wins!' : ''}
                <button onClick={() => this.startGame()}>Reset</button>
            </div>
        );
    }
}

export default Board;