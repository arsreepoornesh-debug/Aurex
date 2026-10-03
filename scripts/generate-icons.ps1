Add-Type -AssemblyName System.Drawing

function Create-AurexIcon {
    param (
        [int]$size,
        [string]$outputPath,
        [bool]$maskable
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # 1. Background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 15, 29))
    $g.FillRectangle($bgBrush, $rect)

    # 2. Outer decorative circle
    $margin = if ($maskable) { [int]($size * 0.14) } else { [int]($size * 0.06) }
    $circleSize = $size - (2 * $margin)
    $circleRect = New-Object System.Drawing.Rectangle($margin, $margin, $circleSize, $circleSize)
    
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $circleRect,
        [System.Drawing.Color]::FromArgb(255, 16, 185, 129),
        [System.Drawing.Color]::FromArgb(255, 13, 148, 136),
        45.0
    )
    $g.FillEllipse($gradBrush, $circleRect)

    # 3. Inner dark center
    $innerPad = [int]($size * 0.035)
    $innerSize = $circleSize - (2 * $innerPad)
    $innerRect = New-Object System.Drawing.Rectangle(($margin + $innerPad), ($margin + $innerPad), $innerSize, $innerSize)
    $innerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $g.FillEllipse($innerBrush, $innerRect)

    # 4. Stylized 'A' + ECG heartbeat pulse
    $goldColor = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)
    $emeraldColor = [System.Drawing.Color]::FromArgb(255, 52, 211, 153)

    $penWidth = [Math]::Max(3.0, ($size * 0.06))
    $pen = New-Object System.Drawing.Pen($emeraldColor, $penWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $cx = [float]($size / 2.0)
    $cy = [float]($size / 2.0)
    $span = [float]($size * 0.22)

    # Apex and legs of 'A'
    $pTop = New-Object System.Drawing.PointF($cx, [float]($cy - ($span * 1.1)))
    $pLeft = New-Object System.Drawing.PointF([float]($cx - ($span * 0.85)), [float]($cy + ($span * 0.95)))
    $pRight = New-Object System.Drawing.PointF([float]($cx + ($span * 0.85)), [float]($cy + ($span * 0.95)))

    $g.DrawLine($pen, $pTop, $pLeft)
    $g.DrawLine($pen, $pTop, $pRight)

    # Clinical ECG pulse crossbar in Gold
    $pulsePen = New-Object System.Drawing.Pen($goldColor, [Math]::Max(2.5, ($size * 0.05)))
    $pulsePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pulsePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $yCross = [float]($cy + ($span * 0.15))
    $pts = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float]($cx - ($span * 0.9)), $yCross)),
        (New-Object System.Drawing.PointF([float]($cx - ($span * 0.35)), $yCross)),
        (New-Object System.Drawing.PointF([float]($cx - ($span * 0.15)), [float]($yCross + ($span * 0.38)))),
        (New-Object System.Drawing.PointF($cx, [float]($yCross - ($span * 0.6)))),
        (New-Object System.Drawing.PointF([float]($cx + ($span * 0.18)), [float]($yCross + ($span * 0.28)))),
        (New-Object System.Drawing.PointF([float]($cx + ($span * 0.35)), $yCross)),
        (New-Object System.Drawing.PointF([float]($cx + ($span * 0.9)), $yCross))
    )
    $g.DrawLines($pulsePen, $pts)

    # Save
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outputPath ($size x $size)"
}

Create-AurexIcon -size 192 -outputPath "public/icon-192.png" -maskable $false
Create-AurexIcon -size 512 -outputPath "public/icon-512.png" -maskable $false
Create-AurexIcon -size 192 -outputPath "public/icon-maskable-192.png" -maskable $true
Create-AurexIcon -size 512 -outputPath "public/icon-maskable-512.png" -maskable $true
Create-AurexIcon -size 180 -outputPath "public/apple-touch-icon.png" -maskable $false
Create-AurexIcon -size 32 -outputPath "public/favicon-32x32.png" -maskable $false
Create-AurexIcon -size 48 -outputPath "public/favicon.ico" -maskable $false
