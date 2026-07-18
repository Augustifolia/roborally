import {useSortable} from "@dnd-kit/react/sortable";
import {DragDropProvider, useDroppable} from "@dnd-kit/react";
import {CollisionPriority} from "@dnd-kit/abstract";
import {useImperativeHandle, useState} from "react";
import {move} from "@dnd-kit/helpers";
import {clamp} from "./common.jsx";

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

export function CardsManager({ref, deck}) {
    const [number_of_cards, setNumber_of_cards] = useState(9);
    let ids = Array.from(Array(number_of_cards).keys());
    const [cards, setCards] = useState(deck.get_hand(number_of_cards));
    const [items, setItems] = useState({
        A: [],
        B: ids,
    });

    useImperativeHandle(ref, () => {
        return {
            get_card(index) {
                let card = items["A"][index];
                return cards[card];
            },
            new_hand() {
                setCards(deck.get_hand(number_of_cards));
                setItems({A: [], B: ids});
            },
            damage(amount) {
                setNumber_of_cards(Math.max(number_of_cards - amount, 0));
            },
            heal(amount) {
                setNumber_of_cards(Math.min(number_of_cards + amount, 9));
            },
            set_health(amount) {
                setNumber_of_cards(clamp(amount, 0, 9));
            }
        };
    }, [items, cards, number_of_cards]);

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
        <p>{"Damage taken: " + (9 - number_of_cards)}</p>
    </DragDropProvider>
}

export class Deck {
    constructor() {
        this.counter = 0;
        this.deck = [
            {action: "turn_right", priority: 110},
            {action: "turn_right", priority: 120},
            {action: "turn_right", priority: 130},
            {action: "turn_right", priority: 140},
            {action: "turn_right", priority: 150},
            {action: "turn_right", priority: 160},
            {action: "turn_right", priority: 170},
            {action: "turn_left", priority: 210},
            {action: "turn_left", priority: 220},
            {action: "turn_left", priority: 230},
            {action: "turn_left", priority: 240},
            {action: "turn_left", priority: 250},
            {action: "turn_left", priority: 260},
            {action: "turn_left", priority: 270},
            {action: "u_turn", priority: 310},
            {action: "u_turn", priority: 320},
            {action: "u_turn", priority: 330},
            {action: "u_turn", priority: 340},
            {action: "u_turn", priority: 350},
            {action: "u_turn", priority: 360},
            {action: "u_turn", priority: 370},
            {action: "backup", priority: 410},
            {action: "backup", priority: 420},
            {action: "backup", priority: 430},
            {action: "backup", priority: 440},
            {action: "backup", priority: 450},
            {action: "backup", priority: 460},
            {action: "move1", priority: 510},
            {action: "move1", priority: 520},
            {action: "move1", priority: 530},
            {action: "move1", priority: 540},
            {action: "move1", priority: 550},
            {action: "move1", priority: 560},
            {action: "move1", priority: 570},
            {action: "move1", priority: 580},
            {action: "move1", priority: 590},
            {action: "move2", priority: 610},
            {action: "move2", priority: 620},
            {action: "move2", priority: 630},
            {action: "move2", priority: 640},
            {action: "move2", priority: 650},
            {action: "move2", priority: 660},
            {action: "move2", priority: 670},
            {action: "move2", priority: 680},
            {action: "move3", priority: 710},
            {action: "move3", priority: 720},
            {action: "move3", priority: 730},
            {action: "move3", priority: 740},
            {action: "move3", priority: 750},
            {action: "move3", priority: 760},
            {action: "move3", priority: 770},
            {action: "move3", priority: 780},
            {action: "move3", priority: 790},
        ]
        this.shuffle();
    }

    shuffle() {
        let array = this.deck;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
	    this.deck = array;
    }

    next() {
        if (this.counter >= this.deck.length) {
            this.counter = 0;
        }
        let card = this.deck[this.counter];
        this.counter += 1;
        return card;
    }

    get_hand(number_of_cards) {
        return Array.from(Array(number_of_cards).keys().map(() => this.next()));
    }
}
