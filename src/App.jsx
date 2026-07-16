import {useState, Component, useRef, useImperativeHandle} from 'react'
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
import robot from './assets/robot.png'
import gear_left from './assets/gear_left.png'
import gear_right from './assets/gear_right.png'
import laser from './assets/laser.png'
import './App.css'
import { map } from "./map.jsx"
import { Deck } from "./cards.jsx"

const flag = "flag";

const width = 12;
const height = 12;


function random_choice(a) {
    let i = Math.floor(Math.random() * a.length);
    return a[i];
}

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

class Robot extends Component {
    constructor({id, x=2, y=4, rotation=0}) {
        super();
        this.state = {x: x, y: y, rotation: rotation};
        this.id = id;
    }
    async express_conveyor() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 9 || t === 10 || t === 11) {
            this.move_(1, (current_cell[1] + 2)%4);
        }
        await sleep(100)
        current_cell = map[this.state.y][this.state.x];
        t = current_cell[0];
        if (t === 10) {
            this.rotate(3);
        } else if (t === 11) {
            this.rotate(1);
        }
    }
    async conveyor() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 9 || t === 10 || t === 11 || t === 6 || t === 7 || t === 8 || t === 5) {
            this.move_(1, (current_cell[1] + 2)%4);
        }
        await sleep(100)
        current_cell = map[this.state.y][this.state.x];
        t = current_cell[0];
        if (t === 10 || t === 7) {
            this.rotate(3);
        } else if (t === 11 || t === 8) {
            this.rotate(1);
        }
    }
    gear() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 12) {
            this.rotate(3);
        } else if (t === 13) {
            this.rotate(1);
        }
    }
    crusher() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 5) {
            console.log("crushed");
        }
    }
    handle_card(action) {
        if (action === "move1") {
            this.move_(1);
        } else if (action === "move2") {
            this.move_(2);
        } else if (action === "move3") {
            this.move_(3);
        } else if (action === "backup") {
            this.move_(-1);
        } else if (action === "turn_left") {
            this.rotate(3);
        } else if (action === "turn_right") {
            this.rotate(1);
        } else if (action === "u_turn") {
            this.rotate(2);
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

function ArrowRight() {
    return <div className="outer card-arrow-right-outer">
        <div className="card-arrow-right">
            <div>
                <div className="arrow-spacer"></div>
                <div className="arrow-right"></div>
            </div>
            <div className="head arrow-head"></div>
        </div>
    </div>
}

function ArrowLeft() {
    return <div className="outer card-arrow-left-outer">
        <div className="card-arrow-left">
            <div className="head arrow-head"></div>
            <div>
                <div className="arrow-spacer"></div>
                <div className="arrow-left"></div>
            </div>
        </div>
    </div>
}

function ArrowU() {
    return <div className="outer card-arrow-u-outer">
        <div className="card-arrow-u">
            <div className="arrow-right"></div>
            <div className="arrow-left"></div>
            <div className="head arrow-head"></div>
        </div>
    </div>
}

function ArrowUp() {
    return <div className="outer card-arrow-up-outer">
        <div className="card-arrow-up">
            <div className="head arrow-head"></div>
            <div className="arrow-up"></div>
        </div>
    </div>
}

function ArrowDown() {
    return <div className="outer card-arrow-down-outer">
        <div className="card-arrow-down">
            <div className="arrow-up"></div>
            <div className="head arrow-head"></div>
        </div>
    </div>
}

function Card({id, index, column, card}) {
    const {ref, isDragging} = useSortable({
        id,
        index,
        type: 'item',
        accept: 'item',
        group: column
    });

    let type = card.action;
    let text = "";
    let priority = card.priority;
    let arrow = <ArrowUp></ArrowUp>
    if (type === "move1") {
        text = "Move 1";
    } else if (type === "move2") {
        text = "Move 2";
    } else if (type === "move3") {
        text = "Move 3";
    } else if (type === "backup") {
        text = "Backup";
        arrow = <ArrowDown></ArrowDown>
    } else if (type === "turn_left") {
        text = "Turn left";
        arrow = <ArrowLeft></ArrowLeft>
    } else if (type === "turn_right") {
        text = "Turn right";
        arrow = <ArrowRight></ArrowRight>
    } else if (type === "u_turn") {
        text = "U-turn";
        arrow = <ArrowU></ArrowU>
    }
    return <div className="card" ref={ref} data-dragging={isDragging}>
        <a>{priority}</a>
        {arrow}
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
    <div className="column" ref={ref} style={style}>
      {children}
    </div>
  );
}

function CardsManager({ref, deck}) {
    let number_of_cards = 9;
    let ids = Array.from(Array(number_of_cards).keys());
    const [cards, setCards] = useState(deck.get_hand(number_of_cards));
    const [items, setItems] = useState({
        A: [],
        B: ids,
    });

    useImperativeHandle(ref, () => {
        return {
            get_action(index) {
                let card = items["A"][index];
                return cards[card]?.action;
            }
        };
    }, [items, cards]);

    return <DragDropProvider
        onDragOver={(event) => {
            setItems((items) => move(items, event));
        }}
    >
        {Object.entries(items).map(([column, items]) => (
            <Column key={column} id={column}>
                {items.map((id, index) => (
                    <Card key={id} id={id} index={index} column={column} card={cards[id]} />
                ))}
            </Column>
        ))}
    </DragDropProvider>
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function active_board_elements(cards_refs, robot_refs) {
    for (let phase = 0; phase < 5; phase++) {
        console.log("activate card");
        for (let robot = 0; robot < cards_refs.length; robot++) {
            robot_refs[robot].current.handle_card(cards_refs[robot].current.get_action(phase));
        }

        await sleep(200);

        console.log("activate_board_elements");
        //express conveyor belts
        for (let ref of robot_refs) {
            ref.current.express_conveyor();
        }
        //slow and express conveyor belts
        await sleep(200);
        for (let ref of robot_refs) {
            ref.current.conveyor();
        }
        //pushers push if active

        //gears rotate 90 degrees
        await sleep(200);
        for (let ref of robot_refs) {
            ref.current.gear();
        }
        //board lasers
        //crushers activate, destroying robot
        await sleep(200);
        for (let ref of robot_refs) {
            ref.current.crusher();
        }

        await sleep(1000);
    }
}

function App() {
    const deck = new Deck();
    const robot_ids = [0, 1];
    const robot_refs = robot_ids.map((id) => {return useRef(null)});
    const cards_refs = robot_ids.map((id) => {return useRef(null)});

    return (
        <>
            <div className="grid" style={{"--grid-columns": width}}>
                {Array.from(Array(width*height).keys().map(cell))}
                {robot_ids.map((id) => (
                    <Robot id={id} key={id} ref={robot_refs[id]} />
                ))}
            </div>
            <div className="ui">
                {robot_ids.map((id) => {
                    return <CardsManager key={id} ref={cards_refs[id]} deck={deck} />
                })}
                <div className="run-div">
                    <button className="btn" onClick={() => {active_board_elements(cards_refs, robot_refs)}}>Start Turn</button>
                </div>
            </div>
        </>
    )
}

export default App
