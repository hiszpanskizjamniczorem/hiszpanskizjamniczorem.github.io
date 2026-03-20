class FlashcardApp {
    constructor() {
        this.words = [];
        this.categories = [];
        this.currentCategory = null;
        this.currentWord = null;
        this.score = 0;
        this.totalAnswered = 0;
        this.audio = new Audio('coin.mp3');
        this.ctx = document.getElementById('confetti-canvas').getContext('2d');
        this.particles = [];

        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/words.csv');
            if (!response.ok) throw new Error('Błąd pobierania pliku CSV');
            const csvData = await response.text();
            this.parseCSV(csvData);
            this.renderCategories();
            this.setupEventListeners();
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            requestAnimationFrame(() => this.animateConfetti());
        } catch (error) {
            console.error('Błąd podczas ładowania słówek:', error);
            document.getElementById('categories-grid').innerHTML = '<p>Nie udało się załadować bazy słówek. Upewnij się, że serwer działa prawidłowo.</p>';
        }
    }

    parseCSV(csvData) {
        const lines = csvData.trim().split('\n');
        this.words = [];
        // Zaczynamy od 1 aby pominąć nagłówek "słówko;tłumaczenie;lekcja"
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length >= 3) {
                this.words.push({ 
                    spanish: parts[0].trim(), 
                    polish: parts[1].trim(), 
                    category: parts[2].trim() 
                });
            }
        }

        this.categories = [...new Set(this.words.map(w => w.category))];
    }

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';

        this.categories.forEach(cat => {
            const tile = document.createElement('div');
            tile.className = 'category-tile';

            const count = this.words.filter(w => w.category === cat).length;

            tile.innerHTML = `
                <h3>${cat}</h3>
                <p>${count} słówek</p>
            `;

            tile.onclick = () => this.startCategory(cat);
            grid.appendChild(tile);
        });
    }

    startCategory(category) {
        this.currentCategory = category;
        this.score = 0;
        this.totalAnswered = 0;
        this.updateStats();

        document.getElementById('categories-view').classList.add('hidden');
        document.getElementById('flashcard-view').classList.remove('hidden');
        document.getElementById('category-badge').textContent = category;

        this.nextCard();
    }

    nextCard() {
        const categoryWords = this.words.filter(w => w.category === this.currentCategory);
        this.currentWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];

        document.getElementById('spanish-word').textContent = this.currentWord.spanish;

        // Generate options (1 correct, 3 wrong from SAME category if possible, else any category)
        let wrongOptions = categoryWords.filter(w => w !== this.currentWord);
        if (wrongOptions.length < 3) {
            wrongOptions = this.words.filter(w => w !== this.currentWord);
        }

        // Shuffle wrong options and take 3
        this.shuffleArray(wrongOptions);
        wrongOptions = wrongOptions.slice(0, 3);

        let allOptions = [this.currentWord, ...wrongOptions];
        this.shuffleArray(allOptions);

        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';

        allOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.polish;
            btn.onclick = () => this.checkAnswer(opt, btn);
            optionsGrid.appendChild(btn);
        });
    }

    checkAnswer(selectedOpt, btnEle) {
        // Disable all buttons to prevent double click
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);

        if (selectedOpt === this.currentWord) {
            btnEle.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            btnEle.classList.add('wrong');
            // Show correct answer
            buttons.forEach(b => {
                if (b.textContent === this.currentWord.polish) {
                    b.classList.add('correct');
                }
            });
            setTimeout(() => this.nextCard(), 1500);
        }

        this.totalAnswered++;
        this.updateStats();
    }

    handleCorrectAnswer() {
        this.score++;

        // Play sound (ignore if it fails to load)
        this.audio.currentTime = 0;
        this.audio.play().catch(e => console.log('Audio play blocked or missing file:', e));

        // Show happy dog with a random image (jamnik1, jamnik2 or jamnik3)
        const dog = document.getElementById('happy-dog');
        const randomDog = Math.floor(Math.random() * 3) + 1;
        dog.src = `images/jamnik${randomDog}.png`;
        dog.classList.add('show');

        // Trigger confetti
        this.fireConfetti();

        // Wait and go next
        setTimeout(() => {
            dog.classList.remove('show');
            this.nextCard();
        }, 2000);
    }

    updateStats() {
        document.getElementById('stats').textContent = `Poprawne: ${this.score} / ${this.totalAnswered}`;
    }

    setupEventListeners() {
        document.getElementById('back-btn').addEventListener('click', () => {
            document.getElementById('flashcard-view').classList.add('hidden');
            document.getElementById('categories-view').classList.remove('hidden');
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Simple Confetti Implementation
    resizeCanvas() {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    fireConfetti() {
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: -10,
                r: Math.random() * 6 + 2,
                dx: Math.random() * 4 - 2,
                dy: Math.random() * 5 + 2,
                color: ["#F7BC0F", "#C50F26", "#FFFFFF", "#4CAF50", "#2196F3"][Math.floor(Math.random() * 5)]
            });
        }
    }

    animateConfetti() {
        requestAnimationFrame(() => this.animateConfetti());
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();

            p.x += p.dx;
            p.y += p.dy;
            p.dy += 0.05; // gravity

            if (p.y > window.innerHeight) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlashcardApp();
});
