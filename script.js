document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const detectionCanvas = document.getElementById('detectionCanvas');
    const legendDiv = document.getElementById('legend');
    let model;

    // Carregar o modelo COCO-SSD
    cocoSsd.load().then(loadedModel => {
        model = loadedModel;
        console.log('Modelo COCO-SSD carregado!');
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.onload = () => {
                    uploadedImage.style.display = 'block';
                    detectionCanvas.style.display = 'block';
                    detectionCanvas.width = uploadedImage.width;
                    detectionCanvas.height = uploadedImage.height;
                    detectObjects(uploadedImage);
                };
                uploadedImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage.src = '#';
            uploadedImage.style.display = 'none';
            detectionCanvas.style.display = 'none';
            legendDiv.innerHTML = '';
        }
    });

    async function detectObjects(img) {
        if (!model) {
            console.log('Modelo ainda não carregado.');
            return;
        }
        const predictions = await model.detect(img);
        console.log('Predições: ', predictions);
        displayPredictions(predictions);
        drawBoundingBoxes(predictions);
    }

    function drawBoundingBoxes(predictions) {
        const ctx = detectionCanvas.getContext('2d');
        ctx.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = '#00bcd4'; // Ciano
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Adicionar legenda nos bounding boxes (opcional)
            ctx.fillStyle = '#00bcd4';
            ctx.fillRect(x, y - 15, ctx.measureText(prediction.class).width + 10, 15);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(prediction.class, x + 5, y);
        });
    }

    function displayPredictions(predictions) {
        legendDiv.innerHTML = '<h3>Objetos Detectados:</h3>';
        if (predictions.length === 0) {
            legendDiv.innerHTML += '<p>Nenhum objeto detectado.</p>';
        } else {
            predictions.forEach(prediction => {
                legendDiv.innerHTML += `<p>${prediction.class} (Confiança: ${(prediction.score * 100).toFixed(2)}%)</p>`;
            });
        }
    }
});