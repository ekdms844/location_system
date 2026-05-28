import { MapPin, Search, MessageSquare, Mic, ShoppingCart, Plus, TrendingUp, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const SHOPS = [
  { id: 1, x: 226, y: 186, name: '꿀맛 떡집', info: '식혜 서비스!', range: 50 },
  { id: 2, x: 107, y: 87, name: '싱싱 수산', info: '오늘 갈치 대박', range: 30 },
];

const MENU_ITEMS = [
  { id: 'map', icon: MapPin, label: '지도 및 경로 안내', desc: '상점 위치 확인 & 길찾기', color: '#e8f4f8', accent: '#2a7aad' },
  { id: 'shops', icon: Search, label: '주변 상점', desc: '내 근처 상점 목록', color: '#f0f8ec', accent: '#3a8a3a' },
  { id: 'chat', icon: MessageSquare, label: 'AI 도우미', desc: '무엇이든 물어보세요', color: '#fdf4e8', accent: '#c07a1a' },
  { id: 'shopping', icon: ShoppingCart, label: '쇼핑 목록', desc: '살 것들을 메모하세요', color: '#f5ecf8', accent: '#7a3aad' },
  { id: 'recommend', icon: TrendingUp, label: '맞춤 추천', desc: '계절·날씨·인기 상품', color: '#fef0f0', accent: '#c03a3a' },
];

function MapSection() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });

  const handleImgLoad = (e) => {
    setImgSize({ w: e.target.offsetWidth, h: e.target.offsetHeight });
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

      {/* 지도 이미지 */}
      <img
        src="/map.jpg"
        alt="시장 지도"
        onLoad={handleImgLoad}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* 핀 레이어 */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        {SHOPS.map(s => (
          <g key={s.id} style={{ cursor: 'pointer', pointerEvents: 'all' }}
            onClick={() => setSelectedShop(selectedShop?.id === s.id ? null : s)}>
            <ellipse cx={s.x} cy={s.y + 18} rx={6} ry={3} fill="rgba(0,0,0,0.25)" />
            <path
              d={`M${s.x} ${s.y - 22} C${s.x - 12} ${s.y - 22}, ${s.x - 14} ${s.y - 4}, ${s.x} ${s.y + 14} C${s.x + 14} ${s.y - 4}, ${s.x + 12} ${s.y - 22}, ${s.x} ${s.y - 22}Z`}
              fill={selectedShop?.id === s.id ? '#d63031' : '#e53e3e'}
              stroke="white"
              strokeWidth="2"
            />
            <circle cx={s.x} cy={s.y - 11} r={5} fill="white" />
          </g>
        ))}
      </svg>

      {/* 선택된 상점 말풍선 */}
      {selectedShop && (
        <div
          className="absolute bg-white rounded-2xl shadow-2xl p-4"
          style={{
            left: Math.min(selectedShop.x + 20, imgSize.w - 170),
            top: Math.max(selectedShop.y - 90, 60),
            width: 160,
            zIndex: 20,
          }}
        >
          <div style={{
            position: 'absolute', left: -8, top: 24,
            width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid white',
          }} />
          <button onClick={() => setSelectedShop(null)} className="absolute top-2 right-3 text-gray-400 text-sm">✕</button>
          <p className="text-red-500 font-bold text-xs mb-1">📍 {selectedShop.name}</p>
          <p className="text-gray-600 text-sm m-0">{selectedShop.info}</p>
          <button className="mt-2 w-full text-xs bg-black text-white py-1.5 rounded-xl">길찾기</button>
        </div>
      )}

      {/* 상단 상점 칩 */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {SHOPS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedShop(selectedShop?.id === s.id ? null : s)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow-md font-medium border transition-all"
            style={{
              backgroundColor: selectedShop?.id === s.id ? '#e53e3e' : 'white',
              color: selectedShop?.id === s.id ? 'white' : '#333',
              borderColor: selectedShop?.id === s.id ? '#e53e3e' : '#ddd',
            }}
          >
            📍 {s.name}
          </button>
        ))}
      </div>

      {/* 하단 검색바 */}
      <div className="absolute bottom-5 left-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="상점 이름 검색"
            className="flex-1 bg-transparent text-black text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}

function ShopsSection() {
  return (
    <section className="p-4">
      <h2 className="text-black mb-3">주변 상점</h2>
      <div className="space-y-2">
        {[
          { name: 'A상점', category: '과일', distance: '10m' },
          { name: 'B상점', category: '채소', distance: '25m' },
          { name: 'C상점', category: '건어물', distance: '40m' },
          { name: 'D상점', category: '정육점', distance: '55m' },
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
  );
}

function ChatSection() {
  const [chatMessage, setChatMessage] = useState('');
  return (
    <section className="p-4">
      <h2 className="text-black mb-3">AI 도우미</h2>
      <div className="w-full h-40 border border-gray-400 bg-gray-50 p-3 mb-3 overflow-y-auto">
        <div className="flex items-start gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-gray-700 mt-1 flex-shrink-0" />
          <p className="text-gray-700 text-sm m-0">무엇을 도와드릴까요?</p>
        </div>
      </div>
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
  );
}

function ShoppingSection() {
  const [shoppingItems, setShoppingItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  const addShoppingItem = () => {
    if (newItem.trim()) {
      setShoppingItems([...shoppingItems, newItem]);
      setNewItem('');
    }
  };

  return (
    <section className="p-4">
      <h2 className="text-black mb-3">쇼핑 목록</h2>
      <div className="space-y-2 mb-3">
        {shoppingItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={() => setShoppingItems(shoppingItems.filter((_, i) => i !== index))}
              className="w-4 h-4 accent-black"
            />
            <span className="text-black flex-1">{item}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="항목 추가"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
          className="flex-1 px-3 py-2 border border-gray-400 bg-white text-black placeholder:text-gray-500"
        />
        <button onClick={addShoppingItem} className="px-4 py-2 bg-black text-white border border-black">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function RecommendSection() {
  return (
    <section className="p-4">
      <h2 className="text-black mb-3">맞춤 추천</h2>
      <div className="space-y-3">
        {[
          { title: '계절 상품', items: ['봄나물 (냉이, 달래)', '제철 과일 (딸기)'] },
          { title: '날씨 기반', items: ['따뜻한 국물 재료', '비타민 보충 식품'] },
          { title: '인기 상품', items: ['쌀 (10kg)', '김치 재료 세트'] },
        ].map((group, i) => (
          <div key={i} className="p-3 border border-gray-400 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              <h3 className="text-black m-0">{group.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {group.items.map((item, j) => (
                <li key={j} className="text-gray-700 text-sm">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const SECTION_MAP = {
  map: MapSection,
  shops: ShopsSection,
  chat: ChatSection,
  shopping: ShoppingSection,
  recommend: RecommendSection,
};

export default function App() {
  const [activePage, setActivePage] = useState(null);

  const ActiveSection = activePage ? SECTION_MAP[activePage] : null;
  const activeMenu = MENU_ITEMS.find(m => m.id === activePage);

  return (
    <div className="size-full bg-white overflow-y-auto">
      <header className="sticky top-0 bg-white border-b border-gray-300 px-4 py-3 z-10 flex items-center gap-3">
        {activePage && (
          <button onClick={() => setActivePage(null)} className="p-1 -ml-1 text-gray-600 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-black m-0">{activePage ? activeMenu.label : 'Guidant'}</h1>
          {!activePage && <p className="text-gray-600 text-sm mt-1 mb-0">전통시장 가이드</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {activePage === null ? (
          <div className="p-4 space-y-3">
            <p className="text-gray-500 text-sm mb-4">어떤 기능을 이용하시겠어요?</p>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-300 text-left hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.accent + '22' }}>
                    <Icon className="w-5 h-5" style={{ color: item.accent }} />
                  </div>
                  <div>
                    <p className="text-black font-semibold m-0">{item.label}</p>
                    <p className="text-gray-500 text-sm mt-0.5 mb-0">{item.desc}</p>
                  </div>
                  <span className="ml-auto text-gray-400 text-lg">›</span>
                </button>
              );
            })}
          </div>
        ) : (
          <ActiveSection />
        )}
      </main>
    </div>
  );
}
