import {useRef, useState} from 'react'
import './App.css'
import {Deck} from "./cards.jsx"
import {Robot} from "./robots.jsx"
import {sleep} from "./common.jsx";
import {CardsManager} from "./cards.jsx"
import {Grid, width} from "./map.jsx"

async function do_turn(cards_refs, robot_refs, set_phase) {
    for (let phase = 0; phase < 5; phase++) {
        set_phase(phase + 1);
        const cards = [];
        // get all cards for this phase
        for (let robot = 0; robot < robot_refs.length; robot++) {
            cards.push({"robot": robot_refs[robot].current, "card": cards_refs[robot].current.get_card(phase)});
        }

        // sort the cards based on priority
        cards.sort((a, b) => {return b.card?.priority - a.card?.priority;});

        for (let obj of cards) {
            obj.robot.handle_card(obj.card?.action);
            await sleep(500);
        }

        await sleep(200);

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

        //robot lasers
        for (let robot of robot_refs) {
            robot.current.resolv_laser();
        }
        await sleep(1000);
        for (let robot of robot_refs) {
            robot.current.setState({...robot.current.state, show_laser: false});
        }

        await sleep(200);
        //crushers activate, destroying robot
        for (let ref of robot_refs) {
            ref.current.crusher(phase);
        }

        //touch checkpoint
        for (let robot of robot_refs) {
            robot.current.touch_checkpoint();
        }

        await sleep(1000);
    }

    // end of turn effects
    for (let i = 0; i < robot_refs.length; i++) {
        robot_refs[i].current.repair(cards_refs[i].current);
    }

    await sleep(200);

    set_phase(0);

    // Give each player a new hand of programming cards
    for (let card of cards_refs) {
        card.current.new_hand();
    }
}

function App() {
    const deck = new Deck();
    const robot_ids = [0, 1];
    const robot_refs = robot_ids.map((id) => {return useRef(null)});
    const cards_refs = robot_ids.map((id) => {return useRef(null)});
    const [phase, set_phase] = useState(0);
    const [current_player, set_current_player] = useState(0);

    return (
        <>
            <div className="grid" style={{"--grid-columns": width}}>
                <Grid></Grid>
                {robot_ids.map((id) => (
                    <Robot id={id} key={id} ref={robot_refs[id]} robot_refs={robot_refs} card_ref={cards_refs[id]} />
                ))}
            </div>
            <div className="ui">
                {phase !== 0? <h1 className="background-blur">Phase {phase}</h1>: <h1 className="background-blur">Programming Phase</h1>}
                {robot_ids.map((id) => {
                    return <div key={id}>
                        <button className="btn" onClick={() => {set_current_player(id)}} style={{marginBottom: "7px"}}>Player {id + 1} </button>
                        <div style={current_player !== id?{display: 'none'}: {}} key={id}>
                            <CardsManager key={id} ref={cards_refs[id]} deck={deck} robot={robot_refs[id]} id={id} />
                        </div>
                    </div>
                })}
                <button className="btn btn-start" onClick={() => {do_turn(cards_refs, robot_refs, set_phase)}}>Start Turn</button>
            </div>
        </>
    )
}

export default App
