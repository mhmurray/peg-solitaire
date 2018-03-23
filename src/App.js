import React, { Component } from 'react';
import './App.css';

const HOLENULL=0;
const HOLEBALL=1;
const HOLEEMPTY=2;
const HOLESELECTED=3;

class App extends Component {
    render() {
        return (
            <div className="App">
                <div id="game-area">
                    <div>
                        <h1>Peg Solitaire</h1>
                    </div>
                    <Game/>
                </div>
            </div>
        );
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        const N = 7;
        var holes = Array(N).fill(null).map( _ => Array(N).fill(0));

        for(let i=0; i<holes.length; i++) {
            for(let j=0; j<holes.length; j++) {
                if(Math.min(i,N-i-1)+Math.min(j,N-j-1) < 2) {
                    holes[i][j] = HOLENULL;
                } else if(i===2 && j===3) {
                    holes[i][j] = HOLEEMPTY;
                } else {
                    holes[i][j] = HOLEBALL;
                    //holes[i][j] = HOLEEMPTY;
                }
            }
        }

        this.state={
            history: [{
                holes: holes,
            }],
            stepNumber: 0,
        };
    }

    jumpTo(step) {
        this.setState({stepNumber: step});
    }

    cloneLatestHoles() {
        const history = this.state.history;
        const current = history[history.length-1]
        // Clone 2d array
        return current.holes.map( (x) => x.slice() );
    }

    makeMove(from_i, from_j, to_i, to_j) {
        // the FROM position must have been selected and TO must have been empty
        var movedholes = this.cloneLatestHoles();
        movedholes[from_i][from_j] = HOLEEMPTY;
        movedholes[to_i][to_j] = HOLEBALL;
        movedholes[(from_i+to_i)/2][(from_j+to_j)/2] = HOLEEMPTY;
        return movedholes;
    }

    // Return true if winner, false if loser, null if not finished
    checkWin(holes) {
        var ballCount = 0;
        var isOver = true;
        for(let i=0; i<holes.length; i++) {
            for(let j=0; j<holes[i].length; j++) {
                let isBall = holes[i][j] === HOLESELECTED || holes[i][j] === HOLEBALL;
                if(isBall) {
                    ballCount+=1;
                }

                // Find available moves
                if(isBall && i-1>=0 && i+1<holes.length) {
                    let jumpDown = (holes[i-1][j] === HOLESELECTED || holes[i-1][j] === HOLEBALL)
                        && holes[i+1][j] === HOLEEMPTY;
                    let jumpUp = (holes[i+1][j] === HOLESELECTED || holes[i+1][j] === HOLEBALL)
                        && holes[i-1][j] === HOLEEMPTY;

                    if(jumpDown || jumpUp) {
                        isOver = false;
                    }
                }

                if(isBall && j-1>=0 && j+1<holes.length) {
                    let jumpLeft = (holes[i][j-1] === HOLESELECTED || holes[i][j-1] === HOLEBALL)
                        && holes[i][j+1] === HOLEEMPTY;
                    let jumpRight = (holes[i][j+1] === HOLESELECTED || holes[i][j+1] === HOLEBALL)
                        && holes[i][j-1] === HOLEEMPTY;

                    if(jumpLeft || jumpRight) {
                        isOver = false;
                    }
                }
            }
        }

        if(isOver) {
            return (ballCount === 1);
        } else {
            return null;
        }
    }

    // Update the last entry in history
    updateHoles(newholes) {
        const history = this.state.history
        this.setState({
            history: history.slice(0,history.length-1).concat([{
                holes: newholes,
            }]),
            stepNumber: history.length-1,
        });
    }

    // Append this to the history as a new move
    // Moves are saved with the ball that moved selected, so you
    // can see what happened when you re-examine.
    registerMove(newholes) {
        const history = this.state.history
        this.setState({
            history: history.slice(0,history.length).concat([{
                holes: newholes,
            }]),
            stepNumber: history.length,
        });
    }
    
    handleClick(i,j) {
        if(this.state.stepNumber !== this.state.history.length-1) {
            return;
        }
        if(null !== this.checkWin(this.state.history[this.state.history.length-1].holes)) {
            return;
        }
        const holes = this.cloneLatestHoles();

        if(holes[i][j] === HOLENULL) {
            return;
        }

        if(holes[i][j] === HOLEEMPTY) {
            // If hole is empty, check if selected hole can legally jump here
            var movedholes = null;
            if(i+2<holes.length && holes[i+2][j] === HOLESELECTED
                    && holes[i+1][j] === HOLEBALL) {
                movedholes = this.makeMove(i+2,j,i,j);
            } else if(j+2<holes.length && holes[i][j+2] === HOLESELECTED
                    && holes[i][j+1] === HOLEBALL) {
                movedholes = this.makeMove(i,j+2,i,j);
            } else if(i-2>=0 && holes[i-2][j] === HOLESELECTED
                    && holes[i-1][j] === HOLEBALL) {
                movedholes = this.makeMove(i-2,j,i,j);
            } else if(j-2>=0 && holes[i][j-2] === HOLESELECTED
                    && holes[i][j-1] === HOLEBALL) {
                movedholes = this.makeMove(i,j-2,i,j);
            }
            if(movedholes) {
                this.registerMove(movedholes);
            }
            return;
        }

        var newholes = this.cloneLatestHoles();
        if(holes[i][j] === HOLESELECTED) {
            // Unselect selected hole
            newholes[i][j] = HOLEBALL;
        } else {
            // Select unselected hole and unselect all others
            for(let i=0; i<holes.length; i++) {
                for(let j=0; j<holes.length; j++) {
                    if(holes[i][j] === HOLESELECTED) {
                        newholes[i][j] = HOLEBALL;
                    }
                }
            }
            newholes[i][j] = HOLESELECTED;
        }

        this.updateHoles(newholes);
    }

    render() {
        const history = this.state.history
        const current = history[this.state.stepNumber]
        const holes = current.holes;

        const forward_step = Math.min(this.state.stepNumber+1, this.state.history.length-1);
        const backward_step = Math.max(0, this.state.stepNumber-1);

        // Check winner regardless of wayback machine status.
        var status = this.checkWin(history[history.length-1].holes);

        var message = "Jump one peg over another to remove it. Diagonal jumps are not allowed. Try to leave only one peg!";
        var messageClass = "";
        if(status === false) {
            message = "No moves left! Try again.";
            messageClass = "gameover";
        } else if(status) {
            message = "You win!";
            messageClass = "gameover";
        }


        return ([
            <Board holes={holes} onClick={(i,j) => this.handleClick(i,j)}/>,
            <div id="move-control">
                <button id="move-back" onClick={() => this.jumpTo(backward_step)}>
                    &lt; 1 move
                </button>
                <button
                    id="move-forward"
                    onClick={() => this.jumpTo(forward_step)}
                >
                    1 move &gt;
                </button>
                <button
                    id="move-current"
                    onClick={() => this.jumpTo(this.state.history.length-1)}
                >
                    Current move
                </button>
            </div>,
            <div id='messages' className={messageClass}>
                {message}
            </div>

        ]);
    }
}

class Board extends Component {
    renderHole(i,j) {
        const holestate = this.props.holes[i][j];

        return (
            <Hole
                key={[i,j]}
                state={holestate}
                onClick={() => this.props.onClick(i,j)}
            />
        );
    }

    render() {
        const N = this.props.holes.length;

        var rows = []
        for(let i=0; i<N; i++) {
            var holes = []
            for(let j=0; j<N; j++) {

                holes.push(
                    this.renderHole(i,j)
                );
            }
            rows.push(
                <div className="board-row">{holes}</div>
            );

        }
        return (
            <div id="game-board">{rows}</div>
        );
    }
}

function Hole(props) {
    var className = "hole";
    if(props.state === HOLENULL) {
        className += " null";
    } else if(props.state === HOLEBALL) {
        className += " ball";
    } else if(props.state === HOLESELECTED) {
        className += " ball selected";
    }

    return (
        <button className={className} onClick={() => props.onClick()}>
        </button>
    );
}

export default App;
