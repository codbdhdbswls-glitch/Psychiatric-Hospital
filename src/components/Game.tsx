import React, { useState, useEffect } from 'react';
import { Map } from './Map';
import { Dialog } from './Dialog';
import { Glitch } from './Glitch';
import { Guestbook } from './Guestbook';
import { ObjectViewer } from './ObjectViewer';
import { PATIENTS, FLOORS, CharacterId } from '../data/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Activity } from 'lucide-react';

export const Game = () => {
  const [floor, setFloor] = useState(1);
  const prevFloorRef = React.useRef(floor);
  const [playerPosition, setPlayerPosition] = useState({ x: 6, y: 8 });
  
  interface DialogItem {
    speaker: string;
    text: string;
    options?: string[];
    onSelect?: (index: number) => void;
  }

  const [dialogQueue, setDialogQueue] = useState<DialogItem[]>([]);
  const [isDialogActive, setIsDialogActive] = useState(false);
  const [showProfile, setShowProfile] = useState<CharacterId | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [showElevatorMenu, setShowElevatorMenu] = useState(false);
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Chase Mode State
  const [chaseMode, setChaseMode] = useState(false);
  const [chaserId, setChaserId] = useState<CharacterId | null>(null);
  const [chaserPosition, setChaserPosition] = useState({ x: 10, y: 5 }); // Default start pos
  
  // Guestbook state
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState<string[]>([
    "Dr. J. Doe",
    "M. Hale (Family)",
    "RESTRICTED ACCESS",
    "HELP ME",
    "THEY ARE WATCHING"
  ]);

  // Object Viewer State
  const [objectViewerState, setObjectViewerState] = useState<{
    isOpen: boolean;
    title: string;
    type: 'locker' | 'file';
    items?: string[];
    text?: string;
  }>({
    isOpen: false,
    title: "",
    type: 'locker'
  });

  // Heart rate simulation
  const [heartRate, setHeartRate] = useState(60);
  
  // Random Event Logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Higher chance on dark floors
      const chance = floor >= 5 ? 0.15 : 0.02; 
      
      if (Math.random() < chance && !isDialogActive && !showProfile) {
        setIsGlitching(true);
        // Spike heart rate
        setHeartRate(prev => Math.min(180, prev + 20));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [floor, gameState, isDialogActive, showProfile]);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseRate = floor >= 5 ? 100 : 65;
      const variance = Math.floor(Math.random() * 10) - 5;
      // Slowly return to base rate if not glitching
      setHeartRate(prev => {
          const target = baseRate + variance;
          return prev > target ? prev - 1 : prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [floor]);

  // Flashlight notification
  useEffect(() => {
    if (floor >= 5) {
        const timer = setTimeout(() => {
            startDialog("System", "어두운 구역입니다. 손전등을 켰습니다.");
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [floor]);

  const handleNextDialog = () => {
    if (dialogQueue.length > 1) {
      setDialogQueue(prev => prev.slice(1));
    } else {
      const currentText = dialogQueue[0]?.text;
      setDialogQueue([]);
      setIsDialogActive(false);

      if (gameState === 'gameover') {
          // Return to start screen if game over
          if (currentText === "당신은 죽었습니다.") {
              setGameState('start');
          } else if (currentText === "의식을 잃었습니다.") {
              setGameState('playing');
          }
      }
    }
  };

  const startDialog = (speaker: string, text: string | string[], options?: string[], onSelect?: (index: number) => void) => {
    const lines = Array.isArray(text) ? text : [text];
    const newQueue = lines.map((line, index) => ({
        speaker, 
        text: line,
        // Only attach options to the last line
        options: index === lines.length - 1 ? options : undefined,
        onSelect: index === lines.length - 1 ? onSelect : undefined
    }));
    setDialogQueue(newQueue);
    setIsDialogActive(true);
  };

  // Chase Logic
  useEffect(() => {
    if (!chaseMode || gameState !== 'playing') return;

    const interval = setInterval(() => {
        setChaserPosition(prev => {
            const dx = playerPosition.x - prev.x;
            const dy = playerPosition.y - prev.y;
            
            // Simple pathfinding: move towards player
            let moveX = 0;
            let moveY = 0;

            if (Math.abs(dx) > Math.abs(dy)) {
                moveX = dx > 0 ? 1 : -1;
            } else {
                moveY = dy > 0 ? 1 : -1;
            }

            const newPos = { x: prev.x + moveX, y: prev.y + moveY };

            // Collision with player -> Game Over
            if (newPos.x === playerPosition.x && newPos.y === playerPosition.y) {
                setGameState('gameover');
                setChaseMode(false);
                setChaserId(null);
                if (chaserId === 'sebastian') {
                    startDialog("System", ["잡혔습니다.", "당신은 죽었습니다."]);
                } else {
                    startDialog("System", "의식을 잃었습니다.");
                }
            }

            return newPos;
        });
    }, 600); // Speed of chaser

    return () => clearInterval(interval);
  }, [chaseMode, playerPosition, gameState, chaserId]);

  // Reset chase if player leaves floor (via elevator)
  useEffect(() => {
      if (prevFloorRef.current !== floor) {
          if (chaseMode) {
              setChaseMode(false);
              setChaserId(null);
              if (prevFloorRef.current === 6) {
                  startDialog("System", "6층에서 탈출했습니다.");
              }
          }
          prevFloorRef.current = floor;
      }
  }, [floor, chaseMode]);

  const handleInteract = (targetId: CharacterId | 'elevator' | 'stairs_up' | 'stairs_down' | 'reception' | 'lockers' | 'files' | 'bed' | 'monitor_console' | 'wall' | 'floor' | null) => {
    if (!targetId) return;

    if (targetId === 'elevator') {
      setShowElevatorMenu(true);
      return;
    }

    // Environment Interactions
    if (targetId === 'reception') {
        setShowGuestbook(true);
        return;
    }
    if (targetId === 'lockers') {
        const lockerItems = [
            ["낡은 간호사 유니폼", "이름표 (J. Doe)", "말라비틀어진 샌드위치"],
            ["손전등 (배터리 없음)", "쪽지: '그들이 보고 있다'", "진통제"],
            ["녹슨 열쇠", "가족 사진 (얼굴이 긁혀있음)"],
            ["찢어진 일기장", "부러진 안경"],
            ["피 묻은 붕대", "진정제 (빈 병)"],
            ["구겨진 쪽지: '도망쳐'", "알 수 없는 약병"]
        ];
        // Randomly pick one set of items for variety
        const items = lockerItems[Math.floor(Math.random() * lockerItems.length)];
        
        setObjectViewerState({
            isOpen: true,
            title: "직원 사물함",
            type: 'locker',
            items: items
        });
        return;
    }
    if (targetId === 'files') {
        const records = [
            "기록 #1024\n\n환자: 에이드리언 베일\n상태: 악화\n\n환자는 지속적으로 자신의 신체가 부패하고 있다고 주장함. 거울을 보여주었을 때 극심한 발작 증세를 보임. 5층 격리 구역으로 이동 조치함.",
            "기록 #0991\n\n보안 경고\n\n야간 순찰 시 6층 접근을 엄격히 금지함. 이상 소음이 들리더라도 확인하려 하지 말고 즉시 보안팀에 보고할 것. 특히 '긁는 소리'에 주의.",
            "기록 #1102\n\n실험체 관찰 일지\n\n투약 후 3일 경과. 피험체들의 공격성이 증가하고 있음. 마커스 헤일 환자의 경우 의료진을 '가짜'라고 부르며 공격을 시도함. 구속복 착용 요망."
        ];
        const record = records[Math.floor(Math.random() * records.length)];

        setObjectViewerState({
            isOpen: true,
            title: "기밀 기록",
            type: 'file',
            text: record
        });
        return;
    }
    if (targetId === 'bed') {
        startDialog("System", ["평범한 병원 침대입니다.", "구속구를 최근에 사용한 흔적이 있습니다."]);
        return;
    }
    if (targetId === 'monitor_console') {
        startDialog("System", ["CCTV 모니터입니다.", "대부분의 화면이 지직거립니다.", "잠깐... 구석 화면에 있는 건 나인가?"]);
        return;
    }
    if (targetId === 'plant') {
        startDialog("System", ["플라스틱 화분입니다.", "먼지가 쌓여 있습니다."]);
        return;
    }

    // Generic Interactions
    if (targetId === 'wall') {
        if (floor <= 2) {
            startDialog("System", "차가운 콘크리트 벽입니다.");
        } else if (floor <= 4) {
            startDialog("System", "흰색 페인트가 칠해진 벽입니다. 약간의 얼룩이 보입니다.");
        } else {
            startDialog("System", "방음재가 덧대어진 벽입니다. 긁힌 자국이 가득합니다.");
        }
        return;
    }

    if (targetId === 'floor') {
        // Random flavor text for floor
        const floorTexts = [
            "바닥은 차갑고 딱딱합니다.",
            "먼지 뭉치가 굴러다닙니다.",
            "아무것도 없습니다.",
            "발자국 소리가 유난히 크게 들립니다."
        ];
        // Use deterministic random based on position to avoid flickering text? 
        // Or just random. Random is fine for "interact with everything".
        startDialog("System", floorTexts[Math.floor(Math.random() * floorTexts.length)]);
        return;
    }

    const patient = PATIENTS[targetId as CharacterId];
    if (patient) {
      // Helper to trigger chase
      const triggerChase = (shout: string) => {
          startDialog(patient.name, [shout], undefined, undefined);
          setTimeout(() => {
              setIsGlitching(true);
              setChaseMode(true);
              setChaserId(patient.id);
              
              // Determine spawn position based on NPC ID (must match Map.tsx sorted order)
              let spawnPos = { x: 1, y: 1 };
              switch (patient.id) {
                  case 'ethan': spawnPos = { x: 2, y: 4 }; break;  // Index 0
                  case 'lucas': spawnPos = { x: 9, y: 4 }; break;  // Index 1
                  case 'marcus': spawnPos = { x: 2, y: 8 }; break; // Index 2
                  
                  case 'daniel': spawnPos = { x: 2, y: 4 }; break; // Index 0
                  case 'julian': spawnPos = { x: 9, y: 4 }; break; // Index 1
                  case 'oliver': spawnPos = { x: 2, y: 8 }; break; // Index 2
                  
                  case 'adrian': spawnPos = { x: 1, y: 3 }; break;
                  case 'victor': spawnPos = { x: 10, y: 3 }; break;
                  case 'sebastian': spawnPos = { x: 10, y: 5 }; break;
                  default: 
                      // Fallback based on floor
                      if (patient.floor === 3) spawnPos = { x: 2, y: 4 };
                      if (patient.floor === 4) spawnPos = { x: 2, y: 4 };
                      if (patient.floor === 5) spawnPos = { x: 1, y: 3 };
                      if (patient.floor === 6) spawnPos = { x: 10, y: 5 };
                      break;
              }
              
              setChaserPosition(spawnPos);
              setIsDialogActive(false); 
          }, 1000);
      };

      if (patient.id === 'sebastian') {
          startDialog(patient.name, 
              ["...", "왜 여기 있지?", "혼자 있게 해줘."],
              ["(맥박 확인)", "(팔에 대해 묻기)", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("만지지 마!");
                  else if (index === 1) triggerChase("말했잖아... 혼자 있게 해달라고!");
                  else startDialog(patient.name, "...");
              }
          );
      } else if (patient.id === 'marcus') {
          startDialog(patient.name, 
              ["누가 보냈어?", "너... 뭔가 달라."],
              ["새로 온 간호사 입니다.", "전 진짜입니다.", "(물러나기)"],
              (index) => {
                  if (index === 0) triggerChase("거짓말쟁이! 너도 그놈들 중 하나야!");
                  else startDialog(patient.name, "증명해 봐... 가까이 오지 마.");
              }
          );
      } else if (patient.id === 'ethan') {
          startDialog(patient.name, 
              ["너인 거 다 알아.", "얼굴 좀 그만 바꿔."],
              ["생각하시는 그런 사람 아닙니다.", "접니다.", "(떠나기)"],
              (index) => {
                  if (index === 1) triggerChase("인정했군! 또 너야!");
                  else startDialog(patient.name, "거짓말하지 마.");
              }
          );
      } else if (patient.id === 'lucas') {
          startDialog(patient.name, 
              ["안 보여?", "사방에 있잖아..."],
              ["벌레는 없습니다.", "어디 좀 봅시다.", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("거짓말! 기어다니고 있잖아!");
                  else startDialog(patient.name, "자세히 봐... 피부 밑에...");
              }
          );
      } else if (patient.id === 'julian') {
          startDialog(patient.name, 
              ["날 위해 돌아왔군요.", "그럴 줄 알았어요."],
              ["일하러 왔을 뿐입니다.", "우린 그런 사이가 아닙니다.", "(떠나기)"],
              (index) => {
                  if (index === 1) triggerChase("우리 사랑을 부정하지 마!");
                  else startDialog(patient.name, "쉿, 그렇게 말해야 하는 거 다 알아요.");
              }
          );
      } else if (patient.id === 'daniel') {
          startDialog(patient.name, 
              ["반짝거리네...", "가져도 돼?"],
              ["만지지 마세요.", "자, 여기요.", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("갖고 싶어! 내놔!");
                  else startDialog(patient.name, "헤헤... 따뜻해...");
              }
          );
      } else if (patient.id === 'oliver') {
          startDialog(patient.name, 
              ["카메라 돌고 있나요?", "클로즈업 준비됐어요."],
              ["카메라는 꺼졌습니다.", "이건 현실입니다.", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("컷! 촬영 끝! 저 놈 잡아!");
                  else startDialog(patient.name, "액션!");
              }
          );
      } else if (patient.id === 'adrian') {
          startDialog(patient.name, 
              ["왜 신경 쓰는 거야?", "난 이미 죽었는데."],
              ["당신은 살아있습니다.", "맥박을 확인해보죠.", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("아니야! 썩어가고 있잖아! 냄새 안 나?");
                  else startDialog(patient.name, "맥박이 없어...");
              }
          );
      } else if (patient.id === 'victor') {
          startDialog(patient.name, 
              ["무거워.", "이건 내 게 아니야."],
              ["당신 팔 맞습니다.", "제가 도와드릴 수 없어요.", "(떠나기)"],
              (index) => {
                  if (index === 0) triggerChase("내 거 아니라고! 잘라내 줘!");
                  else startDialog(patient.name, "이거 떼어내는 것 좀 도와줘...");
              }
          );
      } else {
          const randomLine = patient.dialogues[Math.floor(Math.random() * patient.dialogues.length)];
          startDialog(patient.name, randomLine);
      }
    }
  };

  // Check for interaction targets to show hint
  useEffect(() => {
    // This logic is duplicated from Map.tsx interaction check, 
    // ideally Map should bubble this up, but for now we can infer or just let Map handle the actual interaction
    // and we just use this for the visual hint if we want to be precise.
    // However, Map.tsx doesn't export the NPC positions easily.
    // Let's rely on the user pressing space for now, or add a simple "!" if close.
    // We will skip the visual hint for now to keep code clean, or add it later.
  }, [playerPosition, floor]);

  // Save System State
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('lowell_hasSave');
      if (saved === 'true') setHasSave(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (gameState === 'playing') {
        const saveData = {
            floor,
            playerPosition,
            guestbookEntries
        };
        localStorage.setItem('lowell_saveData', JSON.stringify(saveData));
        localStorage.setItem('lowell_hasSave', 'true');
        setHasSave(true);
    }
  }, [floor, playerPosition, guestbookEntries, gameState]);

  const handleNewGame = () => {
      // Reset all state
      setFloor(1);
      setPlayerPosition({ x: 6, y: 8 });
      setGuestbookEntries([
        "Dr. J. Doe",
        "M. Hale (Family)",
        "RESTRICTED ACCESS",
        "HELP ME",
        "THEY ARE WATCHING"
      ]);
      setDialogQueue([]);
      setIsDialogActive(false);
      setChaseMode(false);
      setChaserId(null);
      setGameState('playing');
  };

  const handleContinue = () => {
      const savedDataStr = localStorage.getItem('lowell_saveData');
      if (savedDataStr) {
          try {
              const savedData = JSON.parse(savedDataStr);
              if (savedData.floor) setFloor(savedData.floor);
              if (savedData.playerPosition) setPlayerPosition(savedData.playerPosition);
              if (savedData.guestbookEntries) setGuestbookEntries(savedData.guestbookEntries);
              setGameState('playing');
          } catch (e) {
              console.error("Failed to load save", e);
              handleNewGame(); // Fallback
          }
      }
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-center p-8 crt">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl text-red-600 font-bold mb-8 text-shadow tracking-widest"
        >
          LOWELL
          <br />
          PSYCHIATRIC
        </motion.h1>
        <p className="text-gray-400 mb-12 max-w-md leading-loose font-pixel text-xs md:text-sm">
          당신은 새로 부임한 야간 당직 간호사입니다.
          <br/>
          이제 회진을 시작합니다.
          <br/>
          그들의 망상에 휘말리지 마십시오.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs z-10">
            <button 
                onClick={handleNewGame}
                className="px-8 py-3 bg-transparent border-2 border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white hover:border-white transition-all font-pixel text-xs uppercase tracking-widest"
            >
                새 게임
            </button>
            <button 
                onClick={handleContinue}
                disabled={!hasSave}
                className={`px-8 py-3 bg-transparent border-2 transition-all font-pixel text-xs uppercase tracking-widest ${
                    hasSave 
                    ? 'border-stone-800 text-stone-500 hover:bg-stone-900 hover:text-stone-300 hover:border-stone-600' 
                    : 'border-stone-900 text-stone-800 cursor-not-allowed opacity-50'
                }`}
            >
                이어하기
            </button>
            <button 
                onClick={() => {
                    window.location.reload();
                }}
                className="px-8 py-3 bg-transparent border-2 border-stone-800 text-stone-500 hover:bg-red-900 hover:text-red-500 hover:border-red-900 transition-all font-pixel text-xs uppercase tracking-widest"
            >
                종료
            </button>
        </div>

        <p className="mt-12 text-stone-700 text-[10px] font-pixel z-10">
          v0.1.0 - PREVIEW BUILD
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-neutral-900 flex items-center justify-center overflow-hidden crt relative">
      
      {/* Game Viewport */}
      <div className="relative">
        <Map 
          floor={floor} 
          playerPosition={playerPosition} 
          setPlayerPosition={setPlayerPosition}
          onInteract={handleInteract}
          isDialogActive={isDialogActive || showElevatorMenu || showGuestbook || objectViewerState.isOpen}
          chaseMode={chaseMode}
          chaserPosition={chaserPosition}
          chaserId={chaserId}
        />
        
        {/* Floor Info Overlay */}
        <div className="absolute -top-16 left-0 w-full flex justify-between items-end pb-2">
            <div className="text-stone-400 text-xs">
                <button 
                  onClick={() => setShowElevatorMenu(true)}
                  className="text-white font-bold text-sm hover:text-red-500 cursor-pointer transition-colors"
                >
                  {FLOORS[floor as keyof typeof FLOORS].name}
                </button>
                <div className="text-stone-600 text-[10px] max-w-[200px] leading-tight mt-1">{FLOORS[floor as keyof typeof FLOORS].description}</div>
            </div>
            
            {/* Heart Rate Monitor */}
            <div className="flex items-center gap-2 text-red-500/80">
                <Activity size={16} className="animate-pulse" />
                <span className="font-mono text-xl">{heartRate}</span>
                <span className="text-[10px] text-red-500/50">BPM</span>
            </div>
        </div>

        {/* Controls Hint */}
        <div className="absolute -bottom-8 left-0 text-stone-600 text-[10px] w-full text-center">
            WASD 이동 • SPACE 상호작용
        </div>
      </div>

      {/* Dialog Box */}
      <Dialog 
        isOpen={isDialogActive}
        speaker={dialogQueue[0]?.speaker}
        text={dialogQueue[0]?.text}
        onNext={handleNextDialog}
        options={dialogQueue[0]?.options}
        onSelect={(index) => {
            if (dialogQueue[0]?.onSelect) {
                dialogQueue[0].onSelect(index);
                // After selection, usually we want to close or move to next.
                // If the handler starts a new dialog, it will overwrite queue.
                // If not, we should probably close or go next.
                // Let's assume handler handles it or we call handleNextDialog?
                // Actually, if we select, we probably want to clear the current options.
                // Let's just call handleNextDialog if no new dialog is started?
                // But handler might start a new dialog (response).
                // So we shouldn't auto-advance if queue changed.
            } else {
                handleNextDialog();
            }
        }}
      />

      <Glitch active={isGlitching} onComplete={() => setIsGlitching(false)} />

      <Guestbook 
        isOpen={showGuestbook} 
        onClose={() => setShowGuestbook(false)}
        entries={guestbookEntries}
        onAddEntry={(entry) => setGuestbookEntries(prev => [...prev, entry])}
      />

      <ObjectViewer 
        isOpen={objectViewerState.isOpen}
        onClose={() => setObjectViewerState(prev => ({ ...prev, isOpen: false }))}
        title={objectViewerState.title}
        type={objectViewerState.type}
        items={objectViewerState.items}
        text={objectViewerState.text}
      />

      {/* Elevator Menu */}
      {showElevatorMenu && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-stone-800 border-2 border-stone-600 p-6 w-64">
                <h3 className="text-white mb-4 text-center border-b border-stone-600 pb-2">층 선택</h3>
                <div className="space-y-2">
                    {[6, 5, 4, 3, 2, 1].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                setFloor(f);
                                setPlayerPosition({ x: 5, y: 2 }); // Step out of elevator
                                setShowElevatorMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-red-900 hover:text-white transition-colors ${floor === f ? 'text-red-500 font-bold' : 'text-stone-400'}`}
                        >
                            {f}F - {FLOORS[f as keyof typeof FLOORS].name.split(' ')[1]}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setShowElevatorMenu(false)}
                    className="mt-4 w-full text-center text-stone-500 text-[10px] hover:text-white"
                >
                    취소
                </button>
            </div>
        </div>
      )}

      {/* Patient List / Menu Button (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
            onClick={() => {
                const patientsOnFloor = Object.values(PATIENTS).filter(p => p.floor === floor);
                if (patientsOnFloor.length > 0) {
                    setShowProfile(patientsOnFloor[0].id);
                } else {
                    startDialog("System", "이 구역에 배정된 환자가 없습니다.");
                }
            }}
            className="p-2 bg-stone-800 border border-stone-600 text-stone-300 hover:bg-stone-700 transition-colors"
        >
            <FileText size={20} />
        </button>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-0 right-0 h-full w-full md:w-96 bg-stone-950 border-l-4 border-stone-800 p-6 overflow-y-auto shadow-2xl z-50 font-sans"
            >
                <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
                    <h2 className="text-xl text-red-600 font-bold tracking-widest font-pixel">환자 기록</h2>
                    <button onClick={() => setShowProfile(null)} className="text-stone-500 hover:text-white">✕</button>
                </div>

                {Object.values(PATIENTS).filter(p => p.floor === floor).map(patient => (
                    <div key={patient.id} className="mb-8 border-b border-stone-900 pb-8 last:border-0">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-20 h-20 rounded-sm bg-stone-900 border border-stone-800 flex items-center justify-center text-3xl shadow-inner" style={{ color: patient.color }}>
                                ☠
                            </div>
                            <div className="flex-1">
                                <div className="text-lg font-bold text-stone-200 font-pixel">{patient.name}</div>
                                <div className="text-xs text-stone-500 font-mono mt-1">{patient.englishName}</div>
                                <div className="text-xs text-red-500/70 font-mono mt-1 tracking-wider">{patient.code}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-stone-500 mb-6 font-mono bg-stone-900/50 p-3 rounded">
                            <div>나이: <span className="text-stone-300">{patient.age}</span></div>
                            <div>신장: <span className="text-stone-300">{patient.height}</span></div>
                            <div>위험도: <span className={`font-bold ${patient.riskLevel === 'Severe' || patient.riskLevel === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>{patient.riskLevel}</span></div>
                            <div>종족: <span className="text-stone-300">{patient.species}</span></div>
                        </div>

                        <div className="space-y-4 text-sm text-stone-400">
                            <div>
                                <span className="text-stone-600 text-xs font-bold uppercase tracking-wider block mb-1">진단명</span>
                                <div className="text-stone-300 bg-stone-900/30 p-2 border-l-2 border-stone-700">{patient.diagnosis}</div>
                            </div>
                            <div>
                                <span className="text-stone-600 text-xs font-bold uppercase tracking-wider block mb-1">프로필</span>
                                <div className="text-stone-400 leading-relaxed text-xs">{patient.description}</div>
                            </div>
                            <div>
                                <span className="text-stone-600 text-xs font-bold uppercase tracking-wider block mb-1">트리거</span>
                                <div className="flex flex-wrap gap-2">
                                    {patient.triggers.map(t => (
                                        <span key={t} className="px-2 py-1 bg-red-950/30 text-red-400/80 rounded text-[10px] border border-red-900/20">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
