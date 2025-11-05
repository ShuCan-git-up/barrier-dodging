// 暖心问候语库 - Heartwarming Greetings Library

const GREETINGS = [
    "加油！你做得很棒！ 💪",
    "继续保持，胜利在望！ ✨",
    "你真是太厉害了！ 🌟",
    "坚持就是胜利！ 🎯",
    "相信自己，你一定可以的！ 💖",
    "每一次跳跃都充满力量！ ⚡",
    "你的反应速度真快！ 🚀",
    "太棒了！继续加油！ 🎉",
    "保持专注，你能行的！ 👍",
    "你是最棒的！ 🏆",
    "完美的跳跃！ ✈️",
    "你的技术越来越好了！ 📈",
    "坚持不懈，必有收获！ 🌈",
    "你的努力不会白费！ 💎",
    "真是令人惊叹的表现！ 🌺",
    "你就是传奇！ 🔥",
    "再接再厉，创造奇迹！ 🎊",
    "你的毅力让人敬佩！ 🌸",
    "每一步都走得很稳！ 🎯",
    "你有无限的潜力！ 🌟",
    "相信奇迹，你就是奇迹！ ✨",
    "你的进步令人欣喜！ 🎈",
    "保持这个节奏，太好了！ 🎵",
    "你的表现超出预期！ 🌠",
    "永不放弃，继续前进！ 🚴",
    "你是躲避高手！ 🥇",
    "完美的时机掌控！ ⏰",
    "你的专注力令人佩服！ 🧠",
    "继续保持这份热情！ ❤️",
    "你的勇气值得称赞！ 🦁"
];

/**
 * 获取随机问候语
 * @returns {string} 随机选择的问候语
 */
function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * GREETINGS.length);
    return GREETINGS[randomIndex];
}

/**
 * 获取随机的障碍间隔数（在此间隔后显示问候语）
 * @param {number} min 最小间隔
 * @param {number} max 最大间隔
 * @returns {number} 随机间隔数
 */
function getRandomGreetingInterval(min = 5, max = 15) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
