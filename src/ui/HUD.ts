import { Player } from '../player/Player';

export class HUD {
  public render(
    ctx: CanvasRenderingContext2D,
    player: Player,
    score: number,
    lives: number,
    remainingFlags: number,
    levelIndex: number,
    width: number
  ): void {
    ctx.save();

    // Barra superior
    ctx.fillStyle = 'rgba(15, 20, 25, 0.85)';
    ctx.fillRect(0, 0, width, 50);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(width, 50);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textBaseline = 'middle';

    ctx.fillText(`NIVEL: ${levelIndex}`, 20, 25);
    ctx.fillText(`PUNTOS: ${score}`, 160, 25);

    // Vidas
    ctx.fillStyle = '#e74c3c';
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '♥ ';
    ctx.fillText(`VIDAS: ${hearts}`, 320, 25);

    // Banderas / Objetivos
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`OBJETIVOS: ${remainingFlags}`, 500, 25);

    // Depósito de aceite
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ACEITE:', width - 240, 25);

    const oilBarX = width - 160;
    const oilBarY = 15;
    const oilBarW = 120;
    const oilBarH = 20;

    ctx.fillStyle = '#111111';
    ctx.fillRect(oilBarX, oilBarY, oilBarW, oilBarH);

    const oilRatio = Math.max(0, player.currentOil / player.stats.maxOilCapacity);
    ctx.fillStyle = oilRatio > 0.3 ? '#e67e22' : '#e74c3c';
    ctx.fillRect(oilBarX + 2, oilBarY + 2, (oilBarW - 4) * oilRatio, oilBarH - 4);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(oilBarX, oilBarY, oilBarW, oilBarH);

    ctx.restore();
  }
}
