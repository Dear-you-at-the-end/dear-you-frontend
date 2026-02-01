$filePath = "src/App.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 1. 방 크기 줄이기 (이미 450으로 되어있을 수 있음)
$content = $content -replace 'const roomW = \d+;', 'const roomW = 450;'
$content = $content -replace 'const roomH = \d+;', 'const roomH = 450;'

# 2. 기존 NPC 코드 찾기 및 교체 준비
$npcPattern = '(?s)(// NPC.*?this\.npc\.anims\.play\("idle-down"\);)'
$npcReplacement = @'
// 신발장 영역 (하단 중앙)
      const shoeRackW = 120;
      const shoeRackH = 40;
      this.add
        .tileSprite(centerX, startY + roomH - 20, shoeRackW, shoeRackH, "tile2")
        .setTileScale(pixelScale)
        .setDepth(0);

      // 문 (하단 중앙)
      this.door = this.add
        .image(centerX, startY + roomH - 20, "door")
        .setScale(pixelScale)
        .setDepth(startY + roomH - 20);

      // 문 앞 상호작용 텍스트
      this.exitText = this.add.text(centerX, startY + roomH - 60, "Press SPACE", {
        fontSize: "22px",
        fontFamily: "Galmuri",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5).setDepth(99999).setVisible(false);

      // NPCs (3명 - 각 침대 옆)
      this.npcs = [];
      
      // NPC 1 - 왼쪽 침대 옆
      const npc1 = this.physics.add.staticSprite(
        startX + 120,
        startY + 215,
        "player_idle",
        0
      );
      npc1.setScale(pixelScale);
      npc1.setDepth(npc1.y);
      npc1.refreshBody();
      npc1.anims.play("idle-down");
      this.npcs.push(npc1);

      // NPC 2 - 오른쪽 침대 옆
      const npc2 = this.physics.add.staticSprite(
        startX + roomW - 120,
        startY + 330,
        "player_idle",
        0
      );
      npc2.setScale(pixelScale);
      npc2.setDepth(npc2.y);
      npc2.refreshBody();
      npc2.anims.play("idle-left");
      this.npcs.push(npc2);

      // NPC 3 - 중앙
      const npc3 = this.physics.add.staticSprite(
        centerX,
        centerY,
        "player_idle",
        0
      );
      npc3.setScale(pixelScale);
      npc3.setDepth(npc3.y);
      npc3.refreshBody();
      npc3.anims.play("idle-down");
      this.npcs.push(npc3);

      // 첫 번째 NPC를 주요 NPC로 설정 (기존 코드 호환)
      this.npc = this.npcs[0];
'@

$content = $content -replace $npcPattern, $npcReplacement

$content | Set-Content $filePath -Encoding UTF8 -NoNewline
Write-Output "Updated App.jsx successfully"
