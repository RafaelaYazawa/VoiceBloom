import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bucket = "recordings";

export const convertRecording = async (webmPath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(webmPath);

    if (error || !data) {
      throw new Error(`Error downloading WebM: ${error?.message}`);
    }

    const tempWebm = path.join("/temp", "input.webm");
    const tempMp3 = path.join("/temp", "output.mp3");
    const buffer = Buffer.from(await data.arrayBuffer());
    fs.writeFileSync(tempWebm, buffer);

    console.log("🎵 Converting to MP3 at 192 kbps...");
    execSync(`ffmpeg -i "${tempWebm}" -codec:a libmp3 -b:a 192k "${tempMp3}"`);

    const mp3Buffer = fs.readFileSync(tempMp3);
    const mp3Path = webmPath.replace(".webm", ".mp3");

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(mp3Path, mp3Buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Error uploading MP3: ${uploadError.message}`);
    }

    const { error: updateError } = await supabase
      .from("recordings")
      .update({ audio_url: mp3Path })
      .eq("audio_url", webmPath);

    if (updateError) {
      throw new Error(`Error updating DB: ${updateError.message}`);
    }
    console.log(`✅ Conversion complete: ${webmPath} → ${mp3Path}`);
  } catch (err) {
    console.error("❌ Conversion failed:", err.message);
  }

  const webmPathArg = process.argv[2];
  if (!webmPathArg) {
    console.error("❌ Usage: node scripts/convert-webm-to-mp3.js <webm path>");
    process.exit(1);
  }

  convertRecording(webmPathArg);
};
