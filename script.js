let optimizedImages = [];

async function optimizeImages() {
  const files = document.getElementById('images').files;
  const output = document.getElementById('output');
  const downloadAllBtn = document.getElementById('download-all-btn');
  const previewSection = document.getElementById('preview-section');
  output.innerHTML = '';
  optimizedImages = [];

  if (files.length === 0) {
    output.innerHTML = '<p class="text-red-600">Por favor, selecciona al menos una imagen.</p>';
    return;
  }

  previewSection.classList.remove('hidden');

  for (let file of files) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' });
        const compressedFile = await imageCompression(webpFile, options);

        optimizedImages.push(compressedFile);

        const container = document.createElement('div');
        container.classList.add('aspect-video', 'w-44', 'h-44', 'border', 'rounded', 'overflow-hidden', 'bg-gray-100');

        const optimizedImg = document.createElement('img');
        optimizedImg.src = URL.createObjectURL(compressedFile);
        optimizedImg.classList.add('object-cover', 'w-full', 'h-full', 'rounded-lg', 'shadow-lg');
        container.appendChild(optimizedImg);

        const info = document.createElement('p');
        info.classList.add('text-slate-700', 'text-sm', 'mt-2');
        info.innerText = `Original: ${(file.size / 1024 / 1024).toFixed(2)} MB, Optimizado: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`;
        container.appendChild(info);

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(compressedFile);
        downloadLink.download = compressedFile.name;
        downloadLink.textContent = 'Descargar';
        downloadLink.classList.add('text-blue-600', 'hover:text-blue-800', 'text-sm', 'block', 'mt-1');
        container.appendChild(downloadLink);

        output.appendChild(container);

        if (optimizedImages.length === files.length) {
          downloadAllBtn.classList.remove('hidden');
        }
      }, 'image/webp');
    } catch (error) {
      console.error('Error al optimizar la imagen:', error);
      output.innerHTML += `<p class="text-red-600">Error al optimizar la imagen ${file.name}</p>`;
    }
  }
}

function downloadAll() {
  const zip = new JSZip();
  const imgFolder = zip.folder("optimized");

  optimizedImages.forEach((file) => {
    imgFolder.file(file.name, file, { binary: true });
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const zipDownloadLink = document.createElement('a');
    zipDownloadLink.href = URL.createObjectURL(content);
    zipDownloadLink.download = "optimized.zip";
    zipDownloadLink.click();
  });
}

function handleFileSelect() {
  const fileInput = document.getElementById('images');
  const fileName = document.getElementById('file-name');
  
  if (fileInput.files.length > 0) {
    fileName.textContent = ''; 
    fileName.classList.remove('text-zinc-800');
  } else {
    fileName.textContent = ''; 
  }
}
