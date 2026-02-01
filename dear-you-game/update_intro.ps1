$filePath = "src/App.jsx"
$lines = Get-Content $filePath -Encoding UTF8

# return 문 바로 다음에 IntroScreen 조건부 렌더링 추가
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*return \(') {
        # return ( 다음 줄에 IntroScreen 추가
        $newLines = @(
            $lines[0..$i],
            '    <>',
            '      {showIntro && <IntroScreen onStart={() => setShowIntro(false)} />}',
            '      {!showIntro && ('
        )
        
        # 나머지 줄 추가하되, 마지막 ); 전에 )}를 추가해야 함
        $rest = $lines[($i+1)..($lines.Count-1)]
        
        # 마지막 export 전 )}와 </> 추가
        for ($j = $rest.Count - 1; $j -ge 0; $j--) {
            if ($rest[$j] -match 'export default App') {
                $rest = $rest[0..($j-1)] + '      )}' + '    </>' + $rest[$j..($rest.Count-1)]
                break
            }
        }
        
        $output = $newLines + $rest
        $output | Set-Content $filePath -Encoding UTF8
        Write-Output "Added IntroScreen to return"
        break
    }
}
