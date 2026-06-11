import React, { useState, useEffect, useRef } from "react";
import p5 from "p5";

const CANVAS_WIDTH = 362;
const CANVAS_HEIGHT = 767;

const mapObjects = [
  { x: 56,  y: 0,   w: 250, h: 40,  name: '칠판' },
  { x: 332, y: 84, w: 30,  h: 111, name: '작품1' },
  { x: 332, y: 328, w: 30,  h: 111, name: '작품2' },
  { x: 332, y: 572, w: 30,  h: 111, name: '작품3' },
  { x: 0,   y: 572, w: 30,  h: 111, name: '작품4' },
  { x: 0,   y: 328, w: 30,  h: 111, name: '작품5' },
  { x: 0,   y: 84, w: 30,  h: 111, name: '작품6' },
  { x: 337,   y: 0, w: 25,  h: 50, name: '출입문' },
  { x: 337,   y: 717, w: 25,  h: 50, name: '출입문' }
];

const MapSketch = () => {
  const canvasRef = useRef(null);
  const [userPos, setUserPos] = useState({ x: 181, y: 383 });
  const p5Instance = useRef(null);

  /* ── 📡 [6.11 add] 백엔드 웹소켓 실시간 연결 로직 ── */
  useEffect(() => {
    // 하마치 망을 통해 팀원의 백엔드 노드 서버와 실시간 통화(웹소켓) 연결 개시
    const socket = io(`http://${YOUR_COMPUTER_IP}:3000`, {
      transports: ['websocket'],
      reconnectionAttempts: 5, // 연결 실패 시 재시도 횟수
    });

    socket.on('connect', () => {
      console.log("🌐 지도 섹션: 백엔드 실시간 소켓 연결 성공!");
    });

    // 안드로이드 앱 -> 백엔드 -> 리액트로 이어지는 위치 업데이트 이벤트를 실시간 수신
    socket.on('location_update', (data) => {
      console.log("📍 실시간 위치 수신 데이터:", data);
      
      // 백엔드에서 전달되는 좌표 데이터(x, y)가 있을 때 사용자 마커 좌표 갱신
      if (data && typeof data.x === 'number' && typeof data.y === 'number') {
        setUserPos({ x: data.x, y: data.y });
      }
    });

    socket.on('disconnect', () => {
      console.log("❌ 지도 섹션: 소켓 연결 끊어짐.");
    });

    // 컴포넌트 창이 닫히면 전화를 깔끔하게 끊어서 메모리 누수 방지
    return () => {
      socket.disconnect();
    };
  }, []);

  // 사용자 위치 업데이트 처리
  useEffect(() => {
    if (p5Instance.current && p5Instance.current.updateUserPos) {
      p5Instance.current.updateUserPos(userPos.x, userPos.y);
    }
  }, [userPos]);

  // p5.js 인스턴스 초기화 및 클린업
  useEffect(() => {
    let myP5; // 로컬 변수로 인스턴스를 관리하여 클린업 안정성 확보

    if (canvasRef.current) {
      canvasRef.current.innerHTML = ""; // 기존 잔재 제거
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
        p.textSize(12);
      };

      p.draw = () => {
        p.background(245);

        // 1) 격자 그리기
        p.stroke(220);
        p.strokeWeight(1);
        for (let x = 0; x < p.width; x += 40) {
          p.line(x, 0, x, p.height);
        }
        for (let y = 0; y < p.height; y += 40) {
          p.line(0, y, p.width, y);
        }

        // 2) 오브젝트 그리기
        for (let obj of mapObjects) {
          p.fill(255);
          p.stroke(100);
          p.strokeWeight(1.5);
          p.rect(obj.x, obj.y, obj.w, obj.h, 4);

          p.fill(50);
          p.noStroke();

          if (obj.w < 50) {
            p.push();
            p.translate(obj.x + obj.w / 2, obj.y + obj.h / 2);
            p.textSize(11);
            p.text(obj.name, 0, 0);
            p.pop();
          } else {
            p.textSize(12);
            p.text(obj.name, obj.x + obj.w / 2, obj.y + obj.h / 2);
          }
        }

        // 3) 사용자 마커 그리기
        drawUserMarker(p, currentX, currentY);
      };

      const drawUserMarker = (p, x, y) => {
        p.push();
        let pulse = p.sin(p.frameCount * 0.05) * 6;
        p.fill(0, 122, 255, 40);
        p.noStroke();
        p.circle(x, y, 24 + pulse);

        p.fill(0, 122, 255);
        p.stroke(255);
        p.strokeWeight(2);
        p.circle(x, y, 12);
        p.pop();
      };

      p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
          setUserPos({ x: p.mouseX, y: p.mouseY });
        }
      };
    };

    // 인스턴스 할당
    myP5 = new p5(sketch, canvasRef.current);
    p5Instance.current = myP5;

    // 컴포넌트 언마운트 또는 재실행 시 확실하게 제거
    return () => {
      if (myP5) {
        myP5.remove();
      }
    };
  }, []); // 의존성 배열을 비워 최초 1회만 실행되게 유도

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div ref={canvasRef}></div>
    </div>
  );
};

export default MapSketch;