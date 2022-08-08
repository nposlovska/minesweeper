(function () {
    const CLASSES = Object.freeze({
        CELL: 'cell',
        ROW: 'row',
        GRID: 'grid',
        BOMB: 'bomb',
        ERROR: 'error',
        ACTIVE: 'active',
        COUNTER: 'counter',
        RERENDER: 'rerender',
        CUSTOM_SIZE: 'custom_size',
        CUSTOM_MINE_COUNT: 'custom_mine_count'
    });

    function createProto(className) {
        let proto = document.createElement('div');
        proto.className = className;
        return proto;
    }

    function getIndex(element) {
        return [...element.parentElement.children].indexOf(element);
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    class Minesweeper {
        cells = [];

        constructor() {
            this.size = document.getElementById(CLASSES.CUSTOM_SIZE).value || 15;
            const maxBombCount = this.size * this.size;
            const bombCount = document.getElementById(CLASSES.CUSTOM_MINE_COUNT).value || 40;
            this.bombCount = this.remainedBomb = bombCount > maxBombCount ? maxBombCount : bombCount;

            this.gridDom = document.getElementById(CLASSES.GRID);
            this.countDom = document.getElementById(CLASSES.COUNTER);
            this.loadGrid();
        }

        loadGrid() {
            this.gridDom.innerHTML = '';
            this.countDom.textContent = this.remainedBomb;
            for (let y = 0; y < this.size; y++) {
                const rowDom = createProto(CLASSES.ROW);
                this.cells[y] = [];

                for (let x = 0; x < this.size; x++) {
                    const cellDom = createProto(CLASSES.CELL);
                    cellDom.classList.add(CLASSES.ACTIVE);
                    rowDom.append(cellDom);

                    this.cells[y][x] = {
                        isBomb: false,
                        isOpen: false,
                        isMarked: false, // marked as a bomb
                        dom: cellDom
                    };
                }
                this.gridDom.append(rowDom);
            }

            this.bindEvents();
            this.setBombs();
        }

        bindEvents() {
            this.gridDom.onmousedown = e => {
                if (e.target.classList.contains(CLASSES.CELL)) {
                    const cellDom = e.target;
                    const x = getIndex(cellDom);
                    const y = getIndex(cellDom.parentElement);

                    if (!e.button) { // left click
                        if (!this.cells[y][x].isMarked) {
                            this.checkCell(x, y);
                        }
                    } else { // right click
                        if (!this.cells[y][x].isOpen) {
                            this.markCell(x, y, cellDom);
                        }
                    }
                }
            };

            this.gridDom.oncontextmenu = () => false;
        }

        markCell(x, y, cellDom) { // toggle the mark
            if (this.cells[y][x].isMarked) {
                cellDom.classList.remove(CLASSES.BOMB);
                cellDom.textContent = '';
                this.cells[y][x].isMarked = false;
                this.remainedBomb++;
            } else {
                cellDom.classList.add(CLASSES.BOMB);
                cellDom.textContent = 'x';
                this.cells[y][x].isMarked = true;
                this.remainedBomb--;
            }

            this.countDom.textContent = this.remainedBomb;
            if (!this.remainedBomb) {
                this.checkWin();
            }
        }

        setBombs() {
            while (this.bombCount) {
                let x = getRandom(0, this.size);
                let y = getRandom(0, this.size);

                if (!this.cells[y][x].isBomb) {
                    this.cells[y][x].isBomb = true;
                    this.bombCount--;
                }
            }
        }

        checkWin() {
            for (let y = 0; y < this.cells.length; y++) {
                for (let x = 0; x < this.cells[y].length; x++) {
                    if (this.cells[y][x].isBomb !== this.cells[y][x].isMarked) {
                        return false;
                    }
                }
            }
            alert('you win!');
        }

        getNeighbors(x, y) {
            let neighbours = [];

            if (x > 0) {
                neighbours.push([x - 1, y]);
                this.pushYNeighbour(x - 1, y, neighbours);
            }

            if (x < this.size - 1) {
                neighbours.push([x + 1, y]);
                this.pushYNeighbour(x + 1, y, neighbours);
            }

            this.pushYNeighbour(x, y, neighbours);
            return neighbours;
        }

        pushYNeighbour(x, y, neighbours) {
            if (y > 0) {
                neighbours.push([x, y - 1]);
            }
            if (y < this.size - 1) {
                neighbours.push([x, y + 1]);
            }
        }

        getNeighborsMinesCount(neighbours) {
            let count = 0;
            neighbours.forEach(([x, y]) => {
                if (this.cells[y][x].isBomb) {
                    count++;
                }
            });
            return count;
        }

        checkCell(x, y) {
            if (this.cells[y][x].isBomb) {
                this.cells[y][x].dom.classList.add(CLASSES.ERROR);
                this.cells[y][x].dom.textContent = '*';
                alert('Game over');
                this.gridDom.onmousedown = () => false;
            } else {
                this.openCell(x, y);
            }
        }

        openCell(x, y) {
            const cellDom = this.cells[y][x].dom;
            cellDom.classList.remove(CLASSES.ACTIVE);
            this.cells[y][x].isOpen = true;

            const neighbours = this.getNeighbors(x, y);
            const count = this.getNeighborsMinesCount(neighbours);
            if (count) {
                cellDom.textContent = count;
            } else {
                cellDom.textContent = '';
                neighbours.forEach(([x, y]) => {
                    if (!this.cells[y][x].isOpen && !this.cells[y][x].isMarked) {
                        this.openCell(x, y);
                    }
                });
            }
        }
    }

    window.addEventListener('load', () => new Minesweeper(), false);
    document.getElementById(CLASSES.RERENDER).addEventListener('click', () => new Minesweeper(), false);
}());