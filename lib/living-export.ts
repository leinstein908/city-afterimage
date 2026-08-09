import type { RecommendationResult } from "./living-types";

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const characters = [...text];
  let line = "";
  let lineIndex = 0;
  for (const char of characters) {
    const next = line + char;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      line = char;
      lineIndex += 1;
      if (lineIndex >= maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (lineIndex < maxLines) context.fillText(line, x, y + lineIndex * lineHeight);
}

function makeCanvas(result: RecommendationResult, heroTitle: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const paper = "#f1eddf";
  const ink = "#171914";
  const acid = "#d9ff45";
  const coral = "#ff5c3a";
  const blue = "#2868ff";
  const first = result.recommendations[0];

  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(23,25,20,.08)";
  context.lineWidth = 1;
  for (let y = 24; y < canvas.height; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  for (let x = 24; x < canvas.width; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  context.fillStyle = ink;
  context.fillRect(0, 0, 1080, 126);
  context.fillStyle = paper;
  context.font = '700 38px "PingFang SC", sans-serif';
  context.fillText("城市潜像", 64, 68);
  context.font = '500 18px Arial, sans-serif';
  context.fillText(`LIVE INTO MY DAY  /  ${result.code}`, 64, 100);
  context.textAlign = "right";
  context.fillText("WUHAN · PRIVATE ISSUE", 1016, 74);
  context.textAlign = "left";

  context.fillStyle = coral;
  context.font = '800 24px "PingFang SC", sans-serif';
  context.fillText(`${heroTitle}的生活圈显影`, 64, 194);
  context.fillStyle = ink;
  context.font = '800 62px "PingFang SC", sans-serif';
  context.fillText(first.circle.name, 64, 278);
  context.font = '600 27px "PingFang SC", sans-serif';
  wrapText(context, result.afterimage.declaration, 64, 338, 920, 42, 3);

  const mapX = 64;
  const mapY = 470;
  const mapW = 952;
  const mapH = 500;
  context.fillStyle = "#dcd7c9";
  context.fillRect(mapX, mapY, mapW, mapH);
  context.strokeStyle = blue;
  context.lineWidth = 42;
  context.globalAlpha = 0.55;
  context.beginPath();
  context.moveTo(mapX + 180, mapY - 30);
  context.bezierCurveTo(mapX + 410, mapY + 150, mapX + 370, mapY + 370, mapX + 680, mapY + 540);
  context.stroke();
  context.globalAlpha = 1;

  result.recommendations.forEach((recommendation, index) => {
    const x = mapX + (recommendation.circle.mapPosition.x / 100) * mapW;
    const y = mapY + (recommendation.circle.mapPosition.y / 100) * mapH;
    const colors = [coral, acid, blue];
    context.fillStyle = colors[index];
    context.beginPath();
    context.arc(x, y, index === 0 ? 25 : 18, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = ink;
    context.font = '700 20px "PingFang SC", sans-serif';
    context.fillText(recommendation.circle.name, x + 30, y - 4);
    context.font = '500 15px Arial, sans-serif';
    context.fillText(`${recommendation.roleLabel}  ${recommendation.score}%`, x + 30, y + 20);
  });

  context.fillStyle = ink;
  context.font = '800 22px "PingFang SC", sans-serif';
  context.fillText("住进一个普通星期三", 64, 1030);
  first.weekday.stops.slice(0, 3).forEach((stop, index) => {
    const x = 64 + index * 318;
    context.fillStyle = index === 0 ? coral : ink;
    context.font = '800 27px Arial, sans-serif';
    context.fillText(stop.time, x, 1090);
    context.fillStyle = ink;
    context.font = '700 19px "PingFang SC", sans-serif';
    wrapText(context, stop.title, x, 1130, 276, 28, 2);
  });

  context.fillStyle = acid;
  context.fillRect(64, 1232, 952, 112);
  context.fillStyle = ink;
  context.font = '800 22px "PingFang SC", sans-serif';
  context.fillText("为什么是这里", 88, 1273);
  context.font = '500 19px "PingFang SC", sans-serif';
  wrapText(context, first.evidence.map((item) => item.label).join(" · "), 88, 1312, 880, 28, 2);

  context.fillStyle = "rgba(23,25,20,.65)";
  context.font = '500 17px "PingFang SC", sans-serif';
  context.fillText("不是房源承诺，是一张关于如何生活的私人城市杂志。", 64, 1395);
  context.textAlign = "right";
  context.fillText("城市潜像 · 住进我的一天", 1016, 1395);
  context.textAlign = "left";
  return canvas;
}

async function makeFile(result: RecommendationResult, heroTitle: string) {
  const canvas = makeCanvas(result, heroTitle);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("Export failed"))), "image/png");
  });
  return new File([blob], `${result.recommendations[0].circle.name}-我的生活圈.png`, {
    type: "image/png",
  });
}

export async function shareLivingCover(result: RecommendationResult, heroTitle: string) {
  const file = await makeFile(result, heroTitle);
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: "我的武汉生活圈潜像",
        text: result.afterimage.declaration,
        files: [file],
      });
      return "shared" as const;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled" as const;
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded" as const;
}
