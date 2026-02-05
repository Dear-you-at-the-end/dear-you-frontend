import React, { useCallback, useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import "./App.css";
import MathMiniGameModal from "./components/MathMiniGameModal";
import MiniGameModal from "./components/MiniGameModal";
import RunningGameModal from "./components/RunningGameModal";
import CatchBallModal from "./components/CatchBallModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import HeartQuestModal from "./components/HeartQuestModal";
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
  const [showRunningGame, setShowRunningGame] = useState(false);
  const [showCatchBall, setShowCatchBall] = useState(false);
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
  const [showNextQuest, setShowNextQuest] = useState(false);
  const checklistTimerRef = useRef(null);
  const [gameMinutes, setGameMinutes] = useState(0);
  const [letterCount, setLetterCount] = useState(21);
  const [writtenCount, setWrittenCount] = useState(0);
  const [npcs, setNpcs] = useState([
    { id: "npc-103-1", name: "SYY", hasLetter: false, hasWritten: false },
    { id: "npc-103-2", name: "KMS", hasLetter: false, hasWritten: false },
    { id: "npc-103-3", name: "PCW", hasLetter: false, hasWritten: false },
    { id: "npc-104-1", name: "IG", hasLetter: false, hasWritten: false },
    { id: "npc-104-2", name: "INJ", hasLetter: false, hasWritten: false },
    { id: "npc-lyj", name: "lyj", hasLetter: false, hasWritten: false },
    { id: "npc-itb", name: "itb", hasLetter: false, hasWritten: false },
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
  const isSceneTransitioningRef = useRef(false);
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
    return () => {
      window.removeEventListener("ban-door", handleBanToast);
      if (banToastTimerRef.current) {
        clearTimeout(banToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleExitConfirm = (e) => {
      const key = e.detail?.roomKey ?? e.detail?.key;
      setExitRoomKey(key);
      setExitRoomData(e.detail ?? null);
      setShowExitConfirm(true);
    };
    window.addEventListener("open-exit-confirm", handleExitConfirm);
    return () => window.removeEventListener("open-exit-confirm", handleExitConfirm);
  }, []);

  useEffect(() => {
    const onOpeningStart = () => setIsOpeningScene(true);
    const onOpeningEnd = () => {
      setIsOpeningScene(false);
      setChecklistOpen(true);
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
    window.addEventListener("room-103-minigame-start", handleRoom103MiniGameStart);
    return () => {
      window.removeEventListener("room-103-minigame-start", handleRoom103MiniGameStart);
    };
  }, [room103MiniGameCompleted]);

  const handleChecklistClick = useCallback(() => {
    if (checklistTimerRef.current) {
      clearTimeout(checklistTimerRef.current);
    }
    setChecklistOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setShowNextQuest(true);
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

  const handleWarp = useCallback((sceneKey, data) => {
    transitionToScene(sceneKey, data);
    setDebugWarpOpen(false);
  }, [transitionToScene]);

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
      if (showMiniGame || showWriteConfirm || showLetterWrite || showLetterRead) {
        return;
      }
      accumulatedTimeRef.current += gameMinutesPerRealSecond;
      // Round down to nearest 10 minutes
      const steps = Math.floor(accumulatedTimeRef.current / 10) * 10;
      setGameMinutes(Math.min(540, steps));
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [showIntro, showMiniGame, showWriteConfirm, showLetterWrite, showLetterRead]);

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

  useEffect(() => {
    const handleInteract = (e) => {
      const { npcId } = e.detail;
      if (npcId === "npc-itb") {
        setShowRunningGame(true);
        return;
      }
      if (npcId === "npc-mdh-psj") {
        setShowCatchBall(true);
        return;
      }
      const npcState = gameStateRef.current.getNpcState(npcId);
      if (!npcState) return;

      const { hasLetter, hasWritten } = npcState;
      const letterCount = gameStateRef.current.getLetterCount();
      const selectedSlot = gameStateRef.current.getSelectedSlot();
      const writtenCount = gameStateRef.current.getWrittenCount();

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
        // alert("이미 편지를 썼습니다. 인벤토리에서 편지를 선택해 전달하세요.");
      }
    };

    window.addEventListener("interact-npc", handleInteract);
    return () => window.removeEventListener("interact-npc", handleInteract);
  }, []);

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

  useEffect(() => {
    if (showIntro) return; // Do not initialize game until intro is done
    gameStateRef.current.isMiniGameOpen = showMiniGame;
    gameStateRef.current.getSelectedSlot = () => selectedSlot;
    gameStateRef.current.getLetterCount = () => letterCount;
    gameStateRef.current.getWrittenCount = () => writtenCount;
    gameStateRef.current.getNpcState = (id) => npcs.find((n) => n.id === id);
    gameStateRef.current.getLetterGroups = () => letterGroups;
    gameStateRef.current.getMathGameSolved = () => mathGameSolved;
    gameStateRef.current.setShowMathGame = setShowMathGame;
    if (gameRef.current) {
      gameRef.current.registry.set("selectedSlot", selectedSlot);
      gameRef.current.registry.set("letterCount", letterCount);
      gameRef.current.registry.set("writtenCount", writtenCount);
      gameRef.current.registry.set("writtenLetters", writtenLetters);
      gameRef.current.registry.set("room103MiniGameCompleted", room103MiniGameCompleted);
    }
  }, [showMiniGame, showIntro, selectedSlot, letterCount, writtenCount, npcs, writtenLetters, letterGroups, room103MiniGameCompleted]);

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

      createFurniture({ x: leftX, y: row1Y, texture: "deskl", scaleX: 1 });
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
          .setDepth(Math.round(y));
      };
      // Left wall desk chair
      placeChair(leftX - 22, row1Y + 8, "chair_left");

      // Right wall desks: skip in Room104 (right desks excluded)
      if (this.scene.key !== "Room104") {
        placeChair(rightX + 22, row1Y + 8, "chair_right");
        placeChair(rightX + 22, row2Y + 8, "chair_right");
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
          { id: "npc-103-1", x: leftX + 40, y: row2Y + 20, anim: "swy-wiggle", texture: "swy" },
          { id: "npc-103-2", x: leftX + 40, y: row3Y + 22, anim: "kms-wiggle", texture: "kms" },
          { id: "npc-103-3", x: rightX - 30, y: row2Y + 18, anim: "pcw-wiggle", texture: "pcw" },
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
            fontSize: "12px",
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

      // Also create specific NPC anims if needed (using same sprite sheet structure)
      ["ig", "inj"].forEach(name => {
        if (this.anims.exists(`${name}-idle-left`)) return;
        // Example: reuse main_character frames but with different texture key
        this.anims.create({
          key: `${name}-idle-left`,
          frames: this.anims.generateFrameNames(name, {
            start: 12, end: 15, // idle-left
            prefix: "16x16 All Animations ",
            suffix: ".aseprite"
          }),
          frameRate: 4,
          repeat: -1
        });
        this.anims.create({
          key: `${name}-idle-right`,
          frames: this.anims.generateFrameNames(name, {
            start: 4, end: 7, // idle-right
            prefix: "16x16 All Animations ",
            suffix: ".aseprite"
          }),
          frameRate: 4,
          repeat: -1
        });
      });
    }

    function update() {
      if (!this.player) return;

      if (gameStateRef.current.isMiniGameOpen) {
        this.player.body.setVelocity(0);
        return;
      }

      // Interaction
      let closestNpc = null;
      let minDistance = 60;
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
          const hasLetter = npcState?.hasLetter ?? false;
          iconSet.questIcon.setVisible(!hasLetter && !iconSet.happyIcon.visible);
        });
      }

      // Update NPC Name Visibility
      if (this.npcs) {
        this.npcs.children.iterate((npc) => {
          if (npc.nameText) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            // Show name if close enough (e.g., < 60px)
            if (dist < 60) {
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
          setExitRoomKey(this.scene.key);
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          return;
        }
        // Move down check
        if (this.moveKeys.down.isDown || this.moveKeys.s.isDown) {
          setExitRoomKey(this.scene.key);
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          return;
        }
      }

      // NPC Interaction
      if (isNearNPC && !this.interactionCooldown) {
        if (rightJustDown) {
          if ((this.npcId === "npc-104-1" || this.npcId === "npc-104-2") && !gameStateRef.current.getMathGameSolved()) {
            gameStateRef.current.setShowMathGame(true);
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
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "14px", textAlign: "center" }}>
                  {`${npcs.find((n) => n.id === interactionTargetId)?.name ?? ""}에게 ${confirmMode === "give" ? "편지를 건네시겠습니까?" : "편지를 쓰시겠습니까?"}`}
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <div
                    onClick={() => {
                      setShowWriteConfirm(false);
                      const targetId = interactionTargetId;
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
                        window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: targetId } }));
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
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "16px", color: "white", textShadow: "1px 1px 2px black" }}>편지 작성하기</div>
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
                          fontSize: "12px",
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
                    fontSize: "14px",
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
                <div style={{ fontFamily: "Galmuri11-Bold", fontSize: "16px", color: "white", textShadow: "1px 1px 2px black" }}>편지 읽기</div>
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
                        fontSize: "12px",
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
                      fontSize: "14px",
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
                      fontSize: "14px",
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
              const groupIndex = index - 1;
              const group = index > 0 ? letterGroups[groupIndex] : null;
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
                          fontSize: "11px",
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
                        {group.letters.length}
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
              right: checklistOpen ? "16px" : "-290px", // Slide in/out
              width: "340px",
              height: "230px",
              backgroundImage: "url('/assets/common/modal1.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              imageRendering: "pixelated",
              zIndex: 135,
              display: "flex",
              flexDirection: "column",
              padding: "22px 28px",
              boxSizing: "border-box",
              transition: "right 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
              cursor: "pointer",
            }}
          >
            <h3
              style={{
                fontFamily: "Galmuri11-Bold",
                fontSize: "16px",
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
                gap: "9px",
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
                      width: "20px",
                      height: "20px",
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
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {quest.completed ? "✓" : index + 1}
                  </div>

                  {/* Quest Text */}
                  <div
                    style={{
                      fontFamily: "Galmuri11-Bold",
                      fontSize: "13px",
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

            {/* Progress bar */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: "Galmuri11-Bold",
                  fontSize: "11px",
                  color: "#8d684e",
                  marginBottom: "6px",
                }}
              >
                진행도: {quests.filter((q) => q.completed).length} / {quests.length}
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  overflow: "hidden",
                  border: "1px solid #8d684e",
                }}
              >
                <div
                  style={{
                    width: `${(quests.filter((q) => q.completed).length / quests.length) * 100}%`,
                    height: "100%",
                    backgroundColor: "#6d8c54",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
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
              fontSize: "13px",
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
                  justifyContent: "center",
                  gap: "12px",
                  padding: "20px 22px 24px",
                  boxSizing: "border-box",
                  color: "#4E342E",
                  fontFamily: "Galmuri11-Bold",
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
                        fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                          fontSize: "11px",
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
                        fontSize: "11px",
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
                        fontSize: "11px",
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
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          const sceneKey = exitRoomKey;
          if (!sceneKey) return;

          let targetScene = null;
          let targetData = undefined;

          // Special handling for Hospital Entry with Scooter Animation
          if (sceneKey === "EnterDevelopmentRoom") {
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
          }

          if (targetScene) {
            transitionToScene(targetScene, targetData);
          }
        }}
        message={(() => {
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
                width: "300px",
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
                width: "300px",
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

      <MathMiniGameModal
        isOpen={showMathGame}
        onClose={() => setShowMathGame(false)}
        onWin={() => {
          setMathGameSolved(true);
          setShowMathGame(false);
          alert("정답입니다! 이제 편지를 전달할 수 있습니다.");
        }}
      />

      <RunningGameModal
        isOpen={showRunningGame}
        onClose={() => setShowRunningGame(false)}
        onWin={() => {
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-itb" } }));
          // Give a reward or just close? User didn't specify.
          // But usually we mark quest completion or something.
          // For now, just trigger happy event and close.
          setShowRunningGame(false);
        }}
      />

      <CatchBallModal
        isOpen={showCatchBall}
        onClose={() => setShowCatchBall(false)}
        onWin={() => {
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-mdh" } }));
          window.dispatchEvent(new CustomEvent("npc-happy", { detail: { npcId: "npc-psj" } }));
          setShowCatchBall(false);
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
    </div >
  );
}

export default App;












