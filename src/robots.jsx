import {Component} from "react";
import {map} from "./map.jsx";
import robot from "./assets/robot.png";
import {sleep, clamp, colors} from "./common.jsx";
import {width, height, get_wall} from "./map.jsx"
import laser from "./assets/laser.png";

export class Robot extends Component {
    constructor({id, x=0, y=2, rotation=3, robot_refs, card_ref}) {
        super();
        this.state = {x: x, y: y, rotation: rotation, visual_rotation: rotation*90, hit_x: null, hit_y: null, show_laser: false, spawn_x: x, spawn_y: y, checkpoint: 1};
        this.id = id;
        this.robot_refs = robot_refs;
        this.card_ref = card_ref;
    }
    respawn() {
        this.setState({...this.state, x: this.state.spawn_x, y: this.state.spawn_y});
        this.card_ref.current.remove_life();
    }
    touch_checkpoint() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        const options = {}
        if (t === 1 || t === 2 || t === 14) {
        } else if (t === 15) {
            if (this.state.checkpoint === 1) {
                options["checkpoint"] = 2
            }
        } else if (t === 16) {
            if (this.state.checkpoint === 2) {
                options["checkpoint"] = 3
            }
        } else {
            return;
        }
        this.setState({...this.state, ...options, spawn_x: this.state.x, spawn_y: this.state.y});
    }
    async express_conveyor() {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 9 || t === 10 || t === 11) {
            this.move_(1, (current_cell[1] + 2)%4, true);
        }
        await sleep(100);
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
            this.move_(1, (current_cell[1] + 2)%4, true);
        }
        await sleep(100);
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
    crusher(phase) {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 5) {
            if (phase === 2 || phase === 4) {
                console.log("crushed");
                this.respawn();
                this.card_ref.current.set_health(7);
            }
        }
    }
    repair(card) {
        let current_cell = map[this.state.y][this.state.x];
        let t = current_cell[0];
        if (t === 1 || t === 14 || t === 15 || t === 16) {
            card.heal(1);
        } else if (t === 2) {
            card.heal(2);
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
    move_(distance, rotation = null, skip_collision = false) {
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

        if (!skip_collision) {
            distance = this.check_collision(x, y, this.state.x, this.state.y, distance);

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
        }

        if (is_void) {
            console.log("void");
            this.respawn();
            this.card_ref.current.set_health(7);
        } else {
            this.setState({x: x, y: y});
        }
        return distance;
    }
    check_collision(x, y, ox, oy, distance) {
        let collisions = [];
        let index = 0;
        if (x !== ox) {
            for (let i = Math.min(x, ox); i <= Math.max(x, ox); i++) {
                collisions.push([]);
                for (let robot of this.robot_refs) {
                    if (robot.current.state.x === i && robot.current.state.y === y) {
                        collisions[index].push(robot);
                    }
                }
                index += 1;
            }

            if (x < ox) {
                collisions.reverse();
            }

        } else if (y !== oy) {
            for (let i = Math.min(y, oy); i <= Math.max(y, oy); i++) {
                collisions.push([]);
                for (let robot of this.robot_refs) {
                    if (robot.current.state.x === x && robot.current.state.y === i) {
                        collisions[index].push(robot);
                    }
                }
                index += 1;
            }

            if (y < oy) {
                collisions.reverse();
            }
        }

        collisions = collisions.slice(1);

        index = 0;
        let dis = distance;
        for (let col of collisions) {
            for (let rob of col) {
                dis = rob.current.move_(distance - index, this.state.rotation, true);
                dis = index + dis;
            }
            index += 1;
        }
        return dis;
    }
    check_walls(x, y, ox, oy, distance, check_voids=true) {
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
        if (void_distance <= distance_ && voids.includes(1) && check_voids) {
            distance_ = void_distance;
            is_void = true;
        }

        if (distance < 0) {
            distance_ = -distance_;
        }
        return [distance_, is_void];
    }
    rotate(amount) {
        this.setState({rotation: (this.state.rotation + amount)%4, visual_rotation: this.state.visual_rotation + 90*amount});
    }
    resolv_laser(rotation=null) {
        let distance = width;
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

        [distance, is_void] = this.check_walls(x, y, this.state.x, this.state.y, distance, false);
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

        let did_collide = this.check_laser(x, y, this.state.x, this.state.y);
        if (!did_collide) {
            this.setState({...this.state, hit_x: x, hit_y: y, show_laser: true});
        }
    }
    check_laser(x, y, ox, oy) {
        let collisions = [];
        let index = 0;
        if (x !== ox) {
            for (let i = Math.min(x, ox); i <= Math.max(x, ox); i++) {
                collisions.push([]);
                for (let robot of this.robot_refs) {
                    if (robot.current.state.x === i && robot.current.state.y === y) {
                        collisions[index].push(robot);
                    }
                }
                index += 1;
            }

            if (x < ox) {
                collisions.reverse();
            }

        } else if (y !== oy) {
            for (let i = Math.min(y, oy); i <= Math.max(y, oy); i++) {
                collisions.push([]);
                for (let robot of this.robot_refs) {
                    if (robot.current.state.x === x && robot.current.state.y === i) {
                        collisions[index].push(robot);
                    }
                }
                index += 1;
            }

            if (y < oy) {
                collisions.reverse();
            }
        }

        collisions = collisions.slice(1);

        let did_collide = false;
        for (let col of collisions) {
            if (col.length !== 0) {
                for (let rob of col) {
                    rob.current.card_ref.current.damage(1);
                    this.setState({...this.state, hit_x:rob.current.state.x, hit_y:rob.current.state.y, show_laser:true});
                    did_collide = true;
                }
            }
        }
        return did_collide;
    }
    render() {
        return <>
            <img
                className={"robot-img " + colors[this.id] + "-border"}
                src={robot}
                onClick={() => {this.move(1)}}
                alt="robot"
                style={{"--x-position": this.state.x, "--y-position": this.state.y, transform: 'rotate(' + this.state.visual_rotation + 'deg)'}}
                title={"" + this.state.checkpoint + ", " + this.state.spawn_x + ", " + this.state.spawn_y}
            />
            <img
                className={"robot-laser " + (this.state.show_laser ? "": "hidden") + " rot" + this.state.rotation*90%360}
                src={laser}
                alt="laser"
                style={{"--x-position": this.state.x, "--y-position": this.state.y, "--hit-x": this.state.hit_x, "--hit-y": this.state.hit_y}}
            />
        </>
    }
}
