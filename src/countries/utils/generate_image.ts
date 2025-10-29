import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export default async function generateImage(
  total_countries: number,
  top_5_countries: { name: string; estimated_gdp: number | null }[],
  last_refreshed_at: Date,
) {
  const formatGdp = (gdp: number | null) => {
    if (gdp === null) return 'N/A';
    return gdp.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const top5List = top_5_countries
    .map(
      (country, index) =>
        `<li>${index + 1}. ${country.name} (${formatGdp(
          country.estimated_gdp,
        )})</li>`,
    )
    .join('');

  const svgString = `
    <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
      <style>
        .container {
          font-family: sans-serif;
          background-color: #0d1117;
          color: #c9d1d9;
          width: 800px;
          height: 450px;
          box-sizing: border-box;
          padding: 30px;
          border-radius: 10px;
        }
        h1 {
          font-size: 28px;
          color: #58a6ff;
          margin: 0 0 20px 0;
        }
        h2 {
          font-size: 20px;
          color: #8b949e;
          margin: 15px 0 10px 0;
        }
        p {
          font-size: 16px;
          color: #c9d1d9;
          margin: 5px 0;
        }
        ul {
          margin: 0;
          padding-left: 30px;
        }
        li {
          font-size: 16px;
          color: #c9d1d9;
          margin: 8px 0;
        }
      </style>
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container">
          <h1>📈 Countries by Estimated GDP</h1>
          
          <p><strong>Total Countries: </strong> ${total_countries}</p>
          <p><strong>Last Refresh Time: </strong> ${last_refreshed_at.toUTCString()}</p>

          <h2>Top 5 Countries by Estimated GDP</h2>
          <ul>
            ${top5List}
          </ul>
        </div>
      </foreignObject>
    </svg>
  `;

  const outputDir = path.resolve(process.cwd(), 'cache');
  const outputPath = path.join(outputDir, 'summary.png');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgString);
  await sharp(svgBuffer).png().toFile(outputPath);

  console.log(`Summary image saved to ${outputPath}`);
}
