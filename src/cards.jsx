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
        if (this.counter > this.deck.length) {
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
