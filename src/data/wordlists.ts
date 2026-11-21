/**
 * English Wordlists (Top 200 & Top 1000 Common Typing Benchmark Words)
 */

export const TOP_200_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his', 'from',
  'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make',
  'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'between', 'need', 'large', 'under', 'might', 'still', 'found', 'own', 'world', 'house',
  'both', 'night', 'point', 'water', 'write', 'mother', 'father', 'group', 'word', 'life', 'call',
  'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard',
  'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', 'don\'t', 'while',
  'press', 'close', 'night', 'real', 'life', 'few', 'north', 'open', 'seem', 'together', 'next',
  'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always',
  'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet',
  'care', 'second', 'book', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea',
  'fish', 'mountain', 'stop', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color',
  'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever',
  'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose',
  'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind',
  'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south',
  'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard',
  'best', 'hour', 'better', 'true', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold'
];

export const CODE_SNIPPETS: Record<string, string[]> = {
  javascript: [
    'const debounce = (fn, delay = 300) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };',
    'async function fetchUserData(userId) { const res = await fetch(`/api/users/${userId}`); if (!res.ok) throw new Error("HTTP error"); return await res.json(); }',
    'const memoize = (fn) => { const cache = new Map(); return (key) => cache.has(key) ? cache.get(key) : cache.set(key, fn(key)).get(key); };',
    'export const calculateWpm = (charsTyped, timeElapsedSeconds) => Math.round((charsTyped / 5) / (timeElapsedSeconds / 60));',
    'const matrix = Array.from({ length: 5 }, () => Array(5).fill(0)); matrix[2][2] = 1;',
  ],
  python: [
    'def quicksort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    return [x for x in arr if x < pivot] + [x for x in arr if x == pivot] + [x for x in arr if x > pivot]',
    'class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = collections.OrderedDict()\n    def get(self, key: int) -> int:\n        if key not in self.cache: return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]',
    'import asyncio\nasync def stream_tokens(prompt: str):\n    async for chunk in model.generate(prompt):\n        yield chunk.text',
  ],
  rust: [
    'fn main() -> Result<(), Box<dyn std.error.Error>> {\n    let stream = tokio::net::TcpListener::bind("127.0.0.1:8080").await?;\n    println!("Listening on: {}", stream.local_addr()?);\n    Ok(())\n}',
    'pub struct KeycapSpring<T> {\n    pub stiffness: f32,\n    pub damping: f32,\n    pub target_val: T,\n}\nimpl<T> KeycapSpring<T> {\n    pub fn new(k: f32, d: f32, val: T) -> Self { Self { stiffness: k, damping: d, target_val: val } }\n}',
  ],
  cpp: [
    'template <typename T>\nclass CircularBuffer {\nprivate:\n    std::vector<T> buffer;\n    size_t head = 0, tail = 0, max_size;\npublic:\n    CircularBuffer(size_t size) : buffer(size), max_size(size) {}\n};',
    '#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    for (const auto& n : numbers) std::cout << n * n << " ";\n    return 0;\n}',
  ],
};

export function getRandomWords(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * TOP_200_WORDS.length);
    result.push(TOP_200_WORDS[idx]);
  }
  return result;
}
