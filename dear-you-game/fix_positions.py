import re

# Read the original file
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update furniture positioning to be inside the room and closer together
old_positions = r'''      const marginX = 55;
      const leftX = startX \+ marginX;
      const rightX = startX \+ roomW - marginX;
      
      // Y positions for 4 rows
      const row1Y = startY \+ 120;  // Top row
      const row2Y = startY \+ 215;  // Second row
      const row3Y = startY \+ 310;  // Third row
      const row4Y = startY \+ 405;  // Bottom row'''

new_positions = '''      const marginX = 75;  // More margin to keep furniture inside walls
      const leftX = startX + marginX;
      const rightX = startX + roomW - marginX;
      
      // Y positions for 4 rows - tighter spacing, realistic overlap
      const row1Y = startY + 135;  // Top row - below wall
      const row2Y = startY + 215;  // Second row
      const row3Y = startY + 295;  // Third row - tighter
      const row4Y = startY + 375;  // Bottom row - above door'''

content = re.sub(old_positions, new_positions, content, flags=re.DOTALL)

# Write the modified content
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Furniture positions updated!")
print("- Increased wall margin: 55 → 75")
print("- Adjusted Y positions to fit inside room")
print("- Tighter spacing for realistic placement")
