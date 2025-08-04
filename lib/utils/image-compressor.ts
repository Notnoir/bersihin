// Fungsi untuk mengompres gambar jika ukurannya melebihi batas tertentu
export const compressImage = (
  file: File,
  maxSizeMB: number = 2
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Jika ukuran file sudah di bawah batas, tidak perlu kompresi
    if (file.size / 1024 / 1024 < maxSizeMB) {
      resolve(file);
      return;
    }

    // Buat elemen canvas untuk kompresi
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Buat URL objek dari file
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Hapus URL objek setelah gambar dimuat
      URL.revokeObjectURL(url);

      // Hitung rasio aspek untuk mempertahankan proporsi
      const width = img.width;
      const height = img.height;

      // Set ukuran canvas
      canvas.width = width;
      canvas.height = height;

      // Gambar ke canvas
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        // Mulai dengan kualitas tinggi
        const initialQuality = 0.9;
        let compressedFile: File | null = null;

        // Fungsi untuk mengompres dengan kualitas tertentu
        const compress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Gagal mengompres gambar"));
                return;
              }

              compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              // Jika ukuran masih di atas batas dan kualitas > 0.1, kompres lagi
              if (compressedFile.size / 1024 / 1024 > maxSizeMB && q > 0.1) {
                compress(q - 0.1);
              } else {
                console.log(
                  `Gambar dikompresi: ${(file.size / 1024 / 1024).toFixed(
                    2
                  )}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
                );
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            q
          );
        };

        // Mulai kompresi
        compress(initialQuality);
      } else {
        reject(new Error("Gagal membuat konteks canvas"));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memuat gambar untuk kompresi"));
    };

    img.src = url;
  });
};
