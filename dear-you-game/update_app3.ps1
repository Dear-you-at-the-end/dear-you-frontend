$filePath = "src/App.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# MiniGameModal 다음에 ExitConfirmModal 추가
$modalPattern = '(<MiniGameModal[^>]*onWin=\{[^\}]+\}\s*/?>)'
$modalReplacement = @'
$1

      <ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirm={() => {
          setShowExitConfirm(false);
          alert("복도로 이동합니다!");
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
'@

if ($content -notmatch 'ExitConfirmModal.*isOpen') {
    $content = $content -replace $modalPattern, $modalReplacement
    $content | Set-Content $filePath -Encoding UTF8 -NoNewline
    Write-Output "Added ExitConfirmModal to return"
} else {
    Write-Output "ExitConfirmModal already exists"
}
