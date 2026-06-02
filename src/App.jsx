import { MapPin, Search, MessageSquare, Mic, TrendingUp, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

const EXHIBITS = [
  { id: 1, x: 576, y: 494, name: 'AI 임베디드 실습실', info: '2,3,4교시 수업 진행 중', range: 50, beaconId: 'A1' },
  { id: 2, x: 364, y: 404, name: 'ICT PBL실', info: '체험 대여 가능', range: 30, beaconId: 'A2' },
];

const MENU_ITEMS = [
  { id: 'map', icon: MapPin, label: '지도 및 경로 안내', desc: '전시물 위치 확인 & 길찾기', color: '#e8f4f8', accent: '#2a7aad' },
  { id: 'exhibits', icon: Search, label: '주변 전시물', desc: '내 근처 전시물 목록', color: '#f0f8ec', accent: '#3a8a3a' },
  { id: 'chat', icon: MessageSquare, label: 'AI 도우미', desc: '전시물에 대해 무엇이든 물어보세요', color: '#fdf4e8', accent: '#c07a1a' },
  { id: 'recommend', icon: TrendingUp, label: '맞춤 추천', desc: '관심사 기반 전시물 추천', color: '#fef0f0', accent: '#c03a3a' },
];

function MapSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [nearbyExhibit, setNearbyExhibit] = useState(null);
  const [selectedExhibit, setSelectedExhibit] = useState(null);
  const [myPos, setMyPos] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3000/beacon');
        const data = await res.json();
        if (data.beaconId) {
          const exhibit = EXHIBITS.find(e => e.beaconId === data.beaconId);
          if (exhibit) setMyPos({ x: exhibit.x, y: exhibit.y });
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
      <div
        className="relative w-full h-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePos({ x, y });
          const found = EXHIBITS.find(s => Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2) < s.range);
          setNearbyExhibit(found || null);
        }}
      >
        <img
          src="/map.jpg"
          alt="전시 지도"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {EXHIBITS.map(e => (
            <g key={e.id} style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setSelectedExhibit(selectedExhibit?.id === e.id ? null : e)}>
              <circle cx={e.x} cy={e.y} r={e.range} fill="rgba(229,62,62,0.07)" stroke="rgba(229,62,62,0.25)" strokeDasharray="4" />
              <ellipse cx={e.x} cy={e.y + 18} rx={6} ry={3} fill="rgba(0,0,0,0.2)" />
              <path
                d={`M${e.x} ${e.y - 22} C${e.x - 12} ${e.y - 22}, ${e.x - 14} ${e.y - 4}, ${e.x} ${e.y + 14} C${e.x + 14} ${e.y - 4}, ${e.x + 12} ${e.y - 22}, ${e.x} ${e.y - 22}Z`}
                fill={selectedExhibit?.id === e.id ? '#d63031' : '#e53e3e'}
                stroke="white"
                strokeWidth="2"
              />
              <circle cx={e.x} cy={e.y - 11} r={5} fill="white" />
            </g>
          ))}

          <circle cx={mousePos.x} cy={mousePos.y} r={8} fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth={2} />
          <circle cx={mousePos.x} cy={mousePos.y} r={3} fill="#2563eb" />

          {myPos && (
            <>
              <circle cx={myPos.x} cy={myPos.y} r={14} fill="rgba(34,197,94,0.2)" stroke="#16a34a" strokeWidth={2} />
              <circle cx={myPos.x} cy={myPos.y} r={6} fill="#16a34a" />
            </>
          )}

          {nearbyExhibit && (
            <line
              x1={mousePos.x} y1={mousePos.y}
              x2={nearbyExhibit.x} y2={nearbyExhibit.y}
              stroke="#e53e3e" strokeWidth={1.5} strokeOpacity={0.6}
              strokeDasharray="4"
            />
          )}
        </svg>

        {nearbyExhibit && !selectedExhibit && (
          <div className="absolute top-14 right-3 bg-white rounded-2xl shadow-xl p-3 w-44 z-20">
            <p className="text-red-500 font-bold text-xs mb-1">📍 전시물 감지!</p>
            <p className="text-black font-bold text-sm">{nearbyExhibit.name}</p>
            <p className="text-gray-600 text-xs">{nearbyExhibit.info}</p>
          </div>
        )}

        {selectedExhibit && (
          <div
            className="absolute bg-white rounded-2xl shadow-2xl p-4 z-20"
            style={{ left: Math.min(selectedExhibit.x + 20, 280), top: Math.max(selectedExhibit.y - 90, 60), width: 160 }}
          >
            <div style={{ position: 'absolute', left: -8, top: 24, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '8px solid white' }} />
            <button onClick={() => setSelectedExhibit(null)} className="absolute top-2 right-3 text-gray-400 text-sm">✕</button>
            <p className="text-red-500 font-bold text-xs mb-1">📍 {selectedExhibit.name}</p>
            <p className="text-gray-600 text-sm m-0">{selectedExhibit.info}</p>
            <button className="mt-2 w-full text-xs bg-black text-white py-1.5 rounded-xl">길찾기</button>
          </div>
        )}

        <div className="absolute bottom-16 left-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 z-10">
          좌표: {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
        </div>
      </div>

      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {EXHIBITS.map(e => (
          <button
            key={e.id}
            onClick={() => setSelectedExhibit(selectedExhibit?.id === e.id ? null : e)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow-md font-medium border transition-all"
            style={{
              backgroundColor: selectedExhibit?.id === e.id ? '#e53e3e' : 'white',
              color: selectedExhibit?.id === e.id ? 'white' : '#333',
              borderColor: selectedExhibit?.id === e.id ? '#e53e3e' : '#ddd',
            }}
          >
            📍 {e.name}
          </button>
        ))}
      </div>

      <div className="absolute bottom-5 left-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="전시물 이름 검색"
            className="flex-1 bg-transparent text-black text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}

function ExhibitsSection() {
  return (
    <section className="p-4">
      <h2 className="text-black mb-3">주변 전시물</h2>
      <div className="space-y-2">
        {[
          { name: 'AI 임베디드 전시', category: '임베디드 / IoT', distance: '5m' },
          { name: 'ICT 프로젝트 전시', category: 'PBL 프로젝트', distance: '12m' },
          { name: '로봇 제어 시연', category: '로보틱스', distance: '28m' },
          { name: '스마트 센서 전시', category: '센서 / 하드웨어', distance: '45m' },
        ].map((item, index) => (
          <div key={index} className="p-3 border border-gray-400 bg-gray-50 flex justify-between items-center">
            <div>
              <p className="text-black m-0">{item.name}</p>
              <p className="text-gray-600 text-sm mt-1 mb-0">{item.category}</p>
            </div>
            <span className="text-gray-700 text-sm">{item.distance}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatSection() {
  const [chatMessage, setChatMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '안녕하세요! 전시물에 대해 궁금한 점을 무엇이든 물어보세요 😊' }
  ]);

  const handleSend = async (textToSend) => {
    const userText = textToSend || chatMessage;
    if (!userText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');

    const botLoadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botLoadingId, sender: 'bot', text: 'Guidant가 생각 중입니다...' }]);

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages(prev =>
        prev.map(msg => msg.id === botLoadingId ? { ...msg, text: data.reply } : msg)
      );
    } catch (error) {
      console.error('챗봇 통신 에러:', error);
      setMessages(prev =>
        prev.map(msg => msg.id === botLoadingId ? { ...msg, text: '죄송합니다. 서버와 연결이 원활하지 않습니다. 백엔드 서버가 켜져 있는지 확인해 주세요!' } : msg)
      );
    }
  };

  return (
    <section className="relative flex flex-col bg-[#F3F3F3]" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
              msg.sender === 'user'
                ? 'bg-black text-white rounded-tr-none'
                : 'bg-white text-black border border-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>

            {msg.sender === 'bot' && msg.id === 1 && !isVoiceMode && (
              <div className="flex gap-2 mt-2 pl-1">
                <button
                  onClick={() => handleSend('이 전시물은 뭔가요?')}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs text-black font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                >
                  이 전시물은 뭔가요?
                </button>
                <button
                  onClick={() => handleSend('체험 방법 알려줘')}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs text-black font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                >
                  체험 방법 알려줘
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 pt-6 pb-8">
        {isVoiceMode && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <button
              onClick={() => setIsVoiceMode(false)}
              className="w-20 h-20 bg-gray-200 text-black rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-gray-300 transition-all"
            >
              <Mic className="w-8 h-8" />
            </button>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSend('이 전시물은 뭔가요?')}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs text-black font-medium shadow-sm"
              >
                이 전시물은 뭔가요?
              </button>
              <button
                onClick={() => handleSend('체험 방법 알려줘')}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs text-black font-medium shadow-sm"
              >
                체험 방법 알려줘
              </button>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 max-w-md mx-auto ${isVoiceMode ? 'mt-16 opacity-50 pointer-events-none' : ''}`}>
          <div className="flex-1 flex items-center bg-[#E5E5E5] rounded-full px-4 py-2 border border-gray-300">
            <input
              type="text"
              placeholder="메시지 입력"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-black text-sm outline-none placeholder:text-gray-500"
            />
          </div>
          <button
            onClick={() => handleSend()}
            className="w-10 h-10 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 transform rotate-90 ml-0.5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
          <button
            onClick={() => setIsVoiceMode(true)}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-black rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Mic className="w-4 h-4 text-gray-700" />
          </button>
        </div>
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
          { title: '지금 주변 전시물', items: ['AI 임베디드 실습실 — 현재 수업 진행 중', 'ICT PBL실 — 체험 대여 가능'] },
          { title: '인기 전시물', items: ['스마트 센서 시연 체험', '로봇 제어 & 자율주행 전시'] },
          { title: '관심사 기반 추천', items: ['임베디드 시스템에 관심 있다면 → A1 구역', '소프트웨어 프로젝트라면 → ICT PBL실'] },
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
  exhibits: ExhibitsSection,
  chat: ChatSection,
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
          {!activePage && <p className="text-gray-600 text-sm mt-1 mb-0">전시 가이드</p>}
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
