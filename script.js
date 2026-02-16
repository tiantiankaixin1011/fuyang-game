// 卡片数据 - 九宫格内容
var cardsData = [
    { pairId: 1, number: '一', text: '手机比纸', image: 'images/shouji-bizhi.jpg' },
    { pairId: 1, number: '二', text: '平板比纸', image: 'images/pingban-bizhi.jpg' },
    { pairId: 2, number: '三', text: '小比的小红包', image: 'images/xiaohongbao-xiao.jpg' },
    { pairId: 2, number: '四', text: '小比的大红包', image: 'images/xiaohongbao-da.jpg' },
    { pairId: 3, number: '五', text: '可爱窗花', image: 'images/keai-chuanghua.jpg' },
    { pairId: 3, number: '六', text: '我踏马来啦', image: 'images/wotamalaila.gif' },
    { pairId: 4, number: '七', text: '过年条漫', image: 'images/guonian-tiaoman.jpg' },
    { pairId: 4, number: '八', text: '新春小卡', image: 'images/xinchun-xiaoka.jpg' },
    { pairId: 0, number: '九', text: '福到了', image: 'images/fudaole.jpg' }
];

// 游戏状态
var cards = [];
var flippedIndices = [];
var matchedPairs = [];
var currentBless = '新年大吉';
var waitForBless = false;
var remainingFlips = 0;  // 剩余可翻牌次数

// DOM 元素
var gridEl = document.getElementById('cardGrid');
var flipCounterEl = document.getElementById('flipCounter');
var blessInput = document.getElementById('blessInput');
var applyBlessBtn = document.getElementById('applyBlessBtn');
var blessHint = document.getElementById('blessHint');
var resetBtn = document.getElementById('resetGame');

blessHint.innerText = '当前祝福: ' + currentBless + ' (点格子消耗)';

// 洗牌函数
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

// 初始化游戏
function initGame() {
    var freshCards = [];
    for (var i = 0; i < cardsData.length; i++) {
        var card = cardsData[i];
        freshCards.push({
            pairId: card.pairId,
            number: card.number,
            text: card.text,
            image: card.image,
            id: i,
            matched: false,
            flipped: false
        });
    }
    freshCards = shuffleArray(freshCards);
    cards = freshCards;
    flippedIndices = [];
    matchedPairs = [];
    remainingFlips = 0;
    renderGrid();
    updateCounter();
}

// 渲染网格
function renderGrid() {
    var html = '';
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var flippedClass = card.flipped ? 'flipped' : '';
        var matchedClass = card.matched ? 'matched' : '';
        html += '<div class="card ' + flippedClass + ' ' + matchedClass + '" data-index="' + i + '">' +
            '<div class="card-front">' +
                '<img src="' + card.image + '" alt="' + card.text + '" style="width: 70px; height: 70px; object-fit: cover; image-rendering: pixelated; cursor: pointer;" onclick="window.open(\'' + card.image + '\', \'_blank\')">' +
                '<div style="margin-top: 4px; font-size: 10px; text-align: center;">' + card.text + '</div>' +
            '</div>' +
            '<div class="card-back">' + card.number + '</div>' +
        '</div>';
    }
    gridEl.innerHTML = html;
}

// 更新计数
function updateCounter() {
    flipCounterEl.innerText = '剩余翻牌: ' + remainingFlips + '/5';
}

// 检查能否翻牌
function canFlipCard(index) {
    var card = cards[index];
    if (card.matched) return false;
    if (card.flipped) return false;
    if (!waitForBless) {
        alert('🧧 要先输入祝福语，然后点击【祝福·开牌】才能翻哦！');
        return false;
    }
    if (remainingFlips <= 0) {
        alert('✨ 这次祝福已经用完啦，再输入一句祝福吧！');
        return false;
    }
    return true;
}

// 翻开卡片
function flipCard(index) {
    var card = cards[index];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    flippedIndices.push(index);
    remainingFlips--;  // 消耗一次翻牌机会

    // 检查配对 (非独牌)
    if (card.pairId !== 0) {
        var samePairFlipped = [];
        for (var i = 0; i < flippedIndices.length; i++) {
            var idx = flippedIndices[i];
            var c = cards[idx];
            if (c.pairId === card.pairId && !c.matched && c.pairId !== 0) {
                samePairFlipped.push(idx);
            }
        }

        if (samePairFlipped.length >= 2) {
            var pairToMatch = [samePairFlipped[0], samePairFlipped[1]];
            for (var j = 0; j < pairToMatch.length; j++) {
                var matchIdx = pairToMatch[j];
                cards[matchIdx].matched = true;
                cards[matchIdx].flipped = true;
            }
            var newFlipped = [];
            for (var k = 0; k < flippedIndices.length; k++) {
                var currentIdx = flippedIndices[k];
                if (currentIdx !== pairToMatch[0] && currentIdx !== pairToMatch[1]) {
                    newFlipped.push(currentIdx);
                }
            }
            flippedIndices = newFlipped;
            matchedPairs.push(card.pairId);
        }
    }

    renderGrid();
    updateCounter();

    // 用完翻牌机会后自动关闭祝福状态
    if (remainingFlips <= 0) {
        waitForBless = false;
        blessHint.innerText = '⏳ 需要再念祝福才能翻牌';
    }
}

// 应用祝福
function applyBless() {
    var newBless = blessInput.value.trim();
    if (newBless === '') {
        newBless = '吉祥如意';
    }
    currentBless = newBless;
    waitForBless = true;
    remainingFlips = 5;  // 每次祝福获得5次翻牌机会
    blessHint.innerText = '✨ 当前祝福: "' + currentBless + '" (剩余5次)';
    blessInput.value = '';
    updateCounter();
}

// 重置游戏
function resetGame() {
    initGame();
    waitForBless = false;
    remainingFlips = 0;
    blessHint.innerText = '⏳ 需要念祝福才能翻牌';
    currentBless = '新年大吉';
    blessInput.value = '';
}

// 事件监听
gridEl.addEventListener('click', function(e) {
    var cardDiv = e.target.closest('.card');
    if (!cardDiv) return;
    var index = parseInt(cardDiv.dataset.index, 10);
    if (isNaN(index)) return;

    if (!canFlipCard(index)) return;

    flipCard(index);
});

applyBlessBtn.addEventListener('click', applyBless);
resetBtn.addEventListener('click', resetGame);

// 启动游戏
initGame();
waitForBless = false;
remainingFlips = 0;
blessHint.innerText = '⏳ 需要念祝福才能翻牌';
