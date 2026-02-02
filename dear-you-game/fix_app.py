import re

# Read the original file
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = re.sub(
    r'import React, \{ useEffect, useState, useRef \} from "react";',
    'import React, { useCallback, useEffect, useState, useRef } from "react";',
    content
)

content = re.sub(
    r'(import IntroScreen from "./components/IntroScreen";)',
    r'\1\nimport TimeWidget from "./components/TimeWidget";',
    content
)

# 2. Add BGM state and handler after showIntro state
bgm_code = '''  const [bgm, setBgm] = useState(null);

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

  const handleIntroStart = useCallback(() => {
    setShowIntro(false);
    if (!bgm) return;
    const playPromise = bgm.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [bgm]);
'''

content = re.sub(
    r'(const \[showIntro, setShowIntro\] = useState\(true\);)',
    r'\1\n' + bgm_code,
    content
)

# 3. Remove Phaser BGM code
content = re.sub(
    r'\s*this\.bgm = this\.sound\.add\("bgm", \{ loop: true, volume: 0\.35 \}\);.*?\n.*?this\.bgm\.play\(\);.*?\n.*?\}.*?\n',
    '\n',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'\s*this\.load\.audio\("bgm", `\$\{commonPath\}bgm\.mp3`\);.*?\n',
    '\n',
    content
)

# 4. Update Quest button: change onClick, size, and position
content = re.sub(
    r'onClick=\{\(\) => setShowMiniGame\(true\)\}',
    'onClick={() => alert("퀘스트 메뉴 준비중!")}',
    content
)

content = re.sub(
    r'right: "30px",',
    'right: "15px",',
    content
)

content = re.sub(
    r'width: "80px",(\s+height: "auto",\s+imageRendering: "pixelated",\s+filter: "drop-shadow\(0 4px 8px rgba\(0, 0, 0, 0\.4\)\)",)',
    r'width: "60px",\1',
    content
)

# 5. Add TimeWidget and update IntroScreen handler
content = re.sub(
    r'(\{showIntro && <IntroScreen onStart=\{\(\) => setShowIntro\(false\)\} />\})',
    r'{!showIntro && <TimeWidget />}\n      \1',
    content
)

content = re.sub(
    r'<IntroScreen onStart=\{\(\) => setShowIntro\(false\)\} />',
    '<IntroScreen onStart={handleIntroStart} />',
    content
)

# Write the modified content
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("App.jsx updated successfully!")
