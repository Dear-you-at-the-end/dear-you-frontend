import React, { useCallback, useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import "./App.css";
import MathMiniGameModal from "./components/MathMiniGameModal";
import EatingGameModal from "./components/EatingGameModal";
import MiniGameModal from "./components/MiniGameModal";
import RunningGameModal from "./components/RunningGameModal";
import CatchBallModal from "./components/CatchBallModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import HeartQuestModal from "./components/HeartQuestModal";
import HospitalGameModal from "./components/HospitalGameModal";
import IntroScreen from "./components/IntroScreen";
import HallwayScene from "./scenes/HallwayScene";
import RoadScene from "./scenes/RoadScene";
import OpeningScene from "./scenes/OpeningScene";
import DevelopmentRoomScene from "./scenes/DevelopmentRoomScene";
import KaimaruScene from "./scenes/KaimaruScene";
import MyRoomScene from "./scenes/MyRoomScene";
import HospitalScene from "./scenes/HospitalScene";
import GroundScene from "./scenes/GroundScene";

const canvasWidth = 1200;
const canvasHeight = 720;

function App() {
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showMathGame, setShowMathGame] = useState(false);
  const [mathGameSolved, setMathGameSolved] = useState(false);
  const [showEatingGame, setShowEatingGame] = useState(false);
  const [eatingGameSolved, setEatingGameSolved] = useState(false);
  const [showRunningGame, setShowRunningGame] = useState(false);
  const [showCatchBall, setShowCatchBall] = useState(false);
  const [showHospitalGame, setShowHospitalGame] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHeartQuest, setShowHeartQuest] = useState(false);
  const [, setIsQuestCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isOpeningScene, setIsOpeningScene] = useState(false);
  const [bgm, setBgm] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [debugWarpOpen, setDebugWarpOpen] = useState(false);
  const [debugTab, setDebugTab] = useState("장소"); // Place | MiniGame
  const [showLyjQuestConfirm, setShowLyjQuestConfirm] = useState(false);
  const [lyjQuestAccepted, setLyjQuestAccepted] = useState(false);
  const [lyjQuestCompleted, setLyjQuestCompleted] = useState(false);
  const [headsetCount, setHeadsetCount] = useState(0);
  const [devLyjMinigameDone, setDevLyjMinigameDone] = useState(false);
  const [devLettersUnlocked, setDevLettersUnlocked] = useState(false);
  const [devBoardUnlocked, setDevBoardUnlocked] = useState(false);
  const [devBoardDone, setDevBoardDone] = useState(false);
  const [devKeyCount, setDevKeyCount] = useState(0);
  const [, setBanToastText] = useState("");
  const [, setRoom104QuestionActive] = useState(false);

  // Quest System
  const [quests, setQuests] = useState([
    { id: 1, text: "103호에 편지를 전달하자", room: "103", completed: false },
    { id: 2, text: "104호에 편지를 전달하자", room: "104", completed: false },
    { id: 3, text: "개발실에 편지를 전달하자", room: "development_room", completed: false },
  ]);
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);

  const [room103MiniGameCompleted, setRoom103MiniGameCompleted] = useState(false);
  const [showScooterAnim, setShowScooterAnim] = useState(false);
  const [showScooterReverse, setShowScooterReverse] = useState(false);
  const [groundCatchBallCompleted, setGroundCatchBallCompleted] = useState(false);
  const [groundItbRunningCompleted, setGroundItbRunningCompleted] = useState(false);
  const checklistTimerRef = useRef(null);
  const [gameMinutes, setGameMinutes] = useState(0);
  const [letterCount, setLetterCount] = useState(21);
  const [writtenCount, setWrittenCount] = useState(0);
  const [npcs, setNpcs] = useState([
    { id: "npc-103-1", name: "신원영", hasLetter: false, hasWritten: false },
    { id: "npc-103-2", name: "김명성", hasLetter: false, hasWritten: false },
    { id: "npc-103-3", name: "박찬우", hasLetter: false, hasWritten: false },
    { id: "npc-104-1", name: "이건", hasLetter: false, hasWritten: false },
    { id: "npc-104-2", name: "임남중", hasLetter: false, hasWritten: false },
    { id: "npc-bsy", name: "배서연", hasLetter: false, hasWritten: false },
    { id: "npc-kys", name: "강예서", hasLetter: false, hasWritten: false },
    { id: "npc-thj", name: "탁한진", hasLetter: false, hasWritten: false },
    { id: "npc-jjw", name: "정재원", hasLetter: false, hasWritten: false },
    { id: "npc-mdh", name: "민동휘", hasLetter: false, hasWritten: false },
    { id: "npc-psj", name: "박성재", hasLetter: false, hasWritten: false },
    { id: "npc-lyj", name: "임유진", hasLetter: false, hasWritten: false },
    { id: "npc-ljy", name: "이준엽", hasLetter: false, hasWritten: false },
    { id: "npc-cyw", name: "최영운", hasLetter: false, hasWritten: false },
    { id: "npc-zhe", name: "전하은", hasLetter: false, hasWritten: false },
    { id: "npc-jjaewoo", name: "정재우", hasLetter: false, hasWritten: false },
    { id: "npc-ajy", name: "안준영", hasLetter: false, hasWritten: false },
    { id: "npc-itb", name: "임태빈", hasLetter: false, hasWritten: false },
    { id: "npc-zhe", name: "박동현", hasLetter: false, hasWritten: false },
    { id: "npc-ljy", name: "이연지", hasLetter: false, hasWritten: false },
    { id: "npc-ajy", name: "안준영", hasLetter: false, hasWritten: false },
    { id: "npc-cyw", name: "최연우", hasLetter: false, hasWritten: false },
    { id: "npc-jjaewoo", name: "이재우", hasLetter: false, hasWritten: false },
  ]);
  const [showWriteConfirm, setShowWriteConfirm] = useState(false);
  const [showLetterWrite, setShowLetterWrite] = useState(false);
  const [letterText, setLetterText] = useState("");
  const [envelopeFrame, setEnvelopeFrame] = useState(1);
  const [writtenLetters, setWrittenLetters] = useState([]);
  const [readingLetters, setReadingLetters] = useState([]); // Subset of letters to read
  const [showLetterRead, setShowLetterRead] = useState(false);

  const letterGroups = React.useMemo(() => {
    const groups = [];
    const map = new Map();
    writtenLetters.forEach((l) => {
      if (!map.has(l.npcId)) {
        map.set(l.npcId, groups.length);
        groups.push({ npcId: l.npcId, letters: [] });
      }
      groups[map.get(l.npcId)].letters.push(l);
    });
    return groups;
  }, [writtenLetters]);
  const [readIndex, setReadIndex] = useState(0);
  const writtenLettersRef = useRef([]);
  const accumulatedTimeRef = useRef(0);
  const gameRef = useRef(null);
  const wheelSfxRef = useRef(null);
  const kaimaruQuestNotifiedRef = useRef(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [showBanToast, setShowBanToast] = useState(false);
  const banToastTimerRef = useRef(null);
  const [banToastVisible, setBanToastVisible] = useState(false);
  const [exitRoomKey, setExitRoomKey] = useState(null);
  const [exitRoomData, setExitRoomData] = useState(null);
  const [interactionTargetId, setInteractionTargetId] = useState(null);
  const [confirmMode, setConfirmMode] = useState("write"); // 'write' | 'give'
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [roomDialogLines, setRoomDialogLines] = useState([]);
  const [roomDialogIndex, setRoomDialogIndex] = useState(0);
  const [roomDialogAction, setRoomDialogAction] = useState(null); // { type: string } | null
  const [showGameGuide, setShowGameGuide] = useState(false);
  const [gameGuideTitle, setGameGuideTitle] = useState("");
  const [gameGuideText, setGameGuideText] = useState("");
  const [gameGuideAction, setGameGuideAction] = useState(null); // { type: string } | null
  const [room103LettersDelivered, setRoom103LettersDelivered] = useState(false);

  const openRoom104BeforeMathDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "이건", portrait: "/assets/common/dialog/ig.png", text: "깜짝아! 이것도 인연인데 너 우리 calculator 테스트 해볼래?" },
      { speaker: "남중", portrait: "/assets/common/dialog/inj.png", text: "하 형 그게 무슨 말이야" },
      { speaker: "이건", portrait: "/assets/common/dialog/ig.png", text: "왜~ 재밌잖아 해볼래?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "startMath" });
    setShowRoomDialog(true);
  }, []);

  const openRoom104AfterMathDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "남중", portrait: "/assets/common/dialog/inj.png", text: "너 꽤 똑똑하구나" },
      { speaker: "이건", portrait: "/assets/common/dialog/ig.png", text: "아 맞다 너 여기 온 목적이 뭐였지?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction(null);
    setShowRoomDialog(true);
  }, []);

  const openGroundCatchBallBeforeDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "편지 배달 왔습니다!" },
      { speaker: "민동휘", portrait: "/assets/common/dialog/mdh.png", text: "어 그건 잘 모르겠고, 일단 캐치볼 한 판 고?" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "어... 네...!" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "startCatchBall" });
    setShowRoomDialog(true);
  }, []);

  const openGroundItbBeforeDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "편지 배달 왔습니다!!" },
      { speaker: "임태빈", portrait: "/assets/common/dialog/main.png", text: "..." },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "러닝 중이라 들리지 않나봐.." },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "openRunningGuide" });
    setShowRoomDialog(true);
  }, []);

  const openRoom103AllDeliveredOutro = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "휴.. 다행히 들키지 않은 것 같아" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "이렇게 다 돌면 혼나진않을거같아 다행이야" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "104호도 바로 옆방이니까 가보자." },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "room103ToHallwayActivate104" });
    setShowRoomDialog(true);
  }, []);

  const openRoom103LeaveBlockedDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "아직 할 일이 남아있어..!" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction(null);
    setShowRoomDialog(true);
  }, []);

  const openRoom104HallEntryDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "편지배달왔습니다!" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "잠잠하다.." },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "방에있는게 맞나?" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "문이 살짝 열려있네? 들어가볼까..?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "enterRoom104FromHallway" });
    setShowRoomDialog(true);
  }, []);

  const openRoom104LeaveBlockedDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "아직 할 일이 남아있어..." },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction(null);
    setShowRoomDialog(true);
  }, []);

  const openRoom104AllDeliveredOutro = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "음.. 이제 개발실로 가야하나?" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "근데 너무 배가 고파... 밥은 먹고 살아야지..." },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "카이마루라는 곳에서 밥을 먹을 수 있는 것 같던데.. 가볼까?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "room104ToKaimaruConfirm" });
    setShowRoomDialog(true);
  }, []);

  const openPre103GateDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "우선 103호에 가보자...." },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction(null);
    setShowRoomDialog(true);
  }, []);

  const openDevRoomIntroDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "편지 배달왔습니다!" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "편지 배달왔습니다!!" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction(null);
    setShowRoomDialog(true);
  }, []);

  const openDevLyjHeadsetDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "임유진", portrait: "/assets/common/dialog/lyj.png", text: "아 어떡해 내 헤드셋.. 어디 갔지..." },
      { speaker: "임유진", portrait: "/assets/common/dialog/lyj.png", text: "편지고 뭐고 헤드셋부터 찾아줘" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "헤드셋…? 내가 왜 찾아줘야하는진 모르겠지만 일단 찾아볼까?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "openDevHeadsetGuide" });
    setShowRoomDialog(true);
  }, []);

  const openDevLyjThanksDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "임유진", portrait: "/assets/common/dialog/lyj.png", text: "너무 감사합니다~~" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "devEnableLyjDelivery" });
    setShowRoomDialog(true);
  }, []);

  const openDevAllDeliveredDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "어..? 근데 아직 편지가 남았는데.." },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "칠판에 뭐가 써있네..?" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "devUnlockBoard" });
    setShowRoomDialog(true);
  }, []);

  const openDevBoardInteractDialog = useCallback(() => {
    setRoomDialogLines([
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "차가 없는데 병원까지 어떻게 가지..." },
      { speaker: "준엽", portrait: "/assets/common/dialog/ljy.png", text: "아 유진이 헤드셋도 찾아주셨으니 제 스쿠터 빌려드릴게요!" },
      { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "정말요? 감사합니다!!" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "devGiveKey" });
    setShowRoomDialog(true);
  }, []);

  const openKaimaruStoryDialog = useCallback(() => {
    const mainPortrait = "/assets/common/dialog/main.png";
    const portraitFor = (speaker) => {
      if (speaker === "배서연") return "/assets/common/dialog/bsy.png";
      if (speaker === "강예서") return "/assets/common/dialog/kys.png";
      if (speaker === "한진") return "/assets/common/dialog/thj.png";
      return mainPortrait;
    };
    setRoomDialogLines([
      { speaker: "배서연", portrait: portraitFor("배서연"), text: "한진아 썰 좀 더 풀어봐" },
      { speaker: "나", portrait: portraitFor("나"), text: "한진...? 내가 편지 전달할 사람 중에도 한진이라는 이름이 있었던 것 같은데" },
      { speaker: "한진", portrait: portraitFor("한진"), text: "아니 서연누나. mt 가서 다 풀어준다니까?" },
      { speaker: "나", portrait: portraitFor("나"), text: "서연..? 서연도 있었던 것 같은데.." },
      { speaker: "나", portrait: portraitFor("나"), text: "혹시 저 사람들이 편지를 전달해주어야 할 사람들인건가?" },
      { speaker: "나", portrait: portraitFor("나"), text: "어..!! 잠시만요! 편지 배달 왔어요!!" },
      { speaker: "배서연", portrait: portraitFor("배서연"), text: "감사합니다 ㅎㅎ" },
      { speaker: "배서연", portrait: portraitFor("배서연"), text: "예서야 동휘랑 성재 운동장에서 캐치볼하고 있다는데 구경 가는 거 어때?" },
      { speaker: "강예서", portrait: portraitFor("강예서"), text: "오 좋다!! 태빈이도 러닝하고 있는 것 같더라" },
      { speaker: "나", portrait: portraitFor("나"), text: "(성재, 동휘, 태빈...? 모두 편지 전달해야 할 사람들이잖아!)" },
      { speaker: "나", portrait: portraitFor("나"), text: "(운동장으로 가보자!!)" },
    ]);
    setRoomDialogIndex(0);
    setRoomDialogAction({ type: "kaimaruToGround" });
    setShowRoomDialog(true);
  }, []);

  const debugCompleteLettersForPlace = useCallback((place) => {
    const placeNpcMap = {
      Room103: ["npc-103-1", "npc-103-2", "npc-103-3"],
      Room104: ["npc-104-1", "npc-104-2"],
      Ground: ["npc-mdh", "npc-psj", "npc-itb"],
      Kaimaru: ["npc-bsy", "npc-kys", "npc-thj", "npc-jjw"],
      DevelopmentRoom: [
        "npc-lyj",
        "npc-ljy",
        "npc-zhe",
        "npc-ajy",
        "npc-cyw",
        "npc-jjaewoo",
      ],
    };

    const targetIds = placeNpcMap[place];
    if (!targetIds) return;

    setNpcs((prev) =>
      prev.map((n) =>
        targetIds.includes(n.id)
          ? { ...n, hasLetter: true, hasWritten: true }
          : n
      )
    );

    setWrittenLetters((prev) => {
      const next = prev.filter((l) => !targetIds.includes(l.npcId));
      if (next.length !== prev.length) {
        try {
          localStorage.setItem("writtenLetters", JSON.stringify(next));
        } catch {
          // Ignore localStorage errors
        }
      }
      setWrittenCount(next.length);
      return next;
    });

    if (place === "Room103") {
      setRoom103MiniGameCompleted(true);
      setRoom103LettersDelivered(true);
      setRoom104QuestionActive(true);
      setQuests((prev) =>
        prev.map((q) => (q.room === "103" ? { ...q, completed: true } : q))
      );
      setCurrentQuestIndex((prev) => Math.max(prev, 1));
      if (gameRef.current) {
        gameRef.current.registry.set("room103MiniGameCompleted", true);
        gameRef.current.registry.set("room103LettersDelivered", true);
        gameRef.current.registry.set("room104QuestionActive", true);
      }
      return;
    }

    if (place === "Room104") {
      setMathGameSolved(true);
      setQuests((prev) =>
        prev.map((q) => (q.room === "104" ? { ...q, completed: true } : q))
      );
      setCurrentQuestIndex((prev) => Math.max(prev, 2));
      return;
    }

    if (place === "Ground") {
      setGroundCatchBallCompleted(true);
      setGroundItbRunningCompleted(true);
      if (gameRef.current) {
        gameRef.current.registry.set("groundCatchBallCompleted", true);
        gameRef.current.registry.set("groundItbRunningCompleted", true);
        gameRef.current.registry.set("mdhHasLetter", true);
        gameRef.current.registry.set("psjHasLetter", true);
        gameRef.current.registry.set("itbHasLetter", true);
      }
      return;
    }

    if (place === "Kaimaru") {
      setEatingGameSolved(true);
      window.dispatchEvent(new CustomEvent("kaimaru-quest-complete"));
      return;
    }

    if (place === "DevelopmentRoom") {
      setLyjQuestAccepted(true);
      setLyjQuestCompleted(true);
      setHeadsetCount(0);
      setQuests((prev) =>
        prev.map((q) =>
          q.room === "development_room" ? { ...q, completed: true } : q
        )
      );
      setCurrentQuestIndex((prev) => Math.max(prev, 2));
      if (gameRef.current) {
        gameRef.current.registry.set("lyjQuestAccepted", true);
        gameRef.current.registry.set("lyjQuestCompleted", true);
        gameRef.current.registry.set("headsetCount", 0);
      }
    }
  }, []);

  const playWheelSfx = () => {
    const url = "/assets/common/scooter_wheel.mp3";
    try {
      if (!wheelSfxRef.current) {
        wheelSfxRef.current = new Audio(url);
      }
      wheelSfxRef.current.currentTime = 0;
      wheelSfxRef.current.play().catch(() => { });
    } catch {
      // ignore audio errors
    }
  };

  const inventoryConfig = {
    slots: 7,
    width: 392,
    height: 82,
    slotSize: 40,
    gap: 14,
    padX: 14,
    padY: 12,
  };
  const KEY_SLOT = inventoryConfig.slots - 2;
  const HEADSET_SLOT = inventoryConfig.slots - 1;
  const letterPaper = {
    width: 330,
    height: 390,
    padX: 30,
    padTop: 45,
    padBottom: 40,

  };

  useEffect(() => {
    const audio = new Audio("/assets/common/bgm.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    setBgm(audio);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const handleBanToast = () => {
      setShowBanToast(true);
      setBanToastVisible(true);
      if (banToastTimerRef.current) {
        clearTimeout(banToastTimerRef.current);
      }
      banToastTimerRef.current = setTimeout(() => {
        setBanToastVisible(false);
        setTimeout(() => setShowBanToast(false), 300);
      }, 1200);
    };
    window.addEventListener("ban-door", handleBanToast);
    const handleBanToastText = (e) => {
      const text = e.detail?.text;
      if (typeof text === "string" && text.trim()) {
        setBanToastText(text.trim());
      } else {
        setBanToastText("들어갈 수 없는 곳 같아..");
      }
      handleBanToast();
    };
    window.addEventListener("ban-door-text", handleBanToastText);
    return () => {
      window.removeEventListener("ban-door", handleBanToast);
      window.removeEventListener("ban-door-text", handleBanToastText);
      if (banToastTimerRef.current) {
        clearTimeout(banToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleExitConfirm = (e) => {
      const key = e.detail?.roomKey ?? e.detail?.key;

      // Gate optional areas until Room103 quest is completed.
      if (
        (key === "EnterKaimaru" || key === "EnterGround") &&
        !room103LettersDelivered
      ) {
        openPre103GateDialog();
        return;
      }

      setExitRoomKey(key);
      setExitRoomData(e.detail ?? null);
      setShowExitConfirm(true);
    };
    window.addEventListener("open-exit-confirm", handleExitConfirm);
    return () =>
      window.removeEventListener("open-exit-confirm", handleExitConfirm);
  }, [room103LettersDelivered, openPre103GateDialog]);

  useEffect(() => {
    const handleRoom104HallEntry = () => {
      openRoom104HallEntryDialog();
    };
    window.addEventListener("open-room104-hall-entry", handleRoom104HallEntry);
    return () =>
      window.removeEventListener(
        "open-room104-hall-entry",
        handleRoom104HallEntry,
      );
  }, [openRoom104HallEntryDialog]);

  useEffect(() => {
    const onDevIntro = () => {
      if (devBoardDone) return;
      openDevRoomIntroDialog();
    };
    const onDevAllDelivered = () => {
      if (devBoardUnlocked || devBoardDone) return;
      openDevAllDeliveredDialog();
    };
    const onDevBoardInteract = () => {
      if (!devBoardUnlocked || devBoardDone) return;
      openDevBoardInteractDialog();
    };
    window.addEventListener("open-devroom-intro", onDevIntro);
    window.addEventListener("dev-all-delivered", onDevAllDelivered);
    window.addEventListener("dev-board-interact", onDevBoardInteract);
    return () => {
      window.removeEventListener("open-devroom-intro", onDevIntro);
      window.removeEventListener("dev-all-delivered", onDevAllDelivered);
      window.removeEventListener("dev-board-interact", onDevBoardInteract);
    };
  }, [
    devBoardDone,
    devBoardUnlocked,
    openDevAllDeliveredDialog,
    openDevBoardInteractDialog,
    openDevRoomIntroDialog,
  ]);

  useEffect(() => {
    const handleOpenLyjQuest = () => {
      if (!lyjQuestAccepted && !lyjQuestCompleted) {
        setShowLyjQuestConfirm(true);
      }
    };
    const handleFindHeadset = () => {
      if (lyjQuestAccepted && !lyjQuestCompleted) {
        // Play Ta-da sound
        const audio = new Audio("/assets/common/quest_complete.mp3"); // Assuming this exists or similar
        audio.volume = 0.5;
        audio.play().catch(() => { });

        setHeadsetCount(1);
        setSelectedSlot(HEADSET_SLOT);

        setRoomDialogLines([
          { speaker: "나", portrait: "/assets/common/dialog/main.png", text: "헤드셋을 찾았다! (우클릭으로 전달하자)" }
        ]);
        setRoomDialogIndex(0);
        setRoomDialogAction(null);
        setShowRoomDialog(true);
      }
    };

    const handleCompleteLyjQuest = () => {
      if (!lyjQuestCompleted && headsetCount > 0) {
        setHeadsetCount(0);
        setLyjQuestCompleted(true);
        setQuests((prevQuests) =>
          prevQuests.map((q) =>
            q.room === "development_room" ? { ...q, completed: true } : q
          )
        );
        if (gameRef.current) {
          gameRef.current.registry.set("lyjQuestCompleted", true);
          gameRef.current.registry.set("headsetCount", 0);
        }
      }
    };

    window.addEventListener("open-lyj-quest", handleOpenLyjQuest);
    window.addEventListener("find-lyj-headset", handleFindHeadset);
    window.addEventListener("complete-lyj-quest", handleCompleteLyjQuest);
    return () => {
      window.removeEventListener("open-lyj-quest", handleOpenLyjQuest);
      window.removeEventListener("find-lyj-headset", handleFindHeadset);
      window.removeEventListener("complete-lyj-quest", handleCompleteLyjQuest);
    };
  }, [lyjQuestAccepted, lyjQuestCompleted, headsetCount, HEADSET_SLOT]);

  useEffect(() => {
    const onOpeningStart = () => setIsOpeningScene(true);
    const onOpeningEnd = () => {
      setIsOpeningScene(false);
      setChecklistOpen(true);
      if (checklistTimerRef.current) clearTimeout(checklistTimerRef.current);
      checklistTimerRef.current = setTimeout(() => {
        setChecklistOpen(false);
      }, 5000);
    };
    window.addEventListener("opening-start", onOpeningStart);
    window.addEventListener("opening-end", onOpeningEnd);
    return () => {
      window.removeEventListener("opening-start", onOpeningStart);
      window.removeEventListener("opening-end", onOpeningEnd);
    };
  }, []);

  useEffect(() => {
    if (showIntro) setIsOpeningScene(false);
  }, [showIntro]);

  useEffect(() => {
    const handleMove = (event) => {
      setCursorPos({ x: event.clientX, y: event.clientY });
    };
    const handleDown = () => setIsHolding(true);
    const handleUp = () => setIsHolding(false);
    const handleBlur = () => setIsHolding(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const handleRoom103MiniGameStart = () => {
      if (!room103MiniGameCompleted) {
        setShowMiniGame(true);
      }
    };
    const handleHospitalGameStart = () => {
      setShowHospitalGame(true);
    };
    window.addEventListener("room-103-minigame-start", handleRoom103MiniGameStart);
    window.addEventListener("start-hospital-game", handleHospitalGameStart);
    window.addEventListener("start-eating-game", () => setShowEatingGame(true));
    return () => {
      window.removeEventListener("room-103-minigame-start", handleRoom103MiniGameStart);
      window.removeEventListener("start-hospital-game", handleHospitalGameStart);
      window.removeEventListener("start-eating-game", () => setShowEatingGame(true));
    };
  }, [room103MiniGameCompleted]);

  const handleChecklistClick = useCallback(() => {
    if (checklistTimerRef.current) {
      clearTimeout(checklistTimerRef.current);
    }
    setChecklistOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        checklistTimerRef.current = setTimeout(() => {
          setChecklistOpen(false);
        }, 2400);
      }
      return nextOpen;
    });
  }, []);

  // Auto-show quest modal when quests are updated
  useEffect(() => {
    const completedCount = quests.filter(q => q.completed).length;

    // Show modal when a quest is completed (but not on initial load)
    if (completedCount > 0) {
      setChecklistOpen(true);

      if (checklistTimerRef.current) {
        clearTimeout(checklistTimerRef.current);
      }

      checklistTimerRef.current = setTimeout(() => {
        setChecklistOpen(false);
      }, 3000);
    }
  }, [quests]);

  const transitionToScene = useCallback((sceneKey, data) => {
    const game = gameRef.current;
    if (!game || !sceneKey) return;

    // Stop all active scenes
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach((scene) => game.scene.stop(scene.scene.key));

    // Start target scene instantly
    game.scene.start(sceneKey, data);
  }, []);

  useEffect(() => {
    const handleBusEnter = () => {
      // Play engine sound effect
      const engineSound = new Audio("/assets/common/scooter_wheel.mp3");
      engineSound.volume = 0.5;
      engineSound.play().catch(() => { });

      // Transition to Development Room after a short delay
      setTimeout(() => {
        transitionToScene("DevelopmentRoom");
      }, 500);
    };
    window.addEventListener("bus-enter", handleBusEnter);
    return () => {
      window.removeEventListener("bus-enter", handleBusEnter);
    };
  }, [transitionToScene]);

  const handleWarp = useCallback(
    (sceneKey, data) => {
      transitionToScene(sceneKey, data);
      setDebugWarpOpen(false);
    },
    [transitionToScene],
  );

  const handleIntroStart = useCallback(() => {
    setShowIntro(false);
    if (!bgm) return;
    const playPromise = bgm.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => { });
    }
  }, [bgm]);

  useEffect(() => {
    if (showIntro) {
      setGameMinutes(0);
      accumulatedTimeRef.current = 0;
      return;
    }

    // 30 real minutes = 9 game hours (540 minutes)
    // 540 game mins / 1800 real seconds = 0.3 game mins per real second
    const gameMinutesPerRealSecond = 0.3;

    const tick = () => {
      // Pause conditions
      if (showMiniGame || showMathGame || showRoomDialog || showWriteConfirm || showLetterWrite || showLetterRead) {
        return;
      }
      accumulatedTimeRef.current += gameMinutesPerRealSecond;
      // Round down to nearest 10 minutes
      const steps = Math.floor(accumulatedTimeRef.current / 10) * 10;
      setGameMinutes(Math.min(540, steps));
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [showIntro, showMiniGame, showMathGame, showRoomDialog, showWriteConfirm, showLetterWrite, showLetterRead]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showIntro) return;
    const handleWheel = (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      setSelectedSlot((prev) => {
        const next = (prev + direction + inventoryConfig.slots) % inventoryConfig.slots;
        return next;
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [showIntro, inventoryConfig.slots]);

  useEffect(() => {
    if (!showLetterWrite) return;
    setEnvelopeFrame(1);
    const t1 = setTimeout(() => setEnvelopeFrame(2), 500);
    const t2 = setTimeout(() => setEnvelopeFrame(3), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showLetterWrite]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleInteract = (e) => {
      const { npcId } = e.detail;
      if ((npcId === "npc-104-1" || npcId === "npc-104-2") && !gameStateRef.current.getMathGameSolved()) {
        openRoom104BeforeMathDialog();
        return;
      }
      if (npcId === "npc-itb") {
        if (!groundItbRunningCompleted) {
          openGroundItbBeforeDialog();
          return;
        }
      }
      if (npcId === "npc-mdh" || npcId === "npc-psj") {
        if (!groundCatchBallCompleted) {
          openGroundCatchBallBeforeDialog();
          return;
        }
      }
      const devNpcIds = [
        "npc-cyw",
        "npc-lyj",
        "npc-zhe",
        "npc-jjaewoo",
        "npc-ajy",
        "npc-ljy",
      ];
      if (devNpcIds.includes(npcId) && !devLettersUnlocked) {
        if (npcId === "npc-lyj" && !devLyjMinigameDone) {
          openDevLyjHeadsetDialog();
        }
        return;
      }

      const kaimaruNpcIds = ["npc-bsy", "npc-kys", "npc-thj", "npc-jjw"];
      if (kaimaruNpcIds.includes(npcId)) {
        if (!gameStateRef.current.getEatingGameSolved()) {
          // Maybe show a dialog saying "We are eating..." or literally just do nothing/block interaction?
          // User said: "Success -> plz.png disappears -> able to give letter"
          // So here we likely just block interactions or show a small hint.
          // For now, let's block or trigger the start hint if needed, but minigame is on table.
          // Let's just block interaction effectively.
          return;
        }
      }

      const currentQuestRoom = gameStateRef.current.getCurrentQuestRoom?.();
      const npcRoom = npcId?.includes("npc-103")
        ? "103"
        : npcId?.includes("npc-104")
          ? "104"
          : npcId === "npc-lyj" ||
              npcId === "npc-ljy" ||
              npcId === "npc-cyw" ||
              npcId === "npc-zhe" ||
              npcId === "npc-jjaewoo" ||
              npcId === "npc-ajy"
            ? "development_room"
            : null;
      if (npcRoom && currentQuestRoom && npcRoom !== currentQuestRoom) {
        return;
      }

      const npcState = gameStateRef.current.getNpcState(npcId);
      if (!npcState) return;

      const { hasLetter, hasWritten } = npcState;
      const letterCount = gameStateRef.current.getLetterCount();
      const selectedSlot = gameStateRef.current.getSelectedSlot();
      const writtenCount = gameStateRef.current.getWrittenCount();
      if (selectedSlot === HEADSET_SLOT) {
        return;
      }
      if (selectedSlot === KEY_SLOT) {
        return;
      }

      // Write logic: Empty hands (slot 0) and no letter yet
      if (!hasLetter && !hasWritten && letterCount > 0 && selectedSlot === 0) {
        setInteractionTargetId(npcId);
        setConfirmMode("write");
        setShowWriteConfirm(true);
      }
      // Give logic: Selecting a letter group
      else if (!hasLetter && writtenCount > 0 && selectedSlot !== 0) {
        const groups = gameStateRef.current.getLetterGroups();
        const group = groups[selectedSlot - 1]; // slot 0 is paper, so index is slot-1

        if (group && group.npcId === npcId) {
          setInteractionTargetId(npcId);
          setConfirmMode("give");
          setShowWriteConfirm(true);
        } else {
          // Wrong letter or empty slot selected
          // Optional: alert("이 편지는 이 사람에게 줄 수 없습니다.");
        }
      }
      // Already wrote but not given, and holding paper?
      else if (hasWritten && !hasLetter && selectedSlot === 0) {
        // Keep silent until a written letter slot is selected.
      }
    };

    window.addEventListener("interact-npc", handleInteract);
    return () => window.removeEventListener("interact-npc", handleInteract);
  }, [
    openRoom104BeforeMathDialog,
    openGroundCatchBallBeforeDialog,
    groundCatchBallCompleted,
    openGroundItbBeforeDialog,
    groundItbRunningCompleted,
    devLettersUnlocked,
    devLyjMinigameDone,
    openDevLyjHeadsetDialog,
  ]);

  useEffect(() => {
    const handleKaimaruStory = () => {
      openKaimaruStoryDialog();
    };
    window.addEventListener("open-kaimaru-story", handleKaimaruStory);
    return () => window.removeEventListener("open-kaimaru-story", handleKaimaruStory);
  }, [openKaimaruStoryDialog]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("writtenLetters");
      if (saved) {
        const parsed = JSON.parse(saved);
        setWrittenLetters(parsed);
        if (Array.isArray(parsed)) {
          setWrittenCount(parsed.length);
          setNpcs((prev) =>
            prev.map((n) => ({
              ...n,
              hasWritten: parsed.some((l) => l.npcId === n.id),
            }))
          );
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    writtenLettersRef.current = writtenLetters;
  }, [writtenLetters]);

  useEffect(() => {
    const kaimaruDone = quests.find((q) => q.room === "kaimaru")?.completed;
    if (kaimaruDone && !kaimaruQuestNotifiedRef.current) {
      kaimaruQuestNotifiedRef.current = true;
      window.dispatchEvent(new CustomEvent("kaimaru-quest-complete"));
    }
  }, [quests]);


  const gameStateRef = useRef({
    isMiniGameOpen: false,
    setShowMiniGame: setShowMiniGame,
    setShowExitConfirm: setShowExitConfirm,
    setShowWriteConfirm: setShowWriteConfirm,
    setShowLetterWrite: setShowLetterWrite,
    getSelectedSlot: () => selectedSlot,
    getLetterCount: () => letterCount,
    getWrittenCount: () => writtenCount,
    getCurrentQuestRoom: () => quests[currentQuestIndex]?.room,
    getNpcState: (id) => npcs.find((n) => n.id === id),
    setNpcHasLetter: (id) =>
      setNpcs((prev) => prev.map((n) => (n.id === id ? { ...n, hasLetter: true } : n))),
    setNpcWritten: (id) => {
      setNpcs((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, hasWritten: true } : n));

        // Check if quest should be completed
        const npc = prev.find(n => n.id === id);
        if (npc) {
          const roomNumber = npc.id.includes("103") ? "103" : npc.id.includes("104") ? "104" : null;
          if (roomNumber) {
            const roomNpcs = updated.filter(n => n.id.includes(roomNumber));
            const allCompleted = roomNpcs.every(n => n.hasWritten);

            if (allCompleted) {
              // Mark quest as completed
              setQuests(prevQuests => prevQuests.map(q =>
                q.room === roomNumber ? { ...q, completed: true } : q
              ));

              // Move to next quest after delay
              setTimeout(() => {
                setCurrentQuestIndex(prev => Math.min(prev + 1, 2)); // Max index 2 for 3 quests
              }, 1000);
            }
          }
        }

        return updated;
      });
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showIntro) return; // Do not initialize game until intro is done
    gameStateRef.current.isMiniGameOpen =
      showMiniGame || showMathGame || showRoomDialog || showWriteConfirm || showLetterWrite || showLetterRead;
    gameStateRef.current.getSelectedSlot = () => selectedSlot;
    gameStateRef.current.getLetterCount = () => letterCount;
    gameStateRef.current.getWrittenCount = () => writtenCount;
    gameStateRef.current.getNpcState = (id) => npcs.find((n) => n.id === id);
    gameStateRef.current.getLetterGroups = () => letterGroups;
    gameStateRef.current.getMathGameSolved = () => mathGameSolved;
    gameStateRef.current.getEatingGameSolved = () => eatingGameSolved;
    gameStateRef.current.setShowMathGame = setShowMathGame;
    if (gameRef.current) {
      const devNpcIds = ["npc-cyw", "npc-lyj", "npc-zhe", "npc-jjaewoo", "npc-ajy", "npc-ljy"];
      const devAllLettersDelivered = devNpcIds.every(
        (id) => npcs.find((n) => n.id === id)?.hasLetter,
      );
      gameRef.current.registry.set("selectedSlot", selectedSlot);
      gameRef.current.registry.set("letterCount", letterCount);
      gameRef.current.registry.set("writtenCount", writtenCount);
      gameRef.current.registry.set("writtenLetters", writtenLetters);
      gameRef.current.registry.set("room103MiniGameCompleted", room103MiniGameCompleted);
      gameRef.current.registry.set("eatingGameSolved", eatingGameSolved);
      gameRef.current.registry.set("headsetCount", headsetCount);
      gameRef.current.registry.set("lyjQuestAccepted", lyjQuestAccepted);
      gameRef.current.registry.set("lyjQuestCompleted", lyjQuestCompleted);
      gameRef.current.registry.set(
        "currentQuestRoom",
        quests[currentQuestIndex]?.room ?? null,
      );
      gameRef.current.registry.set(
        "uiBlocked",
        gameStateRef.current.isMiniGameOpen,
      );
      gameRef.current.registry.set(
        "groundCatchBallCompleted",
        groundCatchBallCompleted,
      );
      gameRef.current.registry.set(
        "groundItbRunningCompleted",
        groundItbRunningCompleted,
      );
      gameRef.current.registry.set(
        "mdhHasLetter",
        npcs.find((n) => n.id === "npc-mdh")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "psjHasLetter",
        npcs.find((n) => n.id === "npc-psj")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "itbHasLetter",
        npcs.find((n) => n.id === "npc-itb")?.hasLetter ?? false,
      );
      gameRef.current.registry.set("devLyjMinigameDone", devLyjMinigameDone);
      gameRef.current.registry.set("devLettersUnlocked", devLettersUnlocked);
      gameRef.current.registry.set("devAllLettersDelivered", devAllLettersDelivered);
      gameRef.current.registry.set("devBoardUnlocked", devBoardUnlocked);
      gameRef.current.registry.set("devBoardDone", devBoardDone);
      gameRef.current.registry.set("devKeyCount", devKeyCount);
      gameRef.current.registry.set(
        "cywHasLetter",
        npcs.find((n) => n.id === "npc-cyw")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "zheHasLetter",
        npcs.find((n) => n.id === "npc-zhe")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "jjaewooHasLetter",
        npcs.find((n) => n.id === "npc-jjaewoo")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "ajyHasLetter",
        npcs.find((n) => n.id === "npc-ajy")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "lyjHasLetter",
        npcs.find((n) => n.id === "npc-lyj")?.hasLetter ?? false,
      );
      gameRef.current.registry.set(
        "ljyHasLetter",
        npcs.find((n) => n.id === "npc-ljy")?.hasLetter ?? false,
      );
    }
  }, [
    showMiniGame,
    showMathGame,
    showEatingGame,
    showRoomDialog,
    showRunningGame,
    showCatchBall,
    showWriteConfirm,
    showLetterWrite,
    showLetterRead,
    showIntro,
    selectedSlot,
    letterCount,
    writtenCount,
    npcs,
    writtenLetters,
    letterGroups,
    room103MiniGameCompleted,
    mathGameSolved,
    eatingGameSolved,
    headsetCount,
    lyjQuestAccepted,
    lyjQuestCompleted,
    showHospitalGame,
    quests,
    currentQuestIndex,
    groundCatchBallCompleted,
    groundItbRunningCompleted,
    devLyjMinigameDone,
    devLettersUnlocked,
    devBoardUnlocked,
    devBoardDone,
    devKeyCount,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showIntro) return;

    let cancelled = false;

    const config = {
      type: Phaser.AUTO,
      width: canvasWidth,
      height: canvasHeight,
      parent: "game-container",
      pixelArt: true,
      roundPixels: true,
      backgroundColor: "#222222",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: false,
        antialiasGL: false,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: true,
        },
      },
      scene: [OpeningScene, RoadScene, GroundScene, HallwayScene, DevelopmentRoomScene, KaimaruScene, MyRoomScene, HospitalScene, { key: "Room103", preload, create, update }, { key: "Room104", preload, create, update }],
    };

    function preload() {
      const dormitoryPath = "/assets/dormitory/";
      const commonPath = "/assets/common/";

      this.load.image("floor", `${dormitoryPath}tile.png`);
      this.load.image("tile2", `${dormitoryPath}tile2.png`);
      this.load.image("wall", `${dormitoryPath}wall.png`);
      this.load.image("outline_top", `${dormitoryPath}outline_top.png`);
      this.load.image("outline_side", `${dormitoryPath}outline_side.png`);
      this.load.image("bed", `${dormitoryPath}bed.png`);
      this.load.image("bed_2", `${dormitoryPath}bed_2_floor.png`);
      this.load.image("chair_left", `${dormitoryPath}chair_left.png`);
      this.load.image("chair_right", `${dormitoryPath}chair_right.png`);
      this.load.image("closet", `${dormitoryPath}closet.png`);
      this.load.image("deskl", `${dormitoryPath}deskl.png`);
      this.load.image("deskr", `${dormitoryPath}deskr.png`);
      this.load.image("door", `${dormitoryPath}door.png`);
      this.load.image("door_inside", `${dormitoryPath}door_inside.png`);
      this.load.image("window", `${dormitoryPath}window.png`);
      this.load.image("quest_icon", `${commonPath}quest_icon.png`);
      this.load.image("happy_icon", `${commonPath}happy.png`);
      this.load.image("letter_icon", `${commonPath}letter.png`);
      this.load.image("letter_written", `${commonPath}letter_wirte.png`);
      this.load.image("plz_icon", `${commonPath}plz.png`);

      this.load.image("ig", `${commonPath}character/ig.png`);
      this.load.image("inj", `${commonPath}character/inj.png`);

      // 160x20 sprite sheets -> 20x20 x 8 frames (indices 0..7)
      this.load.spritesheet("kms", `${commonPath}character/kms.png`, { frameWidth: 20, frameHeight: 20 });
      this.load.spritesheet("pcw", `${commonPath}character/pcw.png`, { frameWidth: 20, frameHeight: 20 });
      this.load.spritesheet("swy", `${commonPath}character/swy.png`, { frameWidth: 20, frameHeight: 20 });

      this.load.atlas(
        "main_character",
        `${commonPath}character/main_character.png`,
        `${commonPath}character/main_character.json`
      );
    }

    function create() {
      const pixelScale = 2;
      const roomW = 280;
      const roomH = 300;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2 - 10;
      const startX = centerX - roomW / 2;
      const startY = centerY - roomH / 2;

      this.physics.world.setBounds(startX, startY, roomW, roomH);

      this.add
        .tileSprite(centerX, centerY, roomW, roomH, "floor")
        .setTileScale(pixelScale)
        .setDepth(0);

      const wallHeight = 100;
      const wallCenterY = startY + 60;
      this.add
        .tileSprite(centerX, wallCenterY, roomW, wallHeight, "wall")
        .setTileScale(pixelScale)
        .setDepth(1);

      const walls = this.physics.add.staticGroup();
      const wallBottomY = wallCenterY + wallHeight / 2;
      const topWall = walls.create(centerX, wallBottomY - 12, null);
      topWall.setSize(roomW, 24).setVisible(false).refreshBody();

      const bottomWall = walls.create(centerX, startY + roomH, null);
      bottomWall.setSize(roomW, 10).setVisible(false).refreshBody();

      const leftWall = walls.create(startX, centerY, null);
      leftWall.setSize(10, roomH).setVisible(false).refreshBody();

      const rightWall = walls.create(startX + roomW, centerY, null);
      rightWall.setSize(10, roomH).setVisible(false).refreshBody();

      const obstacles = this.physics.add.staticGroup();
      const createFurniture = ({ x, y, texture, scaleX = 1, scaleY = 1 }) => {
        const furniture = obstacles.create(x, y, texture);
        furniture.setScale(pixelScale * scaleX, pixelScale * scaleY);
        furniture.refreshBody();
        furniture.body.setSize(furniture.displayWidth * 0.85, furniture.displayHeight * 0.4);
        furniture.body.setOffset(furniture.displayWidth * 0.075, furniture.displayHeight * 0.6);
        furniture.setDepth(Math.round(furniture.y));
        return furniture;
      };

      const marginX = 15;
      const leftX = startX + marginX;
      const rightX = startX + roomW - marginX;

      const row1Y = startY + 95;
      const row2Y = startY + 155;
      const row3Y = startY + 215;
      const row4Y = startY + 265;

      createFurniture({ x: leftX + 10, y: row1Y, texture: "deskl", scaleX: 1 });
      createFurniture({ x: leftX + 10, y: row2Y, texture: "bed_2", scaleX: 0.85 });
      createFurniture({ x: leftX - 5, y: row3Y, texture: "closet", scaleX: 1 });
      createFurniture({ x: leftX - 5, y: row4Y, texture: "closet", scaleX: 1 });

      createFurniture({ x: rightX, y: row1Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: row2Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX - 10, y: row3Y, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: rightX + 5, y: row4Y, texture: "closet", scaleX: 1 });

      const placeChair = (x, y, key) => {
        this.add
          .image(x, y, key)
          .setScale(pixelScale)
          .setDepth(Math.round(y) - 20);
      };
      if (this.scene.key === "Room103") {
        // Room103: move chairs inward (inside of desks)
        placeChair(leftX + 20, row1Y + 8, "chair_left");
        placeChair(rightX - 20, row1Y + 8, "chair_right");
        placeChair(rightX - 20, row2Y + 8, "chair_right");
      } else if (this.scene.key === "Room104") {
        // Room104: left chair also inward.
        placeChair(leftX + 20, row1Y + 8, "chair_left");
      } else {
        // Default placement
        placeChair(leftX - 22, row1Y + 8, "chair_left");
        // Right wall desks: skip in Room104 (right desks excluded)
        if (this.scene.key !== "Room104") {
          placeChair(rightX + 22, row1Y + 8, "chair_right");
          placeChair(rightX + 22, row2Y + 8, "chair_right");
        }
      }

      const outlineTopH =
        this.textures.get("outline_top").getSourceImage().height * pixelScale;
      const outlineSideW =
        this.textures.get("outline_side").getSourceImage().width * pixelScale;
      const outlineW = roomW + outlineSideW * 2;
      const outlineDepth = 9999;

      this.add
        .tileSprite(centerX, startY, outlineW, outlineTopH, "outline_top")
        .setOrigin(0.5, 1)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth);
      this.add
        .tileSprite(centerX, startY + roomH, outlineW, outlineTopH, "outline_top")
        .setOrigin(0.5, 0)
        .setTileScale(pixelScale)
        .setFlipY(true)
        .setDepth(outlineDepth);
      this.add
        .tileSprite(startX, centerY, outlineSideW, roomH, "outline_side")
        .setOrigin(1, 0.5)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth)
        .setFlipX(true);
      this.add
        .tileSprite(startX + roomW, centerY, outlineSideW, roomH, "outline_side")
        .setOrigin(0, 0.5)
        .setTileScale(pixelScale)
        .setDepth(outlineDepth);

      const windowY = startY + 60;
      this.add
        .image(centerX, windowY, "window")
        .setScale(pixelScale * 1.3)
        .setDepth(windowY + 1);

      const zoom = 1.6;
      const viewW = canvasWidth / zoom;
      const viewH = canvasHeight / zoom;
      const cameraBoundsW = Math.max(roomW + outlineSideW * 2, viewW);
      const cameraBoundsH = Math.max(roomH + outlineTopH * 2, viewH);
      const cameraBoundsX = centerX - cameraBoundsW / 2;
      const cameraBoundsY = centerY - cameraBoundsH / 2;
      this.cameras.main.setBounds(cameraBoundsX, cameraBoundsY, cameraBoundsW, cameraBoundsH);
      this.cameras.main.setZoom(zoom);
      this.cameras.main.roundPixels = true;
      this.cameras.main.centerOn(centerX, centerY);

      this.door = this.add
        .image(centerX, startY + roomH, "door_inside")
        .setOrigin(0.5, 1)
        .setScale(pixelScale)
        .setDepth(startY + roomH);

      const createNpcAnimSheet = (key, texture, frames) => {
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(texture, { frames }),
            frameRate: 6,
            repeat: -1
          });
        }
      };

      // User-requested wiggle: use frames 5~8 (1-based) => 4~7 (0-based)
      ["kms", "pcw", "swy"].forEach(char => {
        createNpcAnimSheet(`${char}-wiggle`, char, [4, 5, 6, 7]);
      });

      const roomNpcConfig = {
        Room103: [
          { id: "npc-103-1", x: leftX + 60, y: row2Y + 24, anim: "swy-wiggle", texture: "swy" },
          { id: "npc-103-2", x: leftX + 60, y: row3Y + 20, anim: "kms-wiggle", texture: "kms" },
          { id: "npc-103-3", x: rightX - 72, y: row2Y + 20, anim: "pcw-wiggle", texture: "pcw" },
        ],
        Room104: [
          { id: "npc-104-1", x: rightX - 35, y: row1Y + 15, texture: "ig", isStatic: true },
          { id: "npc-104-2", x: rightX - 35, y: row2Y + 15, texture: "inj", isStatic: true },
        ],
      };

      const configNpcs = roomNpcConfig[this.scene.key] ?? [];

      this.npcs = this.physics.add.group({ immovable: true, allowGravity: false });
      this.npcIcons = [];
      let igPos = null;
      let injPos = null;

      if (configNpcs) {
        configNpcs.forEach(npcData => {
          let npc;
          npc = this.npcs.create(npcData.x, npcData.y, npcData.texture);
          npc.body.setImmovable(true);
          npc.body.setAllowGravity(false);
          npc.setScale(pixelScale);
          npc.setDepth(npc.y);
          npc.refreshBody();
          if (this.scene.key === "Room103" || this.scene.key === "Room104") {
            // Slightly larger than player footprint (player: 10x8, offset 5,12).
            npc.body.setSize(12, 10).setOffset(4, 10);
          }
          if (npcData.anim) npc.anims.play(npcData.anim);
          npc.npcId = npcData.id;
          if (npcData.texture === "ig") igPos = { x: npc.x, y: npc.y };
          if (npcData.texture === "inj") injPos = { x: npc.x, y: npc.y };

          // Quest icon
          const iconOffsetY = 36;
          const questIcon = this.add.image(npc.x, npc.y - iconOffsetY, "quest_icon");
          questIcon.setScale(pixelScale * 0.65);
          questIcon.setDepth(99999);
          questIcon.setVisible(false);

          this.tweens.add({
            targets: questIcon,
            y: questIcon.y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });

          const happyIcon = this.add.image(npc.x, npc.y - iconOffsetY, "happy_icon");
          happyIcon.setScale(pixelScale * 0.65);
          happyIcon.setDepth(99999);
          happyIcon.setVisible(false);

          this.npcIcons.push({ npcId: npcData.id, questIcon, happyIcon, happyTimer: null });

          if (this.scene.key === "Room103") {
            this.tweens.add({
              targets: npc,
              y: npc.y - 2,
              duration: 150 + Math.random() * 100,
              yoyo: true,
              repeat: -1,
              delay: Math.random() * 500,
              repeatDelay: 200 + Math.random() * 800,
            });

            const emitSoundWave = () => {
              if (!npc.scene) return;
              const graphics = this.add.graphics();
              const waveX = npc.x;
              const waveY = npc.y - 20;
              graphics.setDepth(npc.depth + 1);

              const waveObj = { r: 5, a: 1 };
              this.tweens.add({
                targets: waveObj,
                r: 25,
                a: 0,
                duration: 600,
                onUpdate: () => {
                  graphics.clear();
                  graphics.lineStyle(2, 0xffffff, waveObj.a);
                  graphics.strokeCircle(waveX, waveY, waveObj.r);
                },
                onComplete: () => {
                  graphics.destroy();
                }
              });

              this.time.delayedCall(800 + Math.random() * 1500, emitSoundWave);
            };

            this.time.delayedCall(Math.random() * 1000, emitSoundWave);
          }

          // NPC Name Text
          const npcState = gameStateRef.current.getNpcState(npcData.id);
          const nameText = this.add.text(npc.x, npc.y - 45, npcState?.name ?? "", {
            fontFamily: "Galmuri11-Bold",
            fontSize: "10px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
            resolution: 2, // For crisp pixel text
          });
          nameText.setOrigin(0.5);
          nameText.setDepth(99999);
          nameText.setVisible(false);
          npc.nameText = nameText;
        });
      }

      if (this.scene.key === "Room104" && igPos && injPos) {
        const plz = this.add.image(
          (igPos.x + injPos.x) / 2 + 14,
          (igPos.y + injPos.y) / 2 - 20,
          "plz_icon"
        );
        plz.setScale(pixelScale * 0.45);
        plz.setDepth(99999);
        this.room104MathHintIcon = plz;
        this.tweens.add({
          targets: plz,
          y: plz.y - 6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      // Happy Jump Event Listener
      const onNpcHappy = (e) => {
        const targetId = e.detail?.npcId;
        const targetNpc = this.npcs.getChildren().find((n) => n.npcId === targetId);
        if (targetNpc) {
          this.tweens.add({
            targets: targetNpc,
            y: targetNpc.y - 15,
            duration: 200,
            yoyo: true,
            repeat: 2,
            ease: "Power1",
          });
        }
      };
      window.addEventListener("npc-happy", onNpcHappy);
      this.events.on("shutdown", () => window.removeEventListener("npc-happy", onNpcHappy));

      this.handItem = this.add.image(0, 0, "letter_icon").setScale(pixelScale * 0.5).setDepth(200).setVisible(false);
      this.prevRight = false;

      const spawnX = centerX;
      const spawnY = startY + roomH - 60;
      this.player = this.physics.add.sprite(
        spawnX,
        spawnY,
        "main_character",
        "16x16 All Animations 0.aseprite"
      );
      this.player.setScale(pixelScale).setCollideWorldBounds(true);
      this.player.body.setSize(10, 8).setOffset(5, 12);

      this.physics.add.collider(this.player, obstacles);
      if (this.npcs) {
        this.physics.add.collider(this.player, this.npcs);
      }
      this.physics.add.collider(this.player, walls);

      this.player.anims.play("idle-down");
      this.lastDirection = "down";

      this.moveKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
      });
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.prevRight = false;
      this.handItem = null;
      this.isJumping = false;
      this.jumpTween = null;
      this.interactionCooldown = true;

      this.time.delayedCall(500, () => {
        this.interactionCooldown = false;
      });

      const handleNpcHappy = (e) => {
        if (!this.sys) return;
        const { npcId } = e.detail;
        if (!this.npcIcons) return;
        const iconSet = this.npcIcons.find((icon) => icon.npcId === npcId);
        if (iconSet) {
          iconSet.questIcon.setVisible(false);
          iconSet.happyIcon.setVisible(true);
          if (iconSet.happyTimer) {
            iconSet.happyTimer.remove(false);
          }
          iconSet.happyTimer = this.time.delayedCall(1200, () => {
            if (iconSet.happyIcon && iconSet.happyIcon.scene) {
              iconSet.happyIcon.setVisible(false);
            }
          });
        }
      };
      window.addEventListener("npc-happy", handleNpcHappy);
      this.events.once(Phaser.Scenes.Events.DESTROY, () => {
        window.removeEventListener("npc-happy", handleNpcHappy);
      });

      // Character animations

      // We rely on 'main_character' atlas for everyone currently as per recent changes?
      // Or 'ig', 'inj' etc. loaded with main_character.json.

      // Function to create standard character animations
      const createCharAnims = () => {
        if (this.anims.exists('idle-down')) return;
        const animConfig = {
          'idle-down': { start: 0, end: 3 },
          'idle-right': { start: 4, end: 7 },
          'idle-up': { start: 8, end: 11 },
          'idle-left': { start: 12, end: 15 },
          'walk-down': { start: 16, end: 19 },
          'walk-right': { start: 20, end: 23 },
          'walk-up': { start: 24, end: 27 },
          'walk-left': { start: 28, end: 31 },
          'run-down': { start: 32, end: 35 },
          'run-right': { start: 36, end: 39 },
          'run-up': { start: 40, end: 43 },
          'run-left': { start: 44, end: 47 },
        };

        for (const [key, range] of Object.entries(animConfig)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNames('main_character', {
              start: range.start,
              end: range.end,
              prefix: "16x16 All Animations ",
              suffix: ".aseprite",
            }),
            frameRate: 6,
            repeat: -1
          });
        }
      };
      createCharAnims();
    }

    function update() {
      if (!this.player) return;

      if (gameStateRef.current.isMiniGameOpen) {
        this.player.body.setVelocity(0);
        return;
      }

      // Interaction
      let closestNpc = null;
      let minDistance = 80;
      if (this.npcs) {
        this.npcs.children.iterate((npc) => {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
          if (dist < minDistance) {
            closestNpc = npc;
            minDistance = dist;
          }
        });
      }

      if (closestNpc) {
        this.npcId = closestNpc.npcId;
      } else {
        this.npcId = null;
      }

      const isNearNPC = !!closestNpc;
      const isNearDoor = this.door && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.door.x, this.door.y) < 50;

      // Update Icons
      if (this.npcIcons) {
        this.npcIcons.forEach(iconSet => {
          const npcState = gameStateRef.current.getNpcState(iconSet.npcId);
          if (!npcState) {
            iconSet.questIcon.setVisible(false);
            return;
          }
          const shouldShowQuestIcon = npcState.hasLetter === false && !iconSet.happyIcon.visible;
          iconSet.questIcon.setVisible(shouldShowQuestIcon);
        });
      }

      if (this.room104MathHintIcon) {
        const solved = gameStateRef.current.getMathGameSolved?.() ?? false;
        this.room104MathHintIcon.setVisible(!solved);
      }

      // Update NPC Name Visibility
      if (this.npcs) {
        this.npcs.children.iterate((npc) => {
          if (npc.nameText) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (dist < 80) {
              npc.nameText.setVisible(true);
            } else {
              npc.nameText.setVisible(false);
            }
          }
        });
      }

      const pointer = this.input.activePointer;
      const mouseRightDown = pointer.rightButtonDown();
      const rightJustDown = mouseRightDown && !this.prevRight;
      this.prevRight = mouseRightDown;

      // Door
      if (isNearDoor && !this.interactionCooldown) {
        if (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if (this.scene.key === "Room103") {
            const allDelivered = ["npc-103-1", "npc-103-2", "npc-103-3"].every(
              (id) => gameStateRef.current.getNpcState(id)?.hasLetter
            );
            if (!allDelivered) {
              openRoom103LeaveBlockedDialog();
              this.player.body.setVelocity(0);
              return;
            }
            openRoom103AllDeliveredOutro();
            this.interactionCooldown = true;
            setTimeout(() => {
              this.interactionCooldown = false;
            }, 1200);
            this.player.body.setVelocity(0);
            return;
          }

          if (this.scene.key === "Room104") {
            const allDelivered = ["npc-104-1", "npc-104-2"].every(
              (id) => gameStateRef.current.getNpcState(id)?.hasLetter
            );
            if (!allDelivered) {
              openRoom104LeaveBlockedDialog();
              this.player.body.setVelocity(0);
              return;
            }
            openRoom104AllDeliveredOutro();
            this.interactionCooldown = true;
            setTimeout(() => {
              this.interactionCooldown = false;
            }, 1200);
            this.player.body.setVelocity(0);
            return;
          }

          setExitRoomKey(this.scene.key);
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          return;
        }
        // Move down check
        if (this.moveKeys.down.isDown || this.moveKeys.s.isDown) {
          if (this.scene.key === "Room103") {
            const allDelivered = ["npc-103-1", "npc-103-2", "npc-103-3"].every(
              (id) => gameStateRef.current.getNpcState(id)?.hasLetter
            );
            if (!allDelivered) {
              openRoom103LeaveBlockedDialog();
              this.player.body.setVelocity(0);
              return;
            }
            openRoom103AllDeliveredOutro();
            this.interactionCooldown = true;
            setTimeout(() => {
              this.interactionCooldown = false;
            }, 1200);
            this.player.body.setVelocity(0);
            return;
          }

          if (this.scene.key === "Room104") {
            const allDelivered = ["npc-104-1", "npc-104-2"].every(
              (id) => gameStateRef.current.getNpcState(id)?.hasLetter
            );
            if (!allDelivered) {
              openRoom104LeaveBlockedDialog();
              this.player.body.setVelocity(0);
              return;
            }
            openRoom104AllDeliveredOutro();
            this.interactionCooldown = true;
            setTimeout(() => {
              this.interactionCooldown = false;
            }, 1200);
            this.player.body.setVelocity(0);
            return;
          }

          setExitRoomKey(this.scene.key);
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          return;
        }
      }

      // NPC Interaction
      if (isNearNPC && !this.interactionCooldown) {
        if (rightJustDown || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if ((this.npcId === "npc-104-1" || this.npcId === "npc-104-2") && !gameStateRef.current.getMathGameSolved()) {
            openRoom104BeforeMathDialog();
            this.interactionCooldown = true;
            setTimeout(() => { this.interactionCooldown = false; }, 1000);
            return;
          }

          // ... Logic for write/give ...
          const npcState = gameStateRef.current.getNpcState(this.npcId);
          if (npcState) {
            const { hasLetter, hasWritten } = npcState;
            if (!hasLetter && !hasWritten && gameStateRef.current.getLetterCount() > 0 && gameStateRef.current.getSelectedSlot() === 0) {
              setInteractionTargetId(this.npcId);
              setConfirmMode("write");
              gameStateRef.current.setShowWriteConfirm(true);
            } else if (!hasLetter && gameStateRef.current.getWrittenCount() > 0 && gameStateRef.current.getSelectedSlot() !== 0) {
              // Check if letter matches the target NPC
              const selectedSlot = gameStateRef.current.getSelectedSlot();
              const groups = gameStateRef.current.getLetterGroups();
              const group = groups[selectedSlot - 1];

              if (group && group.npcId === this.npcId) {
                setInteractionTargetId(this.npcId);
                setConfirmMode("give");
                gameStateRef.current.setShowWriteConfirm(true);
              }
            }
          }
        }
      }

      // Movement
      const isRunning = this.shiftKey.isDown;
      const speed = isRunning ? 200 : 100;
      const animPrefix = isRunning ? "run" : "walk";
      this.player.body.setVelocity(0);

      const leftDown = this.moveKeys.left.isDown || this.moveKeys.a.isDown;
      const rightDown = this.moveKeys.right.isDown || this.moveKeys.d.isDown;
      const upDown = this.moveKeys.up.isDown || this.moveKeys.w.isDown;
      const downDown = this.moveKeys.down.isDown || this.moveKeys.s.isDown;

      if (leftDown) {
        this.player.body.setVelocityX(-speed);
        this.player.anims.play(`${animPrefix}-left`, true);
        this.lastDirection = "left";
      } else if (rightDown) {
        this.player.body.setVelocityX(speed);
        this.player.anims.play(`${animPrefix}-right`, true);
        this.lastDirection = "right";
      } else if (upDown) {
        this.player.body.setVelocityY(-speed);
        this.player.anims.play(`${animPrefix}-up`, true);
        this.lastDirection = "up";
      } else if (downDown) {
        this.player.body.setVelocityY(speed);
        this.player.anims.play(`${animPrefix}-down`, true);
        this.lastDirection = "down";
      } else {
        this.player.anims.play(`idle-${this.lastDirection}`, true);
      }
      this.player.setDepth(this.player.y);

      // Hand item
      if (this.handItem) {
        const slot = gameStateRef.current.getSelectedSlot();
        if (slot === 0 && gameStateRef.current.getLetterCount() > 0) {
          this.handItem.setTexture("letter_icon");
          this.handItem.setVisible(true);
        } else if (slot > 0) {
          this.handItem.setTexture("letter_written");
          this.handItem.setVisible(true);
        } else {
          this.handItem.setVisible(false);
        }
        if (this.handItem.visible) {
          this.handItem.x = this.player.x + (this.lastDirection === 'left' ? -8 : 8);
          this.handItem.y = this.player.y + 10;
          this.handItem.setDepth(this.player.depth + 1);
        }
      }
    }

    const startGame = async () => {
      try {
        await Promise.all([document.fonts.load('16px "Galmuri11-Bold"'), document.fonts.load('16px "Galmuri11"')]);
        await document.fonts.ready;
      } catch { /* ignore font load errors */ }
      if (cancelled) return;
      const game = new Phaser.Game(config);
      gameRef.current = game;
    };

    startGame();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        if (gameRef.current.sound) gameRef.current.sound.stopAll();
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [showIntro]);

  return (
    <div id="game-container">
      <style>{`
        @font-face {
          font-family: "PixelFont";
          src: url("/assets/fonts/pixelFont.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Galmuri11-Bold";
          src: url("/assets/fonts/Galmuri11-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @keyframes questStrike {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes questFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* UI Elements */}
      {!showIntro && !isOpeningScene && (
        <>

          {showRoomDialog && roomDialogLines.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1450,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "22px",
                  transform: "translateX(-50%)",
                  width: `${240 * 4}px`,
                  height: `${64 * 4}px`,
                  pointerEvents: "auto",
                }}
              >
                <img
                  src={roomDialogLines[roomDialogIndex]?.portrait}
                  alt={roomDialogLines[roomDialogIndex]?.speaker ?? "npc"}
                  style={{
                    width: "100%",
                    height: "100%",
                    imageRendering: "pixelated",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: `${66 * 4}px`,
                    top: `${25 * 4}px`,
                    width: `${160 * 4}px`,
                    height: `${34 * 4}px`,
                    fontFamily: "Galmuri11-Bold",
                    fontSize: "18px",
                    lineHeight: 1.35,
                    color: "#4E342E",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflow: "hidden",
                    textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  <div style={{ fontSize: "18px", lineHeight: 1.15, marginBottom: "4px" }}>
                    {roomDialogLines[roomDialogIndex]?.speaker ?? ""}
                  </div>
                  <div style={{ fontSize: "18px", lineHeight: 1.35 }}>
                    {roomDialogLines[roomDialogIndex]?.text ?? ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (roomDialogIndex < roomDialogLines.length - 1) {
                      setRoomDialogIndex((prev) => prev + 1);
                      return;
                    }
                    const action = roomDialogAction;
                    setShowRoomDialog(false);
                    setRoomDialogLines([]);
                    setRoomDialogIndex(0);
                    setRoomDialogAction(null);
                    if (action?.type === "startMath") {
                      setShowMathGame(true);
                    } else if (action?.type === "startCatchBall") {
                      setShowCatchBall(true);
                    } else if (action?.type === "startRunning") {
                      setShowRunningGame(true);
                    } else if (action?.type === "openRunningGuide") {
                      setGameGuideTitle("태빈이를 이겨라!");
                      setGameGuideText("스페이스바를 연타해서 러닝하는 태빈이를 멈춰 세워보자.");
                      setGameGuideAction({ type: "startRunning" });
                      setShowGameGuide(true);
                    } else if (action?.type === "openDevHeadsetGuide") {
                      setGameGuideTitle("개발실 미니게임");
                      setGameGuideText("헤드셋 찾기 (구현 중)  확인을 누르면 성공 처리됩니다.");
                      setGameGuideAction({ type: "devHeadsetWin" });
                      setShowGameGuide(true);
                    } else if (action?.type === "kaimaruToGround") {
                      window.dispatchEvent(
                        new CustomEvent("kaimaru-quest-complete"),
                      );
                      window.dispatchEvent(
                        new CustomEvent("open-exit-confirm", {
                          detail: { roomKey: "EnterGround", x: 260, y: 180 },
                        }),
                      );
                    } else if (action?.type === "room103ToHallwayActivate104") {
                      setRoom103LettersDelivered(true);
                      setRoom104QuestionActive(true);
                      // Prevent a registry/state timing race during immediate scene transition.
                      if (gameRef.current) {
                        gameRef.current.registry.set("room103LettersDelivered", true);
                        gameRef.current.registry.set("room104QuestionActive", true);
                      }
                      transitionToScene("Hallway", { x: 750, y: 330 });
                    } else if (action?.type === "enterRoom104FromHallway") {
                      setRoom104QuestionActive(false);
                      if (gameRef.current) {
                        gameRef.current.registry.set("room104QuestionActive", false);
                      }
                      transitionToScene("Room104");
                    } else if (action?.type === "room104ToKaimaruConfirm") {
                      setExitRoomKey("EnterKaimaru");
                      setExitRoomData(null);
                      setShowExitConfirm(true);
                    } else if (action?.type === "itbToKraftonConfirm") {
                      setExitRoomKey("EnterDevelopmentRoom");
                      setExitRoomData({
                        message: "크래프톤 빌딩으로 이동하시겠습니까?",
                        noScooter: true,
                      });
                      setShowExitConfirm(true);
                    } else if (action?.type === "devEnableLyjDelivery") {
                      setDevLettersUnlocked(true);
                      if (gameRef.current) {
                        gameRef.current.registry.set("devLettersUnlocked", true);
                      }
                    } else if (action?.type === "devUnlockBoard") {
                      setDevBoardUnlocked(true);
                      if (gameRef.current) {
                        gameRef.current.registry.set("devBoardUnlocked", true);
                      }
                    } else if (action?.type === "devGiveKey") {
                      setDevBoardDone(true);
                      setDevKeyCount(1);
                      setSelectedSlot(KEY_SLOT);
                      if (gameRef.current) {
                        gameRef.current.registry.set("devBoardDone", true);
                        gameRef.current.registry.set("devKeyCount", 1);
                        gameRef.current.registry.set("selectedSlot", KEY_SLOT);
                      }
                    }
                  }}
                  style={{
                    position: "absolute",
                    right: `${19 * 4}px`,
                    bottom: `${17 * 4}px`,
                    width: "92px",
                    height: "36px",
                    fontFamily: "Galmuri11-Bold",
                    fontSize: "13px",
                    color: "#4E342E",
                    backgroundColor: "#f1d1a8",
                    border: "2px solid #caa47d",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {showGameGuide && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1470,
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  width: "520px",
                  minHeight: "200px",
                  backgroundImage: "url('/assets/common/modal1.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  padding: "26px 34px",
                  boxSizing: "border-box",
                  imageRendering: "pixelated",
                  color: "#4E342E",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "18px" }}>게임 안내</div>
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "13px", lineHeight: 1.45 }}>
                  <div style={{ fontSize: "18px", marginBottom: "10px" }}>{gameGuideTitle}</div>
                  <div style={{ fontSize: "15px" }}>{gameGuideText}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const action = gameGuideAction;
                      setShowGameGuide(false);
                      setGameGuideAction(null);
                      setGameGuideTitle("");
                      setGameGuideText("");
                      if (action?.type === "startRunning") setShowRunningGame(true);
                      if (action?.type === "devHeadsetWin") {
                        setDevLyjMinigameDone(true);
                        if (gameRef.current) {
                          gameRef.current.registry.set("devLyjMinigameDone", true);
                        }
                        openDevLyjThanksDialog();
                      }
                    }}
                    style={{
                      width: "96px",
                      height: "36px",
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "13px",
                      color: "#4E342E",
                      backgroundColor: "#f1d1a8",
                      border: "2px solid #caa47d",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {showWriteConfirm && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  width: "270px",
                  minHeight: "140px",
                  backgroundImage: "url('/assets/common/modal1.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  color: "#4E342E",
                  imageRendering: "pixelated",
                }}
              >
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "13px", textAlign: "center" }}>
                  {`${npcs.find((n) => n.id === interactionTargetId)?.name ?? ""}에게 ${confirmMode === "give" ? "편지를 건네시겠습니까?" : "편지를 쓰시겠습니까?"}`}
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <div
                    onClick={() => {
                      setShowWriteConfirm(false);
                      const targetId = interactionTargetId;
                      if (
                        (targetId === "npc-104-1" || targetId === "npc-104-2") &&
                        !mathGameSolved
                      ) {
                        openRoom104BeforeMathDialog();
                        return;
                      }
                      if (confirmMode === "write") {
                        const activeNpc = npcs.find((n) => n.id === targetId);
                        const alreadyWritten = writtenLetters.some((l) => l.npcId === targetId);
                        if (
                          letterCount > 0 &&
                          activeNpc &&
                          !activeNpc.hasLetter &&
                          !activeNpc.hasWritten &&
                          !alreadyWritten
                        ) {
                          setLetterCount((prev) => Math.max(0, prev - 1));
                          setSelectedSlot(1);
                          setShowLetterWrite(true);
                        }
                      } else if (confirmMode === "give") {
                        setWrittenLetters((prev) => {
                          const index = prev.findIndex((l) => l.npcId === targetId);
                          if (index === -1) return prev;
                          const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
                          setWrittenCount(next.length);
                          try {
                            localStorage.setItem("writtenLetters", JSON.stringify(next));
                          } catch { /* Ignore */ }
                          return next;
                        });
                        setNpcs((prev) =>
                          prev.map((n) =>
                            n.id === targetId ? { ...n, hasLetter: true } : n
                          )
                        );
                        window.dispatchEvent(
                          new CustomEvent("npc-happy", {
                            detail: { npcId: targetId },
                          }),
                        );
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      width: "48px",
                      height: "48px",
                      backgroundImage: "url('/assets/common/o.png')",
                      backgroundSize: "44px 48px",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      imageRendering: "pixelated",
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                  <div
                    onClick={() => setShowWriteConfirm(false)}
                    style={{
                      cursor: "pointer",
                      width: "48px",
                      height: "48px",
                      backgroundImage: "url('/assets/common/x.png')",
                      backgroundSize: "44px 48px",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      imageRendering: "pixelated",
                      transition: "transform 0.1s",
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {showLetterWrite && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "13px", color: "white", textShadow: "1px 1px 2px black" }}>편지 작성하기</div>
                <div
                  style={{
                    position: "relative",
                    width: `${letterPaper.width}px`,
                    height: `${letterPaper.height}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    imageRendering: "pixelated",
                  }}
                >
                  {envelopeFrame < 3 && (
                    <img
                      src={`/assets/common/${envelopeFrame === 1 ? "Envelope1" : "Envelope2"}.png`}
                      alt="Envelope"
                      style={{
                        width: "90px",
                        height: "auto",
                        imageRendering: "pixelated",
                        animation: "popIn 0.4s ease-out forwards",
                      }}
                    />
                  )}
                  {envelopeFrame === 3 && (
                    <>
                      <img
                        src="/assets/common/letter1.png"
                        alt="Letter Paper"
                        style={{
                          width: `${letterPaper.width}px`,
                          height: `${letterPaper.height}px`,
                          imageRendering: "pixelated",
                          animation: "fadeIn 0.6s ease-out forwards",
                        }}
                      />
                      <textarea
                        value={letterText}
                        onChange={(e) => setLetterText(e.target.value)}
                        style={{
                          position: "absolute",
                          top: `${letterPaper.padTop + 36}px`,
                          left: `${letterPaper.padX + 36}px`,
                          width: `${letterPaper.width - letterPaper.padX * 2 - 72}px`,
                          height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom - 72}px`,
                          resize: "none",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "transparent",
                          border: "none",
                          outline: "none",
                        }}
                      />
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowLetterWrite(false);
                    const targetId = interactionTargetId;
                    const payload = {
                      npcId: targetId,
                      text: letterText,
                      createdAt: Date.now(),
                    };
                    setWrittenLetters((prev) => {
                      const existingIndex = prev.findIndex((l) => l.npcId === targetId);
                      if (existingIndex !== -1) {
                        const next = [...prev];
                        next[existingIndex] = payload;
                        try {
                          localStorage.setItem("writtenLetters", JSON.stringify(next));
                        } catch {
                          // Ignore localStorage errors
                        }
                        setWrittenCount(next.length);
                        return next;
                      }
                      const next = [...prev, payload];
                      try {
                        localStorage.setItem("writtenLetters", JSON.stringify(next));
                      } catch {
                        // Ignore localStorage errors
                      }
                      setWrittenCount(next.length);
                      return next;
                    });
                    setNpcs((prev) =>
                      prev.map((n) =>
                        n.id === targetId ? { ...n, hasWritten: true } : n
                      )
                    );
                    setLetterText("");
                  }}
                  style={{
                    fontFamily: "Galmuri11-Bold",
                    fontSize: "13px",
                    padding: "8px 20px",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "12px",
                  }}
                >
                  작성 완료
                </button>
              </div>
            </div>
          )}
          {showLetterRead && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1400,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "13px", color: "white", textShadow: "1px 1px 2px black" }}>편지 읽기</div>
                {readingLetters.length > 0 && (
                  <div
                    style={{
                      position: "relative",
                      width: `${letterPaper.width}px`,
                      height: `${letterPaper.height}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      imageRendering: "pixelated",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "14px",
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        color: "#4E342E",
                        pointerEvents: "none",
                      }}
                    >
                      {npcs.find(
                        (n) => n.id === readingLetters[Math.min(readIndex, readingLetters.length - 1)]?.npcId
                      )?.name ?? ""}
                    </div>
                    <img
                      src="/assets/common/letter1.png"
                      alt="Letter Paper"
                      style={{
                        width: `${letterPaper.width}px`,
                        height: `${letterPaper.height}px`,
                        imageRendering: "pixelated",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: `${letterPaper.padTop}px`,
                        left: `${letterPaper.padX}px`,
                        width: `${letterPaper.width - letterPaper.padX * 2}px`,
                        height: `${letterPaper.height - letterPaper.padTop - letterPaper.padBottom}px`,
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        color: "#4E342E",
                        whiteSpace: "pre-wrap",
                        overflow: "hidden",
                      }}
                    >
                      {readingLetters[Math.min(readIndex, readingLetters.length - 1)]?.text}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button
                    onClick={() => {
                      const currentLetter = readingLetters[Math.min(readIndex, readingLetters.length - 1)];
                      if (currentLetter) {
                        setLetterText(currentLetter.text);
                        setInteractionTargetId(currentLetter.npcId);
                        setConfirmMode("write");
                        setShowLetterRead(false);
                        setShowLetterWrite(true);
                        setEnvelopeFrame(3);
                      }
                    }}
                    style={{
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "13px",
                      padding: "6px 16px",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setShowLetterRead(false)}
                    style={{
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "13px",
                      padding: "6px 16px",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    닫기
                  </button>

                </div>
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "24px",
              transform: "translateX(-50%)",
              zIndex: 120,
              width: `${inventoryConfig.width}px`,
              height: `${inventoryConfig.height}px`,
              backgroundImage: "url('/assets/common/inventory.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
            }}
          >
            {Array.from({ length: inventoryConfig.slots }).map((_, index) => {
              const isSlot0 = index === 0;
              const isHeadsetSlot = index === 6; // HEADSET_SLOT
              const groupIndex = index - 1;
              const group = index > 0 && !isHeadsetSlot ? letterGroups[groupIndex] : null;
              const leftPos = inventoryConfig.padX + index * (inventoryConfig.slotSize + inventoryConfig.gap);
              const topPos = inventoryConfig.padY;

              return (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlot(index);
                      if (group) {
                        setReadingLetters(group.letters);
                        setReadIndex(0);
                        setShowLetterRead(true);
                      }
                    }}
                    aria-label={`Inventory slot ${index + 1}`}
                    style={{
                      position: "absolute",
                      left: `${leftPos}px`,
                      top: `${topPos}px`,
                      width: `${inventoryConfig.slotSize}px`,
                      height: `${inventoryConfig.slotSize}px`,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  />

                  {isSlot0 && letterCount > 0 && (
                    <>
                      <img
                        src="/assets/common/letter.png"
                        alt="Letter"
                        style={{
                          position: "absolute",
                          left: `${leftPos + 4}px`,
                          top: `${topPos + 4}px`,
                          width: `${inventoryConfig.slotSize - 8}px`,
                          height: `${inventoryConfig.slotSize - 8}px`,
                          imageRendering: "pixelated",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: `${leftPos + inventoryConfig.slotSize - 16}px`,
                          top: `${topPos + inventoryConfig.slotSize - 16}px`,
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#774c30",
                          backgroundColor: "rgba(230, 210, 181, 0.85)",
                          borderRadius: "999px",
                          minWidth: "16px",
                          height: "16px",
                          lineHeight: "16px",
                          textAlign: "center",
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                      >
                        {letterCount}
                      </span>
                    </>
                  )}

                  {group && (
                    <>
                      <img
                        src="/assets/common/letter_wirte.png"
                        alt="Written Letter"
                        style={{
                          position: "absolute",
                          left: `${leftPos + 4}px`,
                          top: `${topPos + 4}px`,
                          width: `${inventoryConfig.slotSize - 8}px`,
                          height: `${inventoryConfig.slotSize - 8}px`,
                          imageRendering: "pixelated",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: `${leftPos + inventoryConfig.slotSize - 16}px`,
                          top: `${topPos + inventoryConfig.slotSize - 16}px`,
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#5B3A24",
                          backgroundColor: "rgba(230, 210, 181, 0.85)",
                          borderRadius: "999px",
                          minWidth: "16px",
                          height: "16px",
                          lineHeight: "16px",
                          textAlign: "center",
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                      >
                        {group.letters.length}
                      </span>
                    </>
                  )}

                  {isHeadsetSlot && headsetCount > 0 && (
                    <>
                      <img
                        src="/assets/development_room/headset.png"
                        alt="Headset"
                        style={{
                          position: "absolute",
                          left: `${leftPos + 4}px`,
                          top: `${topPos + 4}px`,
                          width: `${inventoryConfig.slotSize - 8}px`,
                          height: `${inventoryConfig.slotSize - 8}px`,
                          imageRendering: "pixelated",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: `${leftPos + inventoryConfig.slotSize - 16}px`,
                          top: `${topPos + inventoryConfig.slotSize - 16}px`,
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#5B3A24",
                          backgroundColor: "rgba(230, 210, 181, 0.85)",
                          borderRadius: "999px",
                          minWidth: "16px",
                          height: "16px",
                          lineHeight: "16px",
                          textAlign: "center",
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                      >
                        {headsetCount}
                      </span>
                    </>
                  )}

                  {index === KEY_SLOT && devKeyCount > 0 && (
                    <>
                      <img
                        src="/assets/hospital/key_.png"
                        alt="Key"
                        style={{
                          position: "absolute",
                          left: `${leftPos + 4}px`,
                          top: `${topPos + 4}px`,
                          width: `${inventoryConfig.slotSize - 8}px`,
                          height: `${inventoryConfig.slotSize - 8}px`,
                          imageRendering: "pixelated",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: `${leftPos + inventoryConfig.slotSize - 16}px`,
                          top: `${topPos + inventoryConfig.slotSize - 16}px`,
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "11px",
                          color: "#5B3A24",
                          backgroundColor: "rgba(230, 210, 181, 0.85)",
                          borderRadius: "999px",
                          minWidth: "16px",
                          height: "16px",
                          lineHeight: "16px",
                          textAlign: "center",
                          zIndex: 5,
                          pointerEvents: "none",
                        }}
                      >
                        {devKeyCount}
                      </span>
                    </>
                  )}

                  {selectedSlot === index && (
                    <img
                      src="/assets/common/focus.png"
                      alt=""
                      style={{
                        position: "absolute",
                        left: `${leftPos - 3}px`,
                        top: `${topPos - 3}px`,
                        width: `${inventoryConfig.slotSize + 6}px`,
                        height: `${inventoryConfig.slotSize + 6}px`,
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                        zIndex: 15,
                      }}
                    />
                  )}

                  {selectedSlot === index && group && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${leftPos + inventoryConfig.slotSize / 2}px`,
                        top: "-30px",
                        transform: "translateX(-50%)",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 20,
                      }}
                    >
                      {`${npcs.find((n) => n.id === group.npcId)?.name ?? ""}`}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "28px",
              width: "410px",
              height: "185px",
              backgroundImage: `url('/assets/common/${9 + Math.floor(gameMinutes / 60) < 12
                ? "morning"
                : 9 + Math.floor(gameMinutes / 60) < 15
                  ? "afternoon"
                  : "evening"
                }.png')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left top",
              imageRendering: "pixelated",
              zIndex: 130,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              paddingBottom: "24px",
              paddingLeft: "48px",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                fontFamily: "Galmuri11-Bold",
                fontSize: "26px",
                color: "#bc9368",
              }}
            >
              {(() => {
                const total = 9 * 60 + gameMinutes;
                const hours = Math.min(18, Math.floor(total / 60));
                const minutes = Math.min(59, total % 60);
                return `${hours.toString().padStart(2, "0")}:${minutes
                  .toString()
                  .padStart(2, "0")}`;
              })()}
            </span>
          </div>

          {/* Quest Modal - Slide from Right */}
          <div
            onClick={() => handleChecklistClick()}
            style={{
              position: "absolute",
              top: "16px",
              right: checklistOpen ? "16px" : "-250px", // Slide in/out
              width: "280px",
              height: "180px",
              backgroundImage: "url('/assets/common/modal1.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              imageRendering: "pixelated",
              zIndex: 135,
              display: "flex",
              flexDirection: "column",
              padding: "14px 18px",
              boxSizing: "border-box",
              transition: "right 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
              cursor: "pointer",
            }}
          >
            <h3
              style={{
                fontFamily: "Galmuri11-Bold",
                fontSize: "13px",
                color: "#5B3A24",
                marginBottom: "14px",
                textAlign: "left",
              }}
            >
              📋 퀘스트 목록
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {quests.map((quest, index) => (
                <div
                  key={quest.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: index <= currentQuestIndex ? 1 : 0.4,
                    transition: "opacity 0.3s",
                  }}
                >
                  {/* Quest Icon/Status */}
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: quest.completed
                        ? "#4CAF50"
                        : index === currentQuestIndex
                          ? "#FFC107"
                          : "#9E9E9E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "10px",
                      flexShrink: 0,
                    }}
                  >
                    {quest.completed ? "✓" : index + 1}
                  </div>

                  {/* Quest Text */}
                  <div
                    style={{
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "11px",
                      color: quest.completed ? "#6d8c54" : "#5B3A24",
                      textDecoration: quest.completed ? "line-through" : "none",
                      flex: 1,
                    }}
                  >
                    {quest.text}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {showBanToast && (
            <div style={{
              position: "absolute",
              top: "78px",
              right: "16px",
              width: "290px",
              height: "48px",
              backgroundImage: "url('/assets/common/ui1.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              zIndex: 126,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8d684e",
              fontFamily: "Galmuri11-Bold",
              fontSize: "11px",
              pointerEvents: "none",
              opacity: banToastVisible ? 1 : 0,
              transform: banToastVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}>
                  ..
            </div>
          )}

          {/* Settings Button - Bottom Right */}
          <button
            type="button"
            onClick={() => setDebugWarpOpen(true)}
            style={{
              position: "absolute",
              right: "22px",
              bottom: "26px",
              width: "38px",
              height: "38px",
              backgroundImage: "url('/assets/common/setting.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              border: "none",
              backgroundColor: "transparent",
              imageRendering: "pixelated",
              cursor: "pointer",
              zIndex: 130,
            }}
            aria-label="Settings"
          />

          {/* Debug Warp Modal */}
          {debugWarpOpen && (
            <div
              onClick={() => setDebugWarpOpen(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1500,
              }}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: "420px",
                  height: "280px",
                  backgroundImage: "url('/assets/common/modal1.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  imageRendering: "pixelated",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "12px",
                  padding: "20px 22px 24px",
                  boxSizing: "border-box",
                  color: "#4E342E",
                  fontFamily: "Galmuri11-Bold",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                  {["장소", "미니게임"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDebugTab(tab)}
                      style={{
                        width: "80px",
                        height: "24px",
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        color: debugTab === tab ? "#4E342E" : "#8d684e",
                        backgroundColor: debugTab === tab ? "#f1d1a8" : "transparent",
                        border: debugTab === tab ? "2px solid #caa47d" : "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: debugTab === tab ? "bold" : "normal",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {debugTab === "장소" && (
                  <>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleWarp("GameScene")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        길
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("Hospital")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        병원
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("Hallway", { x: 750, y: 340 })}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        복도
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("Kaimaru")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        카마
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleWarp("DevelopmentRoom")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        개발실
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("Room103")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        103
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("Room104")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        104
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWarp("MyRoom")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        마이룸
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleWarp("Ground")}
                        style={{
                          width: "64px",
                          height: "28px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        운동장
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        borderTop: "1px solid rgba(141, 104, 78, 0.35)",
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "#6b4e38" }}>
                      디버그: 장소 NPC 편지 전달 완료
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => debugCompleteLettersForPlace("Room103")}
                        style={{
                          width: "92px",
                          height: "26px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        103 완료
                      </button>
                      <button
                        type="button"
                        onClick={() => debugCompleteLettersForPlace("Room104")}
                        style={{
                          width: "92px",
                          height: "26px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        104 완료
                      </button>
                      <button
                        type="button"
                        onClick={() => debugCompleteLettersForPlace("Ground")}
                        style={{
                          width: "92px",
                          height: "26px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        운동장 완료
                      </button>
                      <button
                        type="button"
                        onClick={() => debugCompleteLettersForPlace("Kaimaru")}
                        style={{
                          width: "92px",
                          height: "26px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        카이마루 완료
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          debugCompleteLettersForPlace("DevelopmentRoom")
                        }
                        style={{
                          width: "92px",
                          height: "26px",
                          fontFamily: "Galmuri11-Bold",
                          fontSize: "10px",
                          color: "#4E342E",
                          backgroundColor: "#f1d1a8",
                          border: "2px solid #caa47d",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        개발실 완료
                      </button>
                    </div>
                  </>
                )}

                {debugTab === "미니게임" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMiniGame(true);
                        setDebugWarpOpen(false);
                      }}
                      style={{
                        width: "80px",
                        height: "32px",
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        color: "#4E342E",
                        backgroundColor: "#f1d1a8",
                        border: "2px solid #caa47d",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      103호
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeartQuest(true);
                        setDebugWarpOpen(false);
                      }}
                      style={{
                        width: "80px",
                        height: "32px",
                        fontFamily: "Galmuri11-Bold",
                        fontSize: "10px",
                        color: "#4E342E",
                        backgroundColor: "#f1d1a8",
                        border: "2px solid #caa47d",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      104호
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setDebugWarpOpen(false)}
                  style={{
                    width: "70px",
                    height: "22px",
                    fontFamily: "Galmuri11-Bold",
                    fontSize: "10px",
                    color: "#4E342E",
                    backgroundColor: "#f1d1a8",
                    border: "2px solid #caa47d",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          )}

        </>
      )
      }

      <MiniGameModal
        isOpen={showMiniGame}
        onClose={() => {
          setShowMiniGame(false);
          setIsQuestCompleted(true);
        }}
        onWin={() => {
          setRoom103MiniGameCompleted(true);
          window.dispatchEvent(new CustomEvent("open-exit-confirm", { detail: { roomKey: "EnterRoom103" } }));
        }}
      />

      <MathMiniGameModal
        isOpen={showMathGame}
        onClose={() => setShowMathGame(false)}
        onWin={() => {
          setMathGameSolved(true);
          setShowMathGame(false);
          openRoom104AfterMathDialog();
        }}
      />

      <RunningGameModal
        isOpen={showRunningGame}
        onClose={() => setShowRunningGame(false)}
        onWin={() => {
          setGroundItbRunningCompleted(true);
          if (gameRef.current) {
            gameRef.current.registry.set("groundItbRunningCompleted", true);
          }
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-itb" } }));
          window.dispatchEvent(new CustomEvent("interact-npc", { detail: { npcId: "npc-itb" } }));
          setShowRunningGame(false);
        }}
      />

      <CatchBallModal
        isOpen={showCatchBall}
        onClose={() => setShowCatchBall(false)}
        onWin={() => {
          setGroundCatchBallCompleted(true);
          if (gameRef.current) {
            gameRef.current.registry.set("groundCatchBallCompleted", true);
          }
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-mdh" } }));
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-psj" } }));
          setShowCatchBall(false);
        }}
      />

      <HospitalGameModal
        isOpen={showHospitalGame}
        onClose={() => setShowHospitalGame(false)}
        onWin={() => {
          setShowHospitalGame(false);
        }}
      />
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          const sceneKey = exitRoomKey;
          if (!sceneKey) return;

          if (
            (sceneKey === "EnterKaimaru" || sceneKey === "EnterGround") &&
            !room103LettersDelivered
          ) {
            openPre103GateDialog();
            return;
          }

          let targetScene = null;
          let targetData = undefined;

          // Special handling for Hospital Entry with Scooter Animation
          if (sceneKey === "EnterDevelopmentRoom") {
            const activeSceneKey =
              gameRef.current?.scene
                ?.getScenes(true)
                ?.find((s) => s?.sys?.settings?.active)?.sys?.settings?.key ??
              gameRef.current?.scene?.getScenes(true)?.[0]?.sys?.settings?.key;
            const skipScooter =
              exitRoomData?.noScooter === true || activeSceneKey === "Ground";

            if (skipScooter) {
              transitionToScene("DevelopmentRoom");
              return;
            }
            playWheelSfx();
            setShowScooterAnim(true);

            setTimeout(() => {
              setShowScooterAnim(false);
              transitionToScene("DevelopmentRoom");
            }, 2500);
            return;
          }

          if (sceneKey === "EnterHospital") {
            setShowScooterAnim(true);

            // Wait for animation to finish (e.g. 2.5s) then warp
            setTimeout(() => {
              setShowScooterAnim(false);
              transitionToScene("Hospital");
            }, 2500);
            return;
          }

          if (sceneKey === "LeaveHospital") {
            setShowScooterReverse(true);
            setShowExitConfirm(false); // Close modal immediately

            setTimeout(() => {
              setShowScooterReverse(false);
              transitionToScene("DevelopmentRoom");
            }, 2500);
            return;
          }

          if (sceneKey === "EnterHallway") {
            targetScene = "Hallway";
            targetData = { x: 150, y: 340 };
          } else if (sceneKey === "EnterRoom103") {
            targetScene = "Room103";
          } else if (sceneKey === "EnterRoom104") {
            targetScene = "Room104";
          } else if (sceneKey === "LeaveHallway") {
            targetScene = "GameScene";
            targetData = { x: 260, y: 340 };
          } else if (sceneKey === "EnterGround") {
            targetScene = "Ground";
            targetData = {
              x: exitRoomData?.x ?? 260,
              y: 180,
            };
          } else if (sceneKey === "EnterKaimaru") {
            targetScene = "Kaimaru";
          } else if (sceneKey === "LeaveKaimaru") {
            targetScene = "GameScene";
            targetData = { x: 900, y: 360 };
          } else if (sceneKey === "LeaveGround") {
            targetScene = "GameScene";
            targetData = { x: 260, y: 340 };
          } else if (sceneKey === "LeaveMyRoom") {
            targetScene = "Hallway";
            targetData = { x: 750, y: 330 };
          } else if (sceneKey.startsWith("Room")) {
            const roomNum = sceneKey.replace("Room", "");
            const exitCoords = roomNum === "103" ? { x: 750, y: 330 } : { x: 1050, y: 330 };
            targetScene = "Hallway";
            targetData = exitCoords;
            if (sceneKey === "Room104") {
              // Ensure hallway marker doesn't reappear after exiting Room104.
              setRoom104QuestionActive(false);
              if (gameRef.current) {
                gameRef.current.registry.set("room104QuestionActive", false);
              }
            }
          }

          if (targetScene) {
            transitionToScene(targetScene, targetData);
          }
        }}
        message={(() => {
          if (exitRoomData?.message) return exitRoomData.message;
          if (!exitRoomKey) return "";
          if (exitRoomKey === "EnterHallway") return "사랑관으로 이동하시겠습니까?";
          if (exitRoomKey === "EnterHospital") return "병원으로 이동하시겠습니까?";
          if (exitRoomKey === "EnterDevelopmentRoom") return "자동차 개발실로 이동할까요?";
          if (exitRoomKey === "LeaveHallway" || exitRoomKey === "LeaveKaimaru" || exitRoomKey === "LeaveGround") return "도로로 이동하시겠습니까?";
          if (exitRoomKey === "LeaveHospital" || exitRoomKey === "DevelopmentRoom") return "개발실로 이동하시겠습니까?";
          if (exitRoomKey === "EnterKaimaru") return "카이마루로 이동하시겠습니까?";
          if (exitRoomKey === "EnterGround") return "운동장으로 이동하시겠습니까?";
          if (exitRoomKey.startsWith("EnterRoom")) return `${exitRoomKey.replace("EnterRoom", "")}호로 이동하시겠습니까?`;
          if (exitRoomKey.startsWith("Room") || exitRoomKey === "LeaveMyRoom") return "복도로 이동하시겠습니까?";
          return "이동하시겠습니까?";
        })()}
      />

      {/* Scooter Animation Overlay */}
      {
        showScooterAnim && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 99999,
              backgroundImage: "url('/assets/hospital/road1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              overflow: "hidden",
            }}
          >
            <style>{`
            @keyframes scooterMove {
              0% { transform: translateX(-300px); }
              100% { transform: translateX(120vw); }
            }
          `}</style>
            <img
              src="/assets/hospital/scooter_ride.png"
              alt="Scooter"
              style={{
                width: "280px",
                marginBottom: "8%",
                marginLeft: "0px",
                animation: "scooterMove 2.5s linear forwards",
                imageRendering: "pixelated",
              }}
            />
          </div>
        )
      }

      {
        showScooterReverse && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 99999,
              backgroundImage: "url('/assets/hospital/road1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              overflow: "hidden",
            }}
          >
            <style>{`
            @keyframes scooterMoveReverse {
              0% { transform: translateX(100vw) scaleX(-1); }
              100% { transform: translateX(-300px) scaleX(-1); }
            }
          `}</style>
            <img
              src="/assets/hospital/scooter_ride.png"
              alt="Scooter"
              style={{
                width: "280px",
                marginBottom: "8%",
                marginLeft: "0px",
                animation: "scooterMoveReverse 2.5s linear forwards",
                imageRendering: "pixelated",
              }}
            />
          </div>
        )
      }

      <HeartQuestModal
        isOpen={showHeartQuest}
        onClose={() => setShowHeartQuest(false)}
        onWin={() => {
          setIsQuestCompleted(true);
        }}
        onFail={() => alert("...")}
      />
      <ExitConfirmModal
        isOpen={showLyjQuestConfirm}
        message="헤드셋을 찾아줄래?"
        onCancel={() => setShowLyjQuestConfirm(false)}
        onConfirm={() => {
          setShowLyjQuestConfirm(false);
          setLyjQuestAccepted(true);
        }}
      />

      {showIntro && <IntroScreen onStart={handleIntroStart} />}

      <div
        style={{
          position: "fixed",
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          width: "24px",
          height: "24px",
          backgroundImage: isHolding
            ? "url('/assets/common/holding.png')"
            : "url('/assets/common/mouse.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          pointerEvents: "none",
          zIndex: 20000,
          transform: "translate(-2px, -2px)",
        }}
      />
      <EatingGameModal
        isOpen={showEatingGame}
        onClose={() => setShowEatingGame(false)}
        onWin={() => {
          setEatingGameSolved(true);
          setShowEatingGame(false);
          window.dispatchEvent(new CustomEvent("eating-game-won"));
        }}
      />
    </div>
  );
}

export default App;







