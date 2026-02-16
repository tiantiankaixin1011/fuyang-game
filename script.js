// 卡片数据 - 九宫格内容
const cardsData = [
const cardsData = [
    { pairId: 1, number: '一', text: '手机比纸', image: 'images/shouji-bizhi.jpg'},
    { pairId: 1, number: '二', text: '平板比纸', image: 'images/pingban-bizhi.jpg'},
    { pairId: 2, number: '三', text: '小比的小红包', image: 'images/xiaohongbao-xiao.jpg'},
    { pairId: 2, number: '四', text: '小比的大红包', image: 'images/xiaohongbao-da.jpg'},
    { pairId: 3, number: '五', text: '可爱窗花', image: 'images/keai-chuanghua.jpg'},
    { pairId: 3, number: '六', text: '我踏马来啦', image: 'images/wotamalaila.gif'},
    { pairId: 4, number: '七', text: '过年条漫', image: 'images/guonian-tiaoman.jpg'},
    { pairId: 4, number: '八', text: '新春小卡'},
    { pairId: 0, number: '九', text: '福到了', image: 'images/fudaole.jpg'}
];

// 游戏状态
let cards = [];
let flippedIndices = [];
let matchedPairs = [];
let currentBless = '新年大吉';
let waitForBless = false;

const MAX_FLIP = 3;

// DOM 元素
const gridEl = document.getElementById('cardGrid');
const flipCounterEl = document.getElementById('flipCounter');
const blessInput = document.getElementById('blessInput');
const applyBlessBtn = document.getElementById('applyBlessBtn');
const blessHint = document.getElementById('blessHint');
const resetBtn = document.getElementById('resetGame');

// 初始化祝福提示
blessHint.innerText = `当前祝福: ${currentBless} (点格子消耗)`;

// 洗牌函数
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 重置/初始化游戏
function initGame() {
    let freshCards = cardsData.map((card, index) => ({
        ...card,
        id: index,
        matched: false,
        flipped: false,
    }));
    freshCards = shuffleArray(freshCards);
    cards = freshCards;
    flippedIndices = [];
    matchedPairs = [];
    renderGrid();
    updateCounter();
}

// 渲染网格
function renderGrid() {
    let html = '';
    cards.forEach((card, idx) => {
        const flippedClass = card.flipped ? 'flipped' : '';
        const matchedClass = card.matched ? 'matched' : '';
        html += `<div class="card ${flippedClass} ${matchedClass}" data-index="${idx}">
            <div class="card-front">${card.text}</div>
            <div class="card-back">${card.number}</div>
        </div>`;
    });
    gridEl.innerHTML = html;
}

// 更新计数
function updateCounter() {
    flipCounterEl.innerText = `翻开 ${flippedIndices.length}/${MAX_FLIP}`;
}

// 检查能否翻牌
function canFlipCard(index) {
    const card = cards[index];
    if (card.matched) return false;
    if (card.flipped) return false;
    if (!waitForBless) {
        alert('🧧 要先输入祝福语，然后点击【祝福·开牌】才能翻哦！');
        return false;
    }
    return true;
}

// 翻开卡片
function flipCard(index) {
    const card = cards[index];
    if (card.flipped || card.matched) return;

    // 翻开
    card.flipped = true;
    flippedIndices.push(index);

    // 检查配对 (非独牌)
    if (card.pairId !== 0) {
        const samePairFlipped = flippedIndices.filter(i => {
            const c = cards[i];
            return c.pairId === card.pairId && !c.matched && c.pairId !== 0;
        });

        if (samePairFlipped.length >= 2) {
            const pairToMatch = samePairFlipped.slice(0, 2);
            pairToMatch.forEach(i => {
                cards[i].matched = true;
                cards[i].flipped = true;
            });
            flippedIndices = flippedIndices.filter(i => !pairToMatch.includes(i));
            matchedPairs.push(card.pairId);
        }
    }

    // 超过最大翻开数处理
    if (flippedIndices.length > MAX_FLIP) {
        let removed = false;
        for (let i = 0; i < flippedIndices.length; i++) {
            const idx = flippedIndices[i];
            if (!cards[idx].matched && cards[idx].pairId !== 0) {
                cards[idx].flipped = false;
                flippedIndices.splice(i, 1);
                removed = true;
                break;
            }
        }
        if (!removed && flippedIndices.length > MAX_FLIP) {
            const firstIdx = flippedIndices.shift();
            cards[firstIdx].flipped = false;
        }
    }

    renderGrid();
    updateCounter();
}

// 应用祝福
function applyBless() {
    let newBless = blessInput.value.trim();
    if (newBless === '') {
        newBless = '吉祥如意';
    }
    currentBless = newBless;
    waitForBless = true;
    blessHint.innerText = `✨ 当前祝福: "${currentBless}" (可翻牌)`;
    blessInput.value = '';
}

// 重置游戏
function resetGame() {
    initGame();
    waitForBless = false;
    blessHint.innerText = `⏳ 需要念祝福才能翻牌`;
    currentBless = '新年大吉';
    blessInput.value = '';
}

// 事件监听
gridEl.addEventListener('click', (e) => {
    const cardDiv = e.target.closest('.card');
    if (!cardDiv) return;
    const index = parseInt(cardDiv.dataset.index, 10);
    if (isNaN(index)) return;

    if (!canFlipCard(index)) return;

    flipCard(index);
    waitForBless = false;
    blessHint.innerText = `⏳ 需要再念祝福才能翻下一张`;
});

applyBlessBtn.addEventListener('click', applyBless);
resetBtn.addEventListener('click', resetGame);

// 启动游戏
initGame();
waitForBless = false;
blessHint.innerText = `⏳ 需要念祝福才能翻牌`;


