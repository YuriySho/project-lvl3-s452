export default class JumbotronRSS {
    constructor(element) {
        this.element = element;
    }

    init() {
        const point = document.getElementById('point');
        point.append(this.element);
    }
}