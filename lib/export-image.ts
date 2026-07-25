import type { AnalysisResult, ImageCategory } from "./types";

const CATEGORY_COLORS: Record<ImageCategory, string> = {
  spatial: "#1a64ac",
  sensory: "#cf4e2b",
  cultural: "#9b3c2b",
  social: "#477263",
  emotional: "#6f5b8a",
  narrative: "#25221f",
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const characters = [...text];
  let line = "";
  let currentY = y;
  let lines = 0;
  for (let index = 0; index < characters.length; index += 1) {
    const testLine = line + characters[index];
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = characters[index];
      currentY += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        const remaining = characters.slice(index + 1).join("");
        while (
          context.measureText(`${line}${remaining}…`).width > maxWidth &&
          line.length > 1
        ) {
          line = line.slice(0, -1);
        }
        context.fillText(`${line}…`, x, currentY);
        return currentY;
      }
    } else {
      line = testLine;
    }
  }
  if (line) context.fillText(line, x, currentY);
  return currentY;
}

function drawShareCard(result: AnalysisResult) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");

  context.fillStyle = "#f4f0e7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(48, 42, 35, 0.11)";
  context.lineWidth = 1;
  for (let y = 30; y < canvas.height; y += 30) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.fillStyle = "#25221f";
  context.font = '700 36px "PingFang SC", "Noto Sans CJK SC", sans-serif';
  context.fillText("城市潜像", 76, 84);
  context.font = '500 18px "Arial", sans-serif';
  context.fillText(`CITY AFTERIMAGE  /  ${result.code}`, 76, 118);

  context.fillStyle = "#cf4e2b";
  context.font = '700 22px "PingFang SC", sans-serif';
  context.fillText(`${result.city} · PRIVATE CITY IMPRINT`, 76, 190);
  context.fillStyle = "#25221f";
  context.font = '700 48px "PingFang SC", "Noto Sans CJK SC", sans-serif';
  wrapText(context, `“${result.declaration}”`, 76, 258, 1040, 67, 3);

  const mapX = 76;
  const mapY = 430;
  const mapWidth = 1048;
  const mapHeight = 630;
  context.fillStyle = "#ebe5d8";
  roundedRect(context, mapX, mapY, mapWidth, mapHeight, 4);

  context.strokeStyle = "rgba(26, 100, 172, 0.25)";
  context.lineWidth = 38;
  context.beginPath();
  context.moveTo(640, mapY - 20);
  context.bezierCurveTo(500, 590, 780, 740, 605, mapY + mapHeight + 20);
  context.stroke();

  context.setLineDash([7, 8]);
  context.lineWidth = 2;
  context.strokeStyle = "rgba(37, 34, 31, 0.28)";
  for (let index = 1; index < result.nodes.length; index += 1) {
    const previous = result.nodes[index - 1];
    const current = result.nodes[index];
    context.beginPath();
    context.moveTo(
      mapX + (previous.x / 100) * mapWidth,
      mapY + (previous.y / 100) * mapHeight,
    );
    context.lineTo(
      mapX + (current.x / 100) * mapWidth,
      mapY + (current.y / 100) * mapHeight,
    );
    context.stroke();
  }
  context.setLineDash([]);

  result.nodes.forEach((node, index) => {
    const x = mapX + (node.x / 100) * mapWidth;
    const y = mapY + (node.y / 100) * mapHeight;
    context.fillStyle = CATEGORY_COLORS[node.category];
    context.beginPath();
    context.arc(x, y, index === 0 ? 18 : 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#25221f";
    context.font = '700 23px "PingFang SC", sans-serif';
    context.fillText(node.label.slice(0, 12), x + 22, y - 6);
    context.fillStyle = "#655e55";
    context.font = '500 15px "PingFang SC", sans-serif';
    context.fillText(
      `重要度 ${node.importance}  ·  独特性 ${node.uniqueness}`,
      x + 22,
      y + 20,
    );
  });

  context.fillStyle = "#25221f";
  context.font = '700 18px "PingFang SC", sans-serif';
  context.fillText("个人路径", 76, 1120);
  context.fillStyle = "#5c554d";
  context.font = '500 25px "PingFang SC", sans-serif';
  wrapText(context, result.path.join("  →  "), 76, 1163, 1040, 38, 2);

  const scores = [
    ["自我识别度", result.scores.recognition],
    ["个人独特性", result.scores.uniqueness],
    ["城市区分度", result.scores.distinctiveness],
  ] as const;
  scores.forEach(([label, value], index) => {
    const x = 76 + index * 355;
    context.fillStyle = "#777066";
    context.font = '500 16px "PingFang SC", sans-serif';
    context.fillText(label, x, 1285);
    context.fillStyle = "#25221f";
    context.font = '700 42px "Arial", sans-serif';
    context.fillText(String(value), x, 1333);
    context.fillStyle = "#cf4e2b";
    context.fillRect(x, 1354, value * 2.6, 5);
  });

  context.fillStyle = "#777066";
  context.font = '500 18px "PingFang SC", sans-serif';
  context.fillText(result.footnote, 76, 1435);
  context.textAlign = "right";
  context.fillText("八个问题，让一座城在你心里显影", 1124, 1435);
  context.textAlign = "left";

  return canvas;
}

async function createShareFile(result: AnalysisResult) {
  const canvas = drawShareCard(result);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error("Image export failed"));
    }, "image/png");
  });
  return {
    blob,
    file: new File([blob], `${result.city}-城市潜像.png`, { type: "image/png" }),
  };
}

export async function downloadShareCard(result: AnalysisResult) {
  const { blob } = await createShareFile(result);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${result.city}-城市潜像.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function shareResult(
  result: AnalysisResult,
): Promise<"shared" | "downloaded" | "cancelled"> {
  try {
    const { file } = await createShareFile(result);
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `我的${result.city}潜像`,
        text: result.declaration,
        files: [file],
      });
      return "shared";
    }
    await downloadShareCard(result);
    return "downloaded";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    await downloadShareCard(result);
    return "downloaded";
  }
}
