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

    function Minesweeper() {
        this.size = document.getElementById(CLASSES.CUSTOM_SIZE).value || 15;

        const maxBombCount = this.size * this.size;
        const bombCount = document.getElementById(CLASSES.CUSTOM_MINE_COUNT).value || 40;
        this.countBomb = this.remainedBomb = bombCount > maxBombCount ? maxBombCount : bombCount;

        this.cells = [];
        this.grid = document.getElementById(CLASSES.GRID);
        this.countDiv = document.getElementById(CLASSES.COUNTER);
        this.grid.innerHTML = '';
        this.loadGrid();
    }

    Minesweeper.prototype.loadGrid = function () {
        this.countDiv.textContent = this.remainedBomb;
        for (let y = 0; y < this.size; y++) {
            const row = createProto(CLASSES.ROW);
            this.cells[y] = [];

            for (let x = 0; x < this.size; x++) {
                const cell = createProto(CLASSES.CELL);
                cell.classList.add(CLASSES.ACTIVE);
                row.append(cell);
                this.cells[y][x] = {
                    is_bomb: false,
                    is_open: false,
                    is_striked: false,
                    dom: cell
                };
            }
            this.grid.append(row);
        }
        this.bindEvents();
        this.setBombs();
    }

    Minesweeper.prototype.bindEvents = function () {
        this.grid.onmousedown = e => {
            if (e.target.classList.contains(CLASSES.CELL)) {
                const x = getIndex(e.target);
                const y = getIndex(e.target.parentElement);

                if (!e.button) {
                    if (!this.cells[y][x].is_striked) {
                        this.checkCell(x, y);
                    }
                } else {
                    if (!this.cells[y][x].is_open) {
                        if (this.cells[y][x].is_striked) {
                            e.target.classList.remove(CLASSES.BOMB);
                            e.target.textContent = '';
                            this.cells[y][x].is_striked = false;
                            this.remainedBomb++;
                        } else {
                            e.target.classList.add(CLASSES.BOMB);
                            e.target.textContent = 'x';
                            this.cells[y][x].is_striked = true;
                            this.remainedBomb--;
                        }
                        this.countDiv.textContent = this.remainedBomb;
                        if (!this.remainedBomb) {
                            this.checkWin();
                        }
                    }
                }
            }
        };

        this.grid.oncontextmenu = () => false;
    }

    Minesweeper.prototype.setBombs = function () {
        while (this.countBomb) {
            let x = getRandom(0, this.size);
            let y = getRandom(0, this.size);
            if (!this.cells[y][x].is_bomb) {
                this.cells[y][x].is_bomb = true;
                this.countBomb--;
            }
        }
    }

    Minesweeper.prototype.checkWin = function () {
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[y].length; x++) {
                if (this.cells[y][x].is_bomb !== this.cells[y][x].is_striked) {
                    return false;
                }
            }
        }
        alert('you win!');
    }

    Minesweeper.prototype.getNeighbors = function (x, y) {
        let nb = [];
        if (x > 0) {
            nb.push([x - 1, y]);
            if (y > 0) {
                nb.push([x - 1, y - 1]);
            }
            if (y < this.size - 1) {
                nb.push([x - 1, y + 1]);
            }
        }
        if (x < this.size - 1) {
            nb.push([x + 1, y]);
            if (y > 0) {
                nb.push([x + 1, y - 1]);
            }
            if (y < this.size - 1) {
                nb.push([x + 1, y + 1]);
            }
        }
        if (y > 0) {
            nb.push([x, y - 1]);
        }
        if (y < this.size - 1) {
            nb.push([x, y + 1]);
        }
        return nb;
    }
    Minesweeper.prototype.getNeighborsMinesCount = function (neighbours) {
        let count = 0;
        neighbours.forEach(([x, y]) => {
            if (this.cells[y][x].is_bomb) {
                count++;
            }
        });
        return count;
    }
    Minesweeper.prototype.checkCell = function (x, y) {
        if (this.cells[y][x].is_bomb) {
            this.cells[y][x].dom.classList.add(CLASSES.ERROR);
            this.cells[y][x].dom.textContent = '*';
            alert('Game over');
            this.grid.onmousedown = () => false;
        } else {
            this.openCell(x, y);
        }
    }
    Minesweeper.prototype.openCell = function (x, y) {
        const cell = this.cells[y][x].dom;
        cell.classList.remove(CLASSES.ACTIVE);
        this.cells[y][x].is_open = true;
        const neighbours = this.getNeighbors(x, y);
        const count = this.getNeighborsMinesCount(neighbours);
        if (count) {
            cell.textContent = count;
        } else {
            cell.textContent = '';
            neighbours.forEach(([x, y]) => {
                if (!this.cells[y][x].is_open && !this.cells[y][x].is_striked) {
                    this.openCell(x, y);
                }
            });
        }
    }

    window.addEventListener('load', () => new Minesweeper(), false);
    document.getElementById(CLASSES.RERENDER).addEventListener('click', () => new Minesweeper(), false);
}());