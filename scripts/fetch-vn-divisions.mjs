/**
 * Downloads Vietnam's administrative divisions (34 provinces → wards, in effect
 * since 1/7/2025) into `lib/address/data/`. Run with `pnpm address:update`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = "https://provinces.open-api.vn/api/v2/?depth=2";
const OUT_DIR = join(process.cwd(), "lib", "address", "data");

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`${SOURCE} responded ${response.status}`);
const provinces = await response.json();

const byName = (a, b) => a.name.localeCompare(b.name, "vi");

const provinceList = provinces
  .map(({ code, name }) => ({ code: String(code), name }))
  .sort(byName);

const wards = Object.fromEntries(
  provinces.map((province) => [
    String(province.code),
    province.wards.map(({ code, name }) => ({ code: String(code), name })).sort(byName),
  ]),
);

await mkdir(OUT_DIR, { recursive: true });
await writeFile(join(OUT_DIR, "provinces.json"), `${JSON.stringify(provinceList)}\n`);
await writeFile(join(OUT_DIR, "wards.json"), `${JSON.stringify(wards)}\n`);

const wardCount = Object.values(wards).reduce((sum, list) => sum + list.length, 0);
console.log(`✓ ${provinceList.length} provinces, ${wardCount} wards → lib/address/data`);
