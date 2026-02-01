$filePath = "src/App.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# update 함수에 문 상호작용 로직 추가
$updatePattern = '(?s)(// Interaction & Jump logic.*?const isNearNPC.*?}\s*else\s*{)'
$updateReplacement = @'
// Interaction & Jump logic
      const isNearNPC = this.npc && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y) < 60;
      const isNearDoor = this.door && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.door.x, this.door.y) < 50;

      // Door interaction
      if (isNearDoor) {
        this.exitText.setVisible(true);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          gameStateRef.current.setShowExitConfirm(true);
          this.player.body.setVelocity(0);
          this.player.anims.play(`idle-${this.lastDirection}`, true);
          return;
        }
      } else {
        this.exitText.setVisible(false);
      }

      // NPC interaction
      if (isNearNPC) {
        this.interactionText.setVisible(true);
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          gameStateRef.current.setShowMiniGame(true);
          this.player.body.setVelocity(0);
          this.player.anims.play(`idle-${this.lastDirection}`, true);
          return;
        }
      } else {
'@

$content = $content -replace $updatePattern, $updateReplacement

$content | Set-Content $filePath -Encoding UTF8 -NoNewline
Write-Output "Added door interaction logic"
