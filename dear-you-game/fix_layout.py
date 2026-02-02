import re

# Read the original file
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change room width from 450 to 380
content = re.sub(
    r'const roomW = 450;',
    'const roomW = 380;',
    content
)

# 2. Replace window with shoe rack tile at the top
window_code = r'''      this\.add
        \.image\(startX \+ 180, startY \+ 55, "window"\)
        \.setScale\(pixelScale\)
        \.setDepth\(startY \+ 55\);'''

shoe_rack_top_code = '''      // Top shoe rack area
      const shoeRackTopW = 100;
      const shoeRackTopH = 40;
      this.add
        .tileSprite(centerX, startY + 55, shoeRackTopW, shoeRackTopH, "tile2")
        .setTileScale(pixelScale)
        .setDepth(0);'''

content = re.sub(window_code, shoe_rack_top_code, content, flags=re.DOTALL)

# 3. Replace furniture layout to match the UI design
old_furniture = r'''      const marginX = 70;
      const leftX = startX \+ marginX;
      const rightX = startX \+ roomW - marginX;
      const topY = startY \+ 110;
      const midY = startY \+ 235;
      const lowY = startY \+ 360;
      const bottomY = startY \+ roomH - 70;

      // 왼쪽 벽 배치 \(위아래\)
      createFurniture\(\{ x: leftX, y: topY, texture: "deskl", scaleX: 1 \}\);
      createFurniture\(\{ x: leftX, y: midY, texture: "bed", scaleX: 0\.85 \}\);
      createFurniture\(\{ x: leftX, y: lowY, texture: "closet", scaleX: 1 \}\);

      // 오른쪽 벽 배치 \(위아래\)
      createFurniture\(\{ x: rightX, y: topY, texture: "deskr", scaleX: 1 \}\);
      createFurniture\(\{ x: rightX, y: midY, texture: "bed", scaleX: 0\.85 \}\);
      createFurniture\(\{ x: rightX, y: bottomY, texture: "closet", scaleX: 1 \}\);'''

new_furniture = '''      const marginX = 55;
      const leftX = startX + marginX;
      const rightX = startX + roomW - marginX;
      
      // Y positions for 4 rows
      const row1Y = startY + 120;  // Top row
      const row2Y = startY + 215;  // Second row
      const row3Y = startY + 310;  // Third row
      const row4Y = startY + 405;  // Bottom row

      // Left side (from top to bottom): 책상, 침대, 옷장, 옷장
      createFurniture({ x: leftX, y: row1Y, texture: "deskl", scaleX: 1 });
      createFurniture({ x: leftX, y: row2Y, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: leftX, y: row3Y, texture: "closet", scaleX: 1 });
      createFurniture({ x: leftX, y: row4Y, texture: "closet", scaleX: 1 });

      // Right side (from top to bottom): 책상, 책상, 침대, 옷장
      createFurniture({ x: rightX, y: row1Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: row2Y, texture: "deskr", scaleX: 1 });
      createFurniture({ x: rightX, y: row3Y, texture: "bed", scaleX: 0.85 });
      createFurniture({ x: rightX, y: row4Y, texture: "closet", scaleX: 1 });'''

content = re.sub(old_furniture, new_furniture, content, flags=re.DOTALL)

# Write the modified content
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dormitory layout updated successfully!")
print("- Room width: 450 → 380")
print("- Furniture: 3 desks, 2 beds, 4 closets")
print("- Top: shoe rack instead of window")
