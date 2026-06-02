import { MapPin, Search, MessageSquare, Mic, TrendingUp, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

const EXHIBITS = [
  { id: 1, x: 576, y: 494, name: 'AI 임베디드 실습실', info: '2,3,4교시 수업 진행 중', range: 50, beaconId: 'A1' },
  { id: 2, x: 364, y: 404, name: 'ICT PBL실', info: '체험 대여 가능', range: 30, beaconId: 'A2' },
];

const MENU_ITEMS = [
  { id: 'map',       icon: MapPin,        label: '지도 및 경로 안내', desc: '전시물 위치 확인 & 길찾기',         color: '#EEF6FB', accent: '#6BAED6', emoji: '🗺️' },
  { id: 'exhibits',  icon: Search,        label: '주변 전시물',       desc: '내 근처 전시물 목록',               color: '#EDF7EE', accent: '#74C476', emoji: '🔍' },
  { id: 'chat',      icon: MessageSquare, label: 'AI 도우미',         desc: '전시물에 대해 무엇이든 물어보세요', color: '#FEF9EC', accent: '#FDAE6B', emoji: '💬' },
  { id: 'recommend', icon: TrendingUp,    label: '맞춤 추천',         desc: '관심사 기반 전시물 추천',           color: '#FEF0F5', accent: '#F768A1', emoji: '✨' },
];

/* ── 공통 스타일 토큰 ── */
const T = {
  bg:        '#FAFBFF',
  card:      '#FFFFFF',
  border:    '#EEF0F6',
  radius:    '18px',
  shadow:    '0 2px 12px rgba(100,120,180,0.08)',
  shadowMd:  '0 4px 20px rgba(100,120,180,0.13)',
  text:      '#2D3250',
  sub:       '#8A90A8',
  inputBg:   '#F2F4FA',
};

/* ── 헤더 ── */
function Header({ activePage, onBack }) {
  const activeMenu = MENU_ITEMS.find(m => m.id === activePage);
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(250,251,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${T.border}`,
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {activePage && (
        <button onClick={onBack} style={{
          background: T.inputBg, border: 'none', borderRadius: 12,
          width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: T.text, flexShrink: 0,
        }}>
          <ArrowLeft size={17} />
        </button>
      )}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
          {activePage ? activeMenu.label : 'Guidant ✨'}
        </div>
        {!activePage && <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>전시 가이드</div>}
      </div>
    </header>
  );
}

/* ── 홈 메뉴 ── */
function HomeMenu({ onNavigate }) {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}>어떤 기능을 이용하시겠어요? 👀</p>
      {MENU_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              background: T.card,
              border: `1.5px solid ${T.border}`,
              borderRadius: T.radius,
              boxShadow: T.shadow,
              cursor: 'pointer', textAlign: 'left',
              transition: 'transform 0.12s, box-shadow 0.12s',
              animationDelay: `${i * 60}ms`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = T.shadow; }}
          >
            {/* 아이콘 버블 */}
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {item.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: T.sub }}>{item.desc}</div>
            </div>
            <div style={{ color: '#C8CEDE', fontSize: 20, fontWeight: 300 }}>›</div>
          </button>
        );
      })}
    </div>
  );
}

/* ── 지도 ── */
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
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>
      <div
        style={{ position: 'relative', width: '100%', height: '100%' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePos({ x, y });
          const found = EXHIBITS.find(s => Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2) < s.range);
          setNearbyExhibit(found || null);
        }}
      >
        <img src="/map.jpg" alt="전시 지도" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {EXHIBITS.map(e => (
            <g key={e.id} style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={() => setSelectedExhibit(selectedExhibit?.id === e.id ? null : e)}>
              <circle cx={e.x} cy={e.y} r={e.range} fill="rgba(107,174,214,0.1)" stroke="rgba(107,174,214,0.35)" strokeDasharray="5" />
              <ellipse cx={e.x} cy={e.y + 18} rx={6} ry={3} fill="rgba(0,0,0,0.12)" />
              <path
                d={`M${e.x} ${e.y - 22} C${e.x - 12} ${e.y - 22}, ${e.x - 14} ${e.y - 4}, ${e.x} ${e.y + 14} C${e.x + 14} ${e.y - 4}, ${e.x + 12} ${e.y - 22}, ${e.x} ${e.y - 22}Z`}
                fill={selectedExhibit?.id === e.id ? '#4A90D9' : '#6BAED6'}
                stroke="white" strokeWidth="2.5"
              />
              <circle cx={e.x} cy={e.y - 11} r={5} fill="white" />
            </g>
          ))}
          <circle cx={mousePos.x} cy={mousePos.y} r={9} fill="rgba(116,196,118,0.25)" stroke="#74C476" strokeWidth={2} />
          <circle cx={mousePos.x} cy={mousePos.y} r={3.5} fill="#74C476" />
          {myPos && (
            <>
              <circle cx={myPos.x} cy={myPos.y} r={14} fill="rgba(116,196,118,0.2)" stroke="#74C476" strokeWidth={2} />
              <circle cx={myPos.x} cy={myPos.y} r={6} fill="#74C476" />
            </>
          )}
          {nearbyExhibit && (
            <line x1={mousePos.x} y1={mousePos.y} x2={nearbyExhibit.x} y2={nearbyExhibit.y}
              stroke="#6BAED6" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="5" />
          )}
        </svg>

        {/* 근처 감지 팝업 */}
        {nearbyExhibit && !selectedExhibit && (
          <div style={{
            position: 'absolute', top: 56, right: 12,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 16, boxShadow: T.shadowMd,
            padding: '12px 14px', width: 175, zIndex: 20,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6BAED6', marginBottom: 4 }}>📍 전시물 감지!</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{nearbyExhibit.name}</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{nearbyExhibit.info}</div>
          </div>
        )}

        {/* 핀 클릭 팝업 */}
        {selectedExhibit && (
          <div style={{
            position: 'absolute',
            left: Math.min(selectedExhibit.x + 20, 230),
            top: Math.max(selectedExhibit.y - 100, 60),
            width: 165,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 18, boxShadow: T.shadowMd,
            padding: 16, zIndex: 20,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ position: 'absolute', left: -8, top: 22, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '8px solid white' }} />
            <button onClick={() => setSelectedExhibit(null)} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: T.sub, fontSize: 14, cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6BAED6', marginBottom: 5 }}>📍 {selectedExhibit.name}</div>
            <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>{selectedExhibit.info}</div>
            <button style={{
              width: '100%', fontSize: 12, fontWeight: 600,
              background: 'linear-gradient(135deg, #6BAED6, #74C476)',
              color: 'white', border: 'none', padding: '8px 0',
              borderRadius: 10, cursor: 'pointer',
            }}>길찾기</button>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 68, left: 0, background: 'rgba(45,50,80,0.55)', color: 'white', fontSize: 11, padding: '3px 10px', borderRadius: '0 8px 8px 0', zIndex: 10 }}>
          {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
        </div>
      </div>

      {/* 상단 칩 */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {EXHIBITS.map(e => (
          <button key={e.id} onClick={() => setSelectedExhibit(selectedExhibit?.id === e.id ? null : e)}
            style={{
              flexShrink: 0, fontSize: 12, padding: '7px 14px', borderRadius: 20,
              border: `1.5px solid ${selectedExhibit?.id === e.id ? '#6BAED6' : T.border}`,
              background: selectedExhibit?.id === e.id ? '#6BAED6' : 'rgba(255,255,255,0.92)',
              color: selectedExhibit?.id === e.id ? 'white' : T.text,
              fontWeight: 500, cursor: 'pointer',
              boxShadow: T.shadow, backdropFilter: 'blur(6px)',
            }}>
            📍 {e.name}
          </button>
        ))}
      </div>

      {/* 하단 검색 */}
      <div style={{ position: 'absolute', bottom: 18, left: 16, right: 16, zIndex: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.95)', borderRadius: 16,
          boxShadow: T.shadowMd, padding: '12px 16px',
          border: `1px solid ${T.border}`, backdropFilter: 'blur(8px)',
        }}>
          <Search size={15} color={T.sub} />
          <input type="text" placeholder="전시물 이름 검색" style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: T.text,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── 주변 전시물 ── */
function ExhibitsSection() {
  const items = [
    { name: 'AI 임베디드 전시', category: '임베디드 / IoT', distance: '5m', color: '#EEF6FB', dot: '#6BAED6' },
    { name: 'ICT 프로젝트 전시', category: 'PBL 프로젝트', distance: '12m', color: '#EDF7EE', dot: '#74C476' },
    { name: '로봇 제어 시연', category: '로보틱스', distance: '28m', color: '#FEF9EC', dot: '#FDAE6B' },
    { name: '스마트 센서 전시', category: '센서 / 하드웨어', distance: '45m', color: '#FEF0F5', dot: '#F768A1' },
  ];
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}>현재 감지된 전시물이에요 👋</p>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px',
          background: T.card, borderRadius: T.radius,
          border: `1.5px solid ${T.border}`, boxShadow: T.shadow,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.name}</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{item.category}</div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600, color: item.dot,
            background: item.color, borderRadius: 8, padding: '4px 10px',
          }}>{item.distance}</div>
        </div>
      ))}
    </div>
  );
}

/* ── AI 도우미 ── */
function ChatSection() {
  const [chatMessage, setChatMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '안녕하세요! 전시물에 대해 궁금한 점을 무엇이든 물어보세요 😊' }
  ]);

  const handleSend = async (textToSend) => {
    const userText = textToSend || chatMessage;
    if (!userText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatMessage('');
    const loadId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadId, sender: 'bot', text: 'Guidant가 생각 중입니다...' }]);
    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages(prev => prev.map(m => m.id === loadId ? { ...m, text: data.reply } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === loadId ? { ...m, text: '서버와 연결이 원활하지 않습니다. 백엔드 서버를 확인해 주세요!' } : m));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 57px)', background: '#F4F6FD' }}>
      {/* 메시지 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '78%', padding: '11px 16px', borderRadius: 18, fontSize: 13, lineHeight: 1.55,
              ...(msg.sender === 'user'
                ? { background: 'linear-gradient(135deg,#6BAED6,#74C476)', color: 'white', borderTopRightRadius: 5, boxShadow: '0 2px 10px rgba(107,174,214,0.35)' }
                : { background: T.card, color: T.text, borderTopLeftRadius: 5, border: `1px solid ${T.border}`, boxShadow: T.shadow }
              ),
            }}>
              {msg.text}
            </div>
            {msg.sender === 'bot' && msg.id === 1 && !isVoiceMode && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 2 }}>
                {['이 전시물은 뭔가요?', '체험 방법 알려줘'].map(chip => (
                  <button key={chip} onClick={() => handleSend(chip)} style={{
                    padding: '6px 13px', background: T.card,
                    border: `1px solid ${T.border}`, borderRadius: 20,
                    fontSize: 11, color: T.text, fontWeight: 500, cursor: 'pointer',
                    boxShadow: T.shadow,
                  }}>{chip}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 입력 */}
      <div style={{
        background: T.card, borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 20px rgba(100,120,180,0.08)',
        padding: '16px 16px 28px',
        position: 'relative',
      }}>
        {isVoiceMode && (
          <div style={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
            <button onClick={() => setIsVoiceMode(false)} style={{
              width: 76, height: 76, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6BAED6,#74C476)',
              border: '4px solid white', boxShadow: T.shadowMd,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Mic size={30} color="white" />
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...(isVoiceMode ? { marginTop: 40, opacity: 0.4, pointerEvents: 'none' } : {}) }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: T.inputBg, borderRadius: 24, padding: '9px 16px', border: `1px solid ${T.border}` }}>
            <input
              type="text" placeholder="메시지 입력" value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: T.text }}
            />
          </div>
          <button onClick={() => handleSend()} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6BAED6,#74C476)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(107,174,214,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ transform: 'rotate(90deg)', marginLeft: 2 }}>
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
          <button onClick={() => setIsVoiceMode(true)} style={{
            width: 40, height: 40, borderRadius: '50%',
            background: T.inputBg, border: `1px solid ${T.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mic size={16} color={T.sub} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 맞춤 추천 ── */
function RecommendSection() {
  const groups = [
    { emoji: '📍', title: '지금 주변 전시물', color: '#EEF6FB', accent: '#6BAED6', items: ['AI 임베디드 실습실 — 현재 수업 진행 중', 'ICT PBL실 — 체험 대여 가능'] },
    { emoji: '🔥', title: '인기 전시물',       color: '#FEF9EC', accent: '#FDAE6B', items: ['스마트 센서 시연 체험', '로봇 제어 & 자율주행 전시'] },
    { emoji: '🎯', title: '관심사 기반 추천',  color: '#FEF0F5', accent: '#F768A1', items: ['임베디드 시스템에 관심 있다면 → A1 구역', '소프트웨어 프로젝트라면 → ICT PBL실'] },
  ];
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}>나에게 딱 맞는 전시물을 찾아봐요 🎉</p>
      {groups.map((g, i) => (
        <div key={i} style={{
          background: T.card, borderRadius: T.radius,
          border: `1.5px solid ${T.border}`, boxShadow: T.shadow,
          overflow: 'hidden',
        }}>
          {/* 헤더 바 */}
          <div style={{ background: g.color, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{g.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: g.accent }}>{g.title}</span>
          </div>
          {/* 아이템 */}
          <div style={{ padding: '10px 16px 14px' }}>
            {g.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.accent, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const SECTION_MAP = { map: MapSection, exhibits: ExhibitsSection, chat: ChatSection, recommend: RecommendSection };

export default function App() {
  const [activePage, setActivePage] = useState(null);
  const ActiveSection = activePage ? SECTION_MAP[activePage] : null;

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, overflowY: 'auto' }}>
      <Header activePage={activePage} onBack={() => setActivePage(null)} />
      <main style={{ maxWidth: 480, margin: '0 auto' }}>
        {activePage === null
          ? <HomeMenu onNavigate={setActivePage} />
          : <ActiveSection />
        }
      </main>
    </div>
  );
}
