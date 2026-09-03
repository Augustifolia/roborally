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
import gear_left from './assets/gear_left.png'
import gear_right from './assets/gear_right.png'
import laser from './assets/laser.png'
import flag1 from './assets/flag1.jpg'
import flag2 from './assets/flag2.jpg'
import flag3 from './assets/flag3.jpg'

export const width = 12;
export const height = 12;

export function get_wall(x, y) {
    let w = "000" + String(map[y][x][2]);
    w = w.slice(-4);
    return w;
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
            return;
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
        case 14:
            return flag1;
        case 15:
            return flag2;
        case 16:
            return flag3;
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

export function Grid() {
    return <>
        {Array.from(Array(width*height).keys().map(cell))}
    </>
}

// map of cells, each cell has texture, rotation and wall placement
export const map = [
[[2, 0, 0], [6, 2, 0], [7, 2, 0], [6, 3, 0], [6, 3, 0], [8, 3, 0], [9, 0, 0], [16, 0, 100], [0, 0, 0], [0, 0, 1100], [6, 0, 0], [4, 0, 0]],
[[6, 3, 0], [0, 0, 1000], [6, 2, 0], [1, 0, 1110], [11, 1, 0], [9, 1, 100], [10, 0, 0], [0, 0, 1001], [0, 0, 1], [0, 0, 0], [8, 0, 0], [6, 3, 0]],
[[14, 0, 1000], [5, 0, 0], [6, 2, 0], [0, 0, 1000], [9, 0, 0], [0, 0, 1001], [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 1], [0, 0, 0], [0, 0, 101]],
[[0, 0, 10], [6, 0, 0], [5, 2, 0], [0, 0, 10], [9, 0, 0], [10, 2, 0], [9, 3, 0], [9, 3, 0], [9, 3, 0], [10, 3, 0], [0, 0, 1000], [0, 0, 0]],
[[0, 0, 1010], [6, 0, 0], [6, 2, 0], [0, 0, 1010], [9, 0, 0], [9, 2, 0], [12, 0, 1100], [0, 0, 100], [13, 0, 110], [9, 0, 0], [0, 0, 1011], [13, 0, 11]],
[[0, 0, 11], [6, 0, 0], [8, 3, 0], [0, 0, 1010], [11, 0, 0], [11, 3, 0], [0, 0, 1000], [2, 0, 0], [0, 0, 10], [11, 0, 0], [9, 3, 0], [9, 3, 0]],
[[6, 1, 0], [7, 0, 0], [0, 0, 1000], [0, 0, 0], [0, 0, 110], [0, 0, 100], [0, 0, 0], [0, 0, 1], [0, 0, 1], [6, 1, 0], [8, 2, 0], [8, 1, 0]],
[[0, 0, 100], [0, 0, 100], [0, 0, 10], [0, 0, 0], [0, 0, 10], [0, 0, 0], [0, 0, 10], [8, 1, 0], [6, 1, 0], [6, 1, 0], [6, 1, 0], [7, 0, 0]],
[[0, 0, 1010], [12, 0, 100], [0, 0, 1100], [0, 0, 10], [0, 0, 1], [0, 0, 0], [0, 0, 1], [8, 0, 0], [5, 3, 100], [6, 3, 100], [7, 3, 100], [12, 0, 1100]],
[[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 10], [12, 0, 0], [13, 0, 0], [8, 1, 1000], [6, 1, 0], [5, 1, 0], [6, 1, 100], [7, 0, 1], [0, 0, 1010]],
[[6, 1, 0], [8, 2, 0], [2, 0, 110], [0, 0, 0], [15, 0, 0], [0, 0, 100], [6, 0, 0], [0, 0, 1100], [0, 0, 100], [0, 0, 0], [8, 1, 0], [6, 1, 0]],
[[4, 0, 0], [6, 2, 0], [0, 0, 1], [0, 0, 0], [0, 0, 101], [0, 0, 110], [6, 0, 0], [0, 0, 1001], [0, 0, 0], [0, 0, 1], [6, 0, 0], [1, 0, 100]],
];
