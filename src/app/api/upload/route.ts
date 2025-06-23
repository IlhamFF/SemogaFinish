import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import formidable, { File } from 'formidable';

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), "/public/uploads");

async function ensureDirExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  await ensureDirExists(uploadsDir);
  
  try {
    const form = formidable({});
    const [fields, files] = await form.parse(request as any);

    const file = (files.file as File[])?.[0];
    const category = (fields.category as string[])?.[0] || 'general';

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const categoryDir = path.join(uploadsDir, category);
    await ensureDirExists(categoryDir);

    const uniqueFilename = `${Date.now()}-${file.originalFilename?.replace(/\s+/g, '_')}`;
    const newPath = path.join(categoryDir, uniqueFilename);
    
    // formidable v3 uses persistent file paths, so we need to move/rename it
    await fs.rename(file.filepath, newPath);

    const publicUrl = `/uploads/${category}/${uniqueFilename}`;
    
    return NextResponse.json({
      message: "File berhasil diunggah.",
      url: publicUrl,
      originalName: file.originalFilename,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Gagal mengunggah file.", error: error.message }, { status: 500 });
  }
}
