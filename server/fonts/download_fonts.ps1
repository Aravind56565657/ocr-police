$ErrorActionPreference = "Stop"

Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Noto%20Sans" -OutFile "NotoSans.zip"
Expand-Archive -Path "NotoSans.zip" -DestinationPath "." -Force

Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Noto%20Sans%20Telugu" -OutFile "NotoSansTelugu.zip"
Expand-Archive -Path "NotoSansTelugu.zip" -DestinationPath "." -Force

Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Noto%20Sans%20Devanagari" -OutFile "NotoSansDevanagari.zip"
Expand-Archive -Path "NotoSansDevanagari.zip" -DestinationPath "." -Force

Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Noto%20Sans%20Tamil" -OutFile "NotoSansTamil.zip"
Expand-Archive -Path "NotoSansTamil.zip" -DestinationPath "." -Force

Write-Host "Fonts Downloaded and Extracted successfully"
