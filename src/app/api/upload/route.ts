import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "/public/uploads");

async function ensureDirExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // If directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  await ensureDirExists(uploadsDir);
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || 'general';

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const categoryDir = path.join(uploadsDir, category);
    await ensureDirExists(categoryDir);

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const newPath = path.join(categoryDir, uniqueFilename);
    
    // Convert file to buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(newPath, buffer);

    const publicUrl = `/uploads/${category}/${uniqueFilename}`;
    
    return NextResponse.json({
      message: "File berhasil diunggah.",
      url: publicUrl,
      originalName: file.name,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Gagal mengunggah file.", error: error.message }, { status: 500 });
  }
}
