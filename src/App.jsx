import { useState, Component } from 'react'
import {DragDropProvider, useDroppable} from '@dnd-kit/react';
import {useSortable} from "@dnd-kit/react/sortable";
import {move} from '@dnd-kit/helpers';
import {CollisionPriority} from '@dnd-kit/abstract';
import crusher from './assets/crusher.png'
import floor from './assets/floor.png'
import repair from './assets/repair.png'
import repair_2x from './assets/repair_2x.png'
import roller from './assets/roller.png'
import roller_2x from './assets/roller_2x.png'
import roller_2x_right from './assets/roller_2x_right.png'
import roller_2x_left from './assets/roller_2x_left.png'
import roller_left from './assets/roller_left.png'
import roller_right from './assets/roller_right.png'
import void_ from './assets/void.png'
import wall from './assets/wall.png'
import robot from './assets/robot.jpg'
import gear_left from './assets/gear_left.png'
import gear_right from './assets/gear_right.png'
import laser from './assets/laser.png'
import './App.css'
import { map } from "./map.jsx"

const flag = "flag";

const width = 12;
const height = 12;


function get_texture(num) {
    switch (num) {
        case 0:
            return floor;
        case 1:
            return repair;
        case 2:
            return repair_2x;
        case 3:
            return flag;
        case 4:
            return void_;
        case 5:
            return crusher;
        case 6:
            return roller;
        case 7:
            return roller_left;
        case 8:
            return roller_right;
        case 9:
            return roller_2x;
        case 10:
            return roller_2x_left;
        case 11:
            return roller_2x_right;
        case 12:
            return gear_left;
        case 13:
            return gear_right;
    }
}

function texture_from_coords(x, y) {
    return get_texture(map[y][x][0]);
}

function rot_from_coords(x, y) {
    switch (map[y][x][1]) {
        case 0:
            return "rot0";
        case 1:
            return "rot90";
        case 2:
            return "rot180";
        case 3:
            return "rot270";
    }
}

function get_wall(x, y) {
    let w = "000" + String(map[y][x][2]);
    w = w.slice(-4);
    return w;
}

function coordinates(key) {
    let x = key%width;
    let y = Math.floor(key/height);
    return [x, y];
}

function get_key(x, y) {
    return y*height + x;
}

function wall_(x, y) {
    let w = "000" + String(map[y][x][2]);
    w = w.slice(-4);
    const a = []
    let i = 0
    for (let c of w) {
        if (c === "1") {
            a.push(
                <div key={i} className={"wall-div " + "wall" + i}>
                    <img className={"wall"} src={wall}></img>
                </div>
            );
        }
        i++
    }

    return a
}

function cell(key) {
    let [x, y] = coordinates(key);
    return (
        <div key={key} className={"cell rot0"}>
            {wall_(x, y)}
            <img className={"texture " + rot_from_coords(x, y)} src={texture_from_coords(x, y)} alt={key} title={x + ", " + y + " (" + key + ")"}></img>
        </div>
    )
}

function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

var self;
class Robot extends Component {
    constructor() {
        super();
        this.state = {x: 2, y: 4, rotation: 0};
        self = this;

        document.addEventListener("move", this.handle_event);
        document.addEventListener("express_conveyor", this.express_conveyor);
        document.addEventListener("conveyor", this.conveyor);
        document.addEventListener("gear", this.gear);
        document.addEventListener("crusher", this.crusher);
    }
    async express_conveyor() {
        let current_cell = map[self.state.y][self.state.x];
        let t = current_cell[0];
        if (t === 9 || t === 10 || t === 11) {
            self.move_(1, (current_cell[1] + 2)%4);
        }
        await sleep(100)
        current_cell = map[self.state.y][self.state.x];
        t = current_cell[0];
        if (t === 10) {
            self.rotate(3);
        } else if (t === 11) {
            self.rotate(1);
        }
    }
    async conveyor() {
        let current_cell = map[self.state.y][self.state.x];
        let t = current_cell[0];
        if (t === 9 || t === 10 || t === 11 || t === 6 || t === 7 || t === 8 || t === 5) {
            self.move_(1, (current_cell[1] + 2)%4);
        }
        await sleep(100)
        current_cell = map[self.state.y][self.state.x];
        t = current_cell[0];
        if (t === 10 || t === 7) {
            self.rotate(3);
        } else if (t === 11 || t === 8) {
            self.rotate(1);
        }
    }
    gear() {
        let current_cell = map[self.state.y][self.state.x];
        let t = current_cell[0];
        if (t === 12) {
            self.rotate(3);
        } else if (t === 13) {
            self.rotate(1);
        }
    }
    crusher() {
        let current_cell = map[self.state.y][self.state.x];
        let t = current_cell[0];
        if (t === 5) {
            console.log("crushed");
        }
    }
    handle_event(event) {
        let action = event.detail.action;
        let modifier = event.detail.modifier;
        let direction = event.detail.direction;
        if (action === "move") {
            self.move_(modifier, direction);
        } else if (action === "move1") {
            self.move_(1, direction);
        } else if (action === "move2") {
            self.move_(2, direction);
        } else if (action === "move3") {
            self.move_(3, direction);
        } else if (action === "backup") {
            self.move_(-modifier);
        } else if (action === "turn_left") {
            self.rotate(3);
        } else if (action === "turn_right") {
            self.rotate(1);
        } else if (action === "u_turn") {
            self.rotate(2);
        }
    }
    move_(distance, rotation = null) {
        let x = this.state.x;
        let y = this.state.y;
        rotation = rotation === null ? this.state.rotation : rotation;
        let is_void = false;

        if (rotation === 0) {
            y += distance;
        } else if (rotation === 1) {
            x -= distance;
        } else if (rotation === 2) {
            y -= distance;
        } else if (rotation === 3) {
            x += distance;
        }
        x = clamp(x, 0, width - 1);
        y = clamp(y, 0, height - 1);

        [distance, is_void] = this.check_walls(x, y, this.state.x, this.state.y, distance);
        x = this.state.x;
        y = this.state.y;

        if (rotation === 0) {
            y += distance;
        } else if (rotation === 1) {
            x -= distance;
        } else if (rotation === 2) {
            y -= distance;
        } else if (rotation === 3) {
            x += distance;
        }
        x = clamp(x, 0, width - 1);
        y = clamp(y, 0, height - 1);

        if (is_void) {
            console.log("void");
        }

        this.setState({x: x, y: y});
    }
    check_walls(x, y, ox, oy, distance) {
        const walls = [];
        let voids = [];
        let collisions = [];
        let distance_ = 0;
        if (x !== ox) {
            for (let i = Math.min(x, ox); i <= Math.max(x, ox); i++) {
                let wall = get_wall(i, y);
                walls.push(wall);
                let current_cell = map[y][i];
                if (current_cell[0] === 4) {
                    voids.push(1);
                } else {
                    voids.push(0);
                }

            }

            for (let wall of walls) {
                collisions.push(wall[0]);
                collisions.push(wall[2]);
            }
            if (x < ox) {
                collisions.reverse();
                voids.reverse();
            }
        } else if (y !== oy) {
            for (let i = Math.min(y, oy); i <= Math.max(y, oy); i++) {
                let wall = get_wall(x, i);
                walls.push(wall);
                let current_cell = map[i][x];
                if (current_cell[0] === 4) {
                    voids.push(1);
                } else {
                    voids.push(0);
                }
            }

            for (let wall of walls) {
                collisions.push(wall[1]);
                collisions.push(wall[3]);
            }
            if (y < oy) {
                collisions.reverse();
                voids.reverse();
            }
        }

        collisions = collisions.slice(1, -1)
        for (let i = 0; i < collisions.length; i += 2) {
            if (collisions[i] === "1" || collisions[i + 1] === "1") {
                break;
            } else {
                distance_ += 1;
            }
        }

        let void_distance = 0;
        for (let v of voids) {
            if (v === 1) {
                break
            } else {
                void_distance += 1;
            }
        }

        let is_void = false;
        if (void_distance <= distance_ && voids.includes(1)) {
            distance_ = void_distance;
            is_void = true;
        }

        if (distance < 0) {
            distance_ = -distance_;
        }
        return [distance_, is_void];
    }
    rotate(amount) {
        this.setState({rotation: (this.state.rotation + amount)%4});
    }
    render() {
        return <img
            className={"robot-img rot" + this.state.rotation*90%360}
            src={robot}
            onClick={() => {this.move(1)}}
            alt="robot"
            style={{"--x-position": this.state.x, "--y-position": this.state.y}}
            title={"" + this.state.x + ", " + this.state.y + ", " + this.state.rotation}
        />
    }
}

function Card({id, index, column, type}) {
  const {ref, isDragging} = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column
  });

  let text = "";
    let priority = 720;
    if (type === "move1") {
        text = "Move 1";
    } else if (type === "move2") {
        text = "Move 2";
    } else if (type === "move3") {
        text = "Move 3";
    } else if (type === "backup") {
        text = "Backup";
    } else if (type === "turn_left") {
        text = "Turn left";
    } else if (type === "turn_right") {
        text = "Turn right";
    } else if (type === "u_turn") {
        text = "U-turn";
    }
    return <div className="card" ref={ref} data-dragging={isDragging}>
        <a>{priority}</a>
        <img src={roller} alt="roller" draggable="false" />
        <h4>{text}</h4>
    </div>
}

function Column({children, id}) {
  const {isDropTarget, ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
  const style = isDropTarget ? {background: '#00000030'} : undefined;

  return (
    <div className="Column" ref={ref} style={style}>
      {children}
    </div>
  );
}

function send_move(action, modifier = 1, direction = null) {
    document.dispatchEvent(new CustomEvent('move', {detail: {action: action, modifier: modifier, direction: direction}}));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function active_board_elements(items, cards) {
    for (let card of items["A"]) {
        console.log("activate card");
        send_move(cards[card]);

        await sleep(200);

        console.log("activate_board_elements");
        //express conveyor belts
        document.dispatchEvent(new CustomEvent('express_conveyor'));
        //slow and express conveyor belts
        await sleep(200);
        document.dispatchEvent(new CustomEvent('conveyor'));
        //pushers push if active
        //gears rotate 90 degrees
        await sleep(200);
        document.dispatchEvent(new CustomEvent('gear'));
        //board lasers
        //crushers activate, destroying robot
        await sleep(200);
        document.dispatchEvent(new CustomEvent('crusher'));

        await sleep(1000);
    }
}

function App() {
    let cards = ["move1", "move2", "move3", "turn_left", "turn_right", "u_turn", "backup", "turn_left", "move1"];
    const [items, setItems] = useState({
        A: [],
        B: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    });

    return (
        <>
            <div className="grid" style={{"--grid-columns": width}}>
                {Array.from(Array(width*height).keys().map(cell))}
                <Robot></Robot>
            </div>
            <div className="ui">
                <DragDropProvider
                  onDragOver={(event) => {
                    setItems((items) => move(items, event));
                  }}
                >
                    {Object.entries(items).map(([column, items]) => (
                      <Column key={column} id={column}>
                        {items.map((id, index) => (
                          <Card key={id} id={id} index={index} column={column} type={cards[id]} />
                        ))}
                      </Column>
                    ))}
                </DragDropProvider>
                <div className="run-div">
                    <button className="btn" onClick={() => {active_board_elements(items, cards)}}>Run</button>
                </div>
            </div>
        </>
    )
}

export default App
