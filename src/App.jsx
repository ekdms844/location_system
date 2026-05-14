import { MapPin, Search, MessageSquare, Mic, ShoppingCart, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
const SHOPS = [
  { id: 1, x: 226, y: 186, name: '꿀맛 떡집', info: '식혜 서비스!', range:50 },
  { id: 2, x: 107, y: 87, name: '싱싱 수산', info: '오늘 갈치 대박', range:30 },
];

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [nearbyShop, setNearbyShop] = useState(null);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const addShoppingItem = () => {
    if (newItem.trim()) {
      setShoppingItems([...shoppingItems, newItem]);
      setNewItem('');
    }
  };

  const removeShoppingItem = (index) => {
    setShoppingItems(shoppingItems.filter((_, i) => i !== index));
  };

  return (
    <div className="size-full bg-white overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-300 px-4 py-3 z-10">
        <h1 className="text-black m-0">Guidant</h1>
        <p className="text-gray-600 text-sm mt-1 mb-0">전통시장 가이드</p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* 1. Map & Navigation */}
        <section className="border-b border-gray-300 p-4">
          <h2 className="text-black mb-3">지도 및 경로 안내</h2>

          {/* Map */}
          <div
            className="relative w-full mb-3"
            style={{ height: 300 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setMousePos({ x, y });
              const found = SHOPS.find(s => Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2) < s.range);
              setNearbyShop(found || null);
            }}
          >
            <img src="/map.jpg" alt="지도" style={{ width: '100%', height: 300, objectFit: 'cover' }} />
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 300 }}>
              {SHOPS.map(s => (
                <g key={s.id}>
                  <circle cx={s.x} cy={s.y} r={8} fill="rgba(255,0,0,0.7)" />
                  <text x={s.x} y={s.y - 12} textAnchor="middle" fontSize={12} fill="red" fontWeight="bold">{s.name}</text>
                  <circle cx={s.x} cy={s.y} r={s.range} fill="rgba(255,0,0,0.05)" stroke="rgba(255,0,0,0.2)" strokeDasharray="4" />
                </g>
              ))}
              <circle cx={mousePos.x} cy={mousePos.y} r={6} fill="blue" />
              {nearbyShop && <line x1={mousePos.x} y1={mousePos.y} x2={nearbyShop.x} y2={nearbyShop.y} stroke="red" strokeWidth={1.5} strokeOpacity={0.6} />}
            </svg>
            {nearbyShop && (
              <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-xl shadow-lg p-3 w-40">
                <p className="text-red-500 font-bold text-xs mb-1">📍 상점 감지!</p>
                <p className="text-black font-bold">{nearbyShop.name}</p>
                <p className="text-gray-600 text-sm">{nearbyShop.info}</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1">
              좌표: {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="목적지 검색"
              className="flex-1 px-3 py-2 border border-gray-400 bg-white text-black placeholder:text-gray-500"
            />
            <button className="px-4 py-2 bg-black text-white border border-black">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. Nearby Shops */}
        <section className="border-b border-gray-300 p-4">
          <h2 className="text-black mb-3">주변 상점</h2>
          <div className="space-y-2">
            {[
              { name: 'A상점', category: '과일', distance: '10m' },
              { name: 'B상점', category: '채소', distance: '25m' },
              { name: 'C상점', category: '건어물', distance: '40m' },
              { name: 'D상점', category: '정육점', distance: '55m' }
            ].map((shop, index) => (
              <div key={index} className="p-3 border border-gray-400 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-black m-0">{shop.name}</p>
                  <p className="text-gray-600 text-sm mt-1 mb-0">{shop.category}</p>
                </div>
                <span className="text-gray-700 text-sm">{shop.distance}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AI Chatbot */}
        <section className="border-b border-gray-300 p-4">
          <h2 className="text-black mb-3">AI 도우미</h2>

          {/* Chat Area */}
          <div className="w-full h-40 border border-gray-400 bg-gray-50 p-3 mb-3 overflow-y-auto">
            <div className="flex items-start gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-700 mt-1 flex-shrink-0" />
              <p className="text-gray-700 text-sm m-0">무엇을 도와드릴까요?</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="질문을 입력하세요"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-400 bg-white text-black placeholder:text-gray-500"
            />
            <button className="px-4 py-2 bg-gray-700 text-white border border-gray-700">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 4. Shopping List */}
        <section className="border-b border-gray-300 p-4">
          <h2 className="text-black mb-3">쇼핑 목록</h2>

          {/* Shopping Items */}
          <div className="space-y-2 mb-3">
            {shoppingItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  onChange={() => removeShoppingItem(index)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-black flex-1">{item}</span>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="항목 추가"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
              className="flex-1 px-3 py-2 border border-gray-400 bg-white text-black placeholder:text-gray-500"
            />
            <button
              onClick={addShoppingItem}
              className="px-4 py-2 bg-black text-white border border-black"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 5. Personalized Recommendations */}
        <section className="p-4">
          <h2 className="text-black mb-3">맞춤 추천</h2>

          <div className="space-y-3">
            {/* Season */}
            <div className="p-3 border border-gray-400 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-700" />
                <h3 className="text-black m-0">계절 상품</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li className="text-gray-700 text-sm">봄나물 (냉이, 달래)</li>
                <li className="text-gray-700 text-sm">제철 과일 (딸기)</li>
              </ul>
            </div>

            {/* Weather */}
            <div className="p-3 border border-gray-400 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-700" />
                <h3 className="text-black m-0">날씨 기반</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li className="text-gray-700 text-sm">따뜻한 국물 재료</li>
                <li className="text-gray-700 text-sm">비타민 보충 식품</li>
              </ul>
            </div>

            {/* Popular */}
            <div className="p-3 border border-gray-400 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-700" />
                <h3 className="text-black m-0">인기 상품</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li className="text-gray-700 text-sm">쌀 (10kg)</li>
                <li className="text-gray-700 text-sm">김치 재료 세트</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}