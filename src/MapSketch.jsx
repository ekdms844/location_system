import React, { useState, useEffect, useRef } from "react";
import p5 from "p5";
import { io } from "socket.io-client"; 

const showGrid = false;
const CANVAS_WIDTH = 362;
const CANVAS_HEIGHT = 767;

const YOUR_COMPUTER_IP = '25.4.238.217'; 

const mapObjects = [
  { x: 332, y: 84,  w: 30,  h: 111, name: '작품1', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 332, y: 328, w: 30,  h: 111, name: '작품2', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 332, y: 572, w: 30,  h: 111, name: '작품3', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 0,   y: 572, w: 30,  h: 111, name: '작품4', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 0,   y: 328, w: 30,  h: 111, name: '작품5', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 0,   y: 84,  w: 30,  h: 111, name: '작품6', type: 'booth', author: '작가명', desc: '작품 설명' },
  { x: 337, y: 0,   w: 25,  h: 50,  name: '출입문', type: 'door', desc: '전시장 전면 출입구입니다. 통행에 유의해 주세요.' },
  { x: 337, y: 717, w: 25,  h: 50,  name: '출입문', type: 'door', desc: '전시장 후면 출입구 및 비상구입니다.' }
];

const MapSketch = () => {
  const canvasRef = useRef(null);
  const [userPos, setUserPos] = useState({ x: 181, y: 383 });
  const [selectedArtwork, setSelectedArtwork] = useState(null); 
  const p5Instance = useRef(null);

  /* ── 📡 백엔드 웹소켓 실시간 연결 로직 ── */
  useEffect(() => {
    const socket = io(`http://${YOUR_COMPUTER_IP}:3000`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log("🌐 지도 섹션: 백엔드 실시간 소켓 연결 성공!");
    });

    socket.on('location_update', (data) => {
      console.log("📍 실시간 위치 수신 데이터:", data);
      if (data && typeof data.x === 'number' && typeof data.y === 'number') {
        setUserPos({ x: data.x, y: data.y });
      }
    });

    socket.on('disconnect', () => {
      console.log("❌ 지도 섹션: 소켓 연결 끊어짐.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (p5Instance.current && p5Instance.current.updateUserPos) {
      p5Instance.current.updateUserPos(userPos.x, userPos.y);
    }
  }, [userPos]);

  useEffect(() => {
    let myP5;

    if (canvasRef.current) {
      canvasRef.current.innerHTML = ""; 
    }

    const sketch = (p) => {
      let currentX = 181;
      let currentY = 383;

      p.updateUserPos = (x, y) => {
        currentX = x;
        currentY = y;
      };

      p.setup = () => {
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("Inter, system-ui, -apple-system, sans-serif");
      };

      p.draw = () => {
        p.background(248, 249, 250);

        if (showGrid){
          p.stroke(230);
          p.strokeWeight(1);
          for (let x = 0; x < p.width; x += 40) p.line(x, 0, x, p.height);
          for (let y = 0; y < p.height; y += 40) p.line(0, y, p.width, y);
        }

        for (let obj of mapObjects) {
          p.push();

          if (obj.type === 'booth') {
            p.fill(255); 
            p.stroke(218, 222, 229); 
            p.strokeWeight(1.5);
          } else if (obj.type === 'door') {
            p.fill(241, 243, 245); 
            p.stroke(173, 181, 189);
            p.strokeWeight(1);
          } else {
            p.fill(233, 236, 239); 
            p.stroke(206, 212, 218);
            p.strokeWeight(1);
          }

          p.rect(obj.x, obj.y, obj.w, obj.h, 8);

          p.noStroke();
          
          if (obj.w < 50) {
            p.fill(73, 80, 87);
            p.textSize(10.5); 
            p.textStyle(p.BOLD);
            
            let padding = 4;
            let textBoxWidth = obj.w - padding * 2;
            let textBoxHeight = obj.h - padding * 2;
            p.text(obj.name, obj.x + padding, obj.y + padding, textBoxWidth, textBoxHeight);
          } else {
            p.fill(33, 37, 41);
            p.textSize(12);
            p.textStyle(p.BOLD);
            p.text(obj.name, obj.x + obj.w / 2, obj.y + obj.h / 2);
          }

          p.pop(); 
        }

        drawUserMarker(p, currentX, currentY);
      };

      const drawUserMarker = (p, x, y) => {
        p.push();
        let pulse = p.sin(p.frameCount * 0.05) * 6;
        p.fill(0, 122, 255, 40);
        p.noStroke();
        p.circle(x, y, 24 + pulse); // 레이더 퍼지는 효과 애니메이션

        p.fill(0, 122, 255);
        p.stroke(255);
        p.strokeWeight(2);
        p.circle(x, y, 12); // 중앙 고정 파란 점
        p.pop();
      };

      
      // 🌟 [변경 주석] 출입문 팝업 비활성화 로직 반영
      p.mousePressed = () => {
        for (let obj of mapObjects) {
          if (
            p.mouseX >= obj.x &&
            p.mouseX <= obj.x + obj.w &&
            p.mouseY >= obj.y &&
            p.mouseY <= obj.y + obj.h
          ) {
            // 💡 만약 사용자가 클릭한 요소가 '출입문(type: door)'인 경우
            // 팝업창 상태를 변경하지 않고 함수를 조기 종료(return)시켜 팝업이 뜨지 않도록 처리합니다.
            if (obj.type === 'door') {
              return; 
            }

            setSelectedArtwork(obj); // 부스나 칠판일 때만 정상적으로 팝업 데이터 주입
            return; 
          }
        }
      };
    };

    myP5 = new p5(sketch, canvasRef.current);
    p5Instance.current = myP5;

    return () => {
      if (myP5) myP5.remove();
    };
  }, []); 

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px", position: "relative" }}>
      <div ref={canvasRef} style={styles.canvasContainer}></div>

      {/* 고정 팝업창 */}
      {selectedArtwork && (
        <div style={styles.popupCard}>
          <button style={styles.closeBtn} onClick={() => setSelectedArtwork(null)}>✕</button>
          
          <div style={styles.contentContainer}>
            <div style={styles.imgPlaceholder}></div>
            
            <div style={styles.textGroup}>
              <h3 style={styles.title}>
                {selectedArtwork.name}
                {selectedArtwork.author && <span style={styles.author}>{selectedArtwork.author}</span>}
              </h3>
              <p style={styles.desc}>{selectedArtwork.desc}</p>
            </div>
          </div>

          <button style={styles.guideBtn} onClick={() => alert(`${selectedArtwork.name} 안내를 시작합니다.`)}>
            길안내 시작하기
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  canvasContainer: {
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef"
  },
  popupCard: {
    position: "absolute",
    left: "100px",
    top: "70px",
    width: "282px",
    height: "160px",
    backgroundColor: "white",
    padding: "15px 15px 12px 15px",
    borderRadius: "14px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)", 
    border: "1px solid #efefef",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 999,
  },
  closeBtn: {
    position: "absolute", top: "10px", right: "12px",
    background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#ccc",
  },
  contentContainer: {
    display: "flex", gap: "12px", textAlign: "left", flex: 1
  },
  imgPlaceholder: {
    width: "65px", height: "65px", backgroundColor: "#f1f3f5", borderRadius: "8px",
    display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px", color: "#868e96", fontWeight: "bold"
  },
  textGroup: { flex: 1, overflow: "hidden" },
  title: { margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold", color: "#212529" },
  author: { fontSize: "11px", fontWeight: "normal", color: "#868e96", marginLeft: "6px" },
  desc: { margin: 0, fontSize: "11px", color: "#495057", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  guideBtn: {
    width: "100%", padding: "9px", backgroundColor: "#212529", color: "white",
    border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600", marginTop: "8px",
    transition: "background 0.2s"
  }
};

export default MapSketch;