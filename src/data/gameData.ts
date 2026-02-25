import { Divide } from "lucide-react";

export type CharacterId = 'adrian' | 'marcus' | 'daniel' | 'ethan' | 'lucas' | 'julian' | 'victor' | 'oliver' | 'sebastian' | 'player' | 'nurse';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  englishName?: string;
  code: string;
  age: number;
  gender: 'Male' | 'Female';
  height: string;
  species: string;
  appearance: string;
  triggers: string[];
  personality: string;
  habits: string[];
  likes: string[];
  dislikes: string[];
  speechStyle: string;
  diagnosis: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  floor: number;
  color: string; // Hex code for sprite representation
  dialogues: string[];
}

export const PATIENTS: Record<CharacterId, CharacterProfile> = {
  adrian: {
    id: 'adrian',
    name: "에이드리언 베일",
    englishName: "Adrian Vale",
    code: "BW-MDDP-R4-O4-01",
    age: 27,
    gender: "Male",
    height: "185cm",
    species: "하얀 백조",
    appearance: "하얀 머리, 퀭한 검은 눈동자, 다크서클, 뼈가 보이는 상체, 백조날개",
    triggers: ["거울", "심장박동 소리", "장례 관련 단어"],
    personality: "극단적 무기력, 체념형",
    habits: ["손목 맥박 확인", "복부를 누름"],
    likes: ["조용한 공간"],
    dislikes: ["밝은 조명", "창문"],
    speechStyle: "낮고 느림, 단정적",
    diagnosis: "코타르 증후군 (Cotard Delusion)",
    description: "자해 고위험군(🔴). 창문과 거울이 제거된 구역에 배치됨. ECT 치료 대상자로 이동 동선이 짧은 곳에 위치.",
    riskLevel: "Severe",
    floor: 5,
    color: "#E2E8F0", // Slate 200 (White-ish)
    dialogues: [
      "...",
      "이미 끝났어. 살아있는 척할 필요 없어.",
      "가까이 오지 마. 썩는 냄새가 옮을 거야.",
      "맥박이... 뛰지 않아. 확인해 봐."
    ]
  },
  marcus: {
    id: 'marcus',
    name: "마커스 헤일",
    code: "BW-PSY-R3-O3-02",
    age: 30,
    gender: "Male",
    height: "188cm",
    species: "붉은 여우",
    appearance: "붉은 머리, 붉은 눈동자, 붉은 여우귀와 꼬리",
    triggers: ["가족 사진", "면회", "갑작스런 접촉"],
    personality: "경계심 극단적, 폭발적",
    habits: ["타인 얼굴 1cm 거리에서 응시", "상대 냄새 맡음"],
    likes: ["혼자 있는 시간"],
    dislikes: ["교대 시간"],
    speechStyle: "낮고 날 선 단어 선택",
    diagnosis: "카프그라 증후군 (Capgras Delusion)",
    description: "가족과 의료진이 도플갱어로 대체되었다고 믿는다.",
    riskLevel: "High",
    floor: 3,
    color: "#EF4444", // Red 500
    dialogues: [
      "넌 누구지? 진짜 의사는 어디로 보냈어?",
      "냄새가 달라... 넌 그 사람이 아니야.",
      "대답 똑바로 해. 연기는 통하지 않아.",
      "내 가족 사진 치워! 그건 가짜들이야!"
    ]
  },
  daniel: {
    id: 'daniel',
    name: "대니얼 크로우",
    code: "BW-TBI-R3-O2-03",
    age: 27,
    gender: "Male",
    height: "183cm",
    species: "인간",
    appearance: "갈색 곱슬 머리, 검은 눈동자, 지친 눈매",
    triggers: ["거의 없음"],
    personality: "무감각, 탐색적, 위험 인지 둔화",
    habits: ["상처 만짐", "뜨거운 물체 만짐"],
    likes: ["촉감 자극"],
    dislikes: ["제지당하는 것"],
    speechStyle: "감정 없는 질문형",
    diagnosis: "클뤼버-뷰시 증후군 (Klüver-Bucy Syndrome)",
    description: "공포를 느끼지 못하고 위험한 물건을 입에 넣거나 만지려 한다.",
    riskLevel: "High",
    floor: 4,
    color: "#854D0E", // Yellow 800 (Brownish)
    dialogues: [
      "이거... 만져봐도 돼?",
      "아픈 게 왜 문제야?",
      "저기 불이 있네. 따뜻할까?",
      "(당신의 손을 빤히 바라보며 입을 벌린다)"
    ]
  },
  ethan: {
    id: 'ethan',
    name: "이선 무어",
    code: "BW-PSY-R2-O2-04",
    age: 24,
    gender: "Male",
    height: "180cm",
    species: "인간",
    appearance: "검은 머리, 푸른 눈동자",
    triggers: ["직원 교대"],
    personality: "집착적, 예민",
    habits: ["특정 인물 응시", "뒤를 돌아보며 확인"],
    likes: ["동일 복장 유지"],
    dislikes: ["헤어스타일 변화"],
    speechStyle: "속삭이듯 확신",
    diagnosis: "프레골리 망상 (Fregoli Delusion)",
    description: "여러 사람이 사실 한 사람이 변장한 것이라고 믿는다.",
    riskLevel: "Medium",
    floor: 3,
    color: "#3B82F6", // Blue 500
    dialogues: [
      "또 얼굴 바꿨네. 소용없어.",
      "아까 그 간호사지? 옷만 갈아입으면 모를 줄 알았어?",
      "다 한패야. 전부 너잖아.",
      "왜 자꾸 나를 따라다니는 거야?"
    ]
  },
  lucas: {
    id: 'lucas',
    name: "루카스 리드",
    code: "BW-SOM-R3-O3-05",
    age: 26,
    gender: "Male",
    height: "177cm",
    species: "인간",
    appearance: "베이지색 머리카락, 붉은 눈동자, 긁힌 상처 자국",
    triggers: ["가려움", "침대 시트"],
    personality: "예민, 과각성",
    habits: ["피부 긁기", "돋보기 요청"],
    likes: ["차가운 물"],
    dislikes: ["어두운 곳"],
    speechStyle: "급박함",
    diagnosis: "에크봄 증후군 (Ekbom Syndrome)",
    description: "피부 아래 벌레가 기어다닌다고 믿는다.",
    riskLevel: "Medium",
    floor: 3,
    color: "#D6D3D1", // Stone 300
    dialogues: [
      "지금 움직였어. 보여? 왜 너만 못 봐?",
      "이거 봐, 여기 불룩 튀어나왔잖아! 벌레야!",
      "피를 좀 내야겠어... 그래야 놈들이 나와.",
      "침대 시트 밑에도 있어. 다 확인해봤어?"
    ]
  },
  julian: {
    id: 'julian',
    name: "줄리안 포레스트",
    code: "BW-ERO-R3-O2-06",
    age: 20,
    gender: "Male",
    height: "182cm",
    species: "비둘기",
    appearance: "회색 곱슬머리, 금색 눈동자, 회색 비둘기 날개",
    triggers: ["무시", "회피"],
    personality: "집착적, 감정 기복 큼",
    habits: ["편지 작성", "상대 이름 반복"],
    likes: ["눈 맞춤"],
    dislikes: ["차단"],
    speechStyle: "부드럽지만 집요",
    diagnosis: "클레랑보 증후군 (De Clérambault's Syndrome)",
    description: "특정 인물이 자신을 사랑한다고 확신한다.",
    riskLevel: "Medium",
    floor: 4,
    color: "#A8A29E", // Stone 400
    dialogues: [
      "당신도 느꼈잖아요. 거짓말하지 마.",
      "아까 저를 보고 웃으셨죠? 그건 신호였어요.",
      "왜 답장을 안 주시는 거예요? 부끄러워하지 마세요.",
      "우린 운명이에요. 방해하는 것들은 다 없애버릴 거야."
    ]
  },
  victor: {
    id: 'victor',
    name: "빅터 랭",
    code: "BW-BIID-R4-O4-07",
    age: 30,
    gender: "Male",
    height: "186cm",
    species: "사슴",
    appearance: "갈색 긴 머리, 오드아이(좌:적, 우:녹), 사슴뿔, 투명한 왼팔",
    triggers: ["왼팔 접촉"],
    personality: "강박적, 고집",
    habits: ["왼팔 붕대 감기", "팔을 눌러 혈류 차단"],
    likes: ["결박감"],
    dislikes: ["자유로운 움직임"],
    speechStyle: "단호함",
    diagnosis: "신체 무결성 정체성 장애 (BIID)",
    description: "절단 충동이 강함. 날카로운 물건이 완전히 통제된 상태이며 1:1 관찰이 주기적으로 시행됨.",
    riskLevel: "High",
    floor: 5,
    color: "#166534", // Green 700
    dialogues: [
      "이건 내 게 아니야. 떼어내야 맞아.",
      "도끼... 아니면 톱이라도 있어?",
      "이 팔이 나를 죽일 거야. 썩은 가지처럼 잘라내야 해.",
      "왜 나를 불완전한 상태로 두는 거지?"
    ]
  },
  oliver: {
    id: 'oliver',
    name: "올리버 쇼",
    code: "BW-PSY-R2-O2-08",
    age: 22,
    gender: "Male",
    height: "189cm",
    species: "검은 고양이",
    appearance: "오드아이(좌:황, 우:청), 검은 머리, 검은 고양이 꼬리와 귀",
    triggers: ["카메라", "반사면"],
    personality: "과대해 보이나 불안정",
    habits: ["천장 두드림", "벽에 대고 속삭임"],
    likes: ["어두운 공간"],
    dislikes: ["밝은 조명"],
    speechStyle: "연기하듯 과장",
    diagnosis: "트루먼 증후군 (Truman Show Delusion)",
    description: "자신이 거대한 리얼리티 쇼의 주인공이며 감시당한다고 믿는다.",
    riskLevel: "Medium",
    floor: 4,
    color: "#FACC15", // Yellow 400
    dialogues: [
      "시청자들 들리죠? 난 다 알고 있어.",
      "카메라 끄라고 해! 이번 시즌은 끝났어!",
      "저 거울 뒤에 누가 있는지 알아. 나오라고 해.",
      "대본대로 하지는 않을 거야. 내 마음대로 할 거라고."
    ]
  },
  sebastian: {
    id: 'sebastian',
    name: "세바스찬 그레이",
    englishName: "Sebastian Grey",
    code: "BW-MDDP-R4-O4-09",
    age: 28,
    gender: "Male",
    height: "184cm",
    species: "회색 늑대",
    appearance: "회색 눈동자, 회색 곱슬머리, 늑대 귀와 꼬리, 뚫린 복부",
    triggers: ["날카로운 물건 제거 시"],
    personality: "조용, 침잠형, 내향적",
    habits: ["눈 감고 장시간 누워 있음", "식사 거부"],
    likes: ["무음 환경"],
    dislikes: ["질문"],
    speechStyle: "낮고 거의 속삭임",
    diagnosis: "코타르 증후군 + BIID",
    description: "최고 위험군(🔴). 식사 거부와 절단 충동이 동시에 존재. 중앙 감시실 인접 격리 병실에 배치됨.",
    riskLevel: "Severe",
    floor: 6,
    color: "#475569", // Slate 600
    dialogues: [
      "...",
      "남은 건 필요 없어.",
      "왜 시체에게 말을 걸지?",
      "비워내야 해... 전부 다."
    ]
  }
};

export const FLOORS = {
  1: { name: "1F 로비", description: "전면 유리로 된 라운지와 상담 데스크, 보호자 대기 공간이 배치된 공개 구역." },
  2: { name: "2F 보관실", description: "개인 소지품 보관함과 서류 확인실이 있는 통제 구역. 외부 물품 반입 제한." },
  3: { name: "3F 일반 병동 A", description: "관찰 중심 병동 (중위험). 자연 채광이 들어오지만 면회실은 1:1로 통제된다." },
  4: { name: "4F 일반 병동 B", description: "기능 유지 병동. 공동 휴게실과 상담실이 운영되지만 정적만이 감돈다." },
  5: { name: "5F 폐쇄 병동 A", description: "고위험 집중 관리 구역. 조명이 최소화되어 있으며 창문과 거울이 제거되었다." },
  6: { name: "6F 격리 구역", description: "최고 위험 및 장기 격리 구역. 중앙 감시실이 인접해 있으며 빛이 거의 들지 않는다." },
};
